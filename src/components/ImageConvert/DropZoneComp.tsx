import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import toast from 'react-hot-toast';

type DropZoneCompProps = {
    setFilesCb: (files: FileWithPath[]) => void;
}

function DropZoneComp({ setFilesCb, ...props }: DropZoneCompProps) {
    return (
        <Dropzone
            onDrop={(files) => {
                setFilesCb(files);
                toast.success(`Success to upload ${files.length} images`)
            }}
            onReject={(files) => console.log("Failed file", files)}
            maxSize={500 * 1024 ** 2}
            accept={["image/png", "image/jpeg", "image/bmp", "image/tiff", "image/gif", "image/webp"]}
            {...props}
        >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                    <IconUpload
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                        stroke={1.5}
                    />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <IconX
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                        stroke={1.5}
                    />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <IconPhoto
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                        stroke={1.5}
                    />
                </Dropzone.Idle>

                <div>
                    <Text size="xl" inline>
                        Drag images here or click to select files
                    </Text>
                    <Text size="md" c="dimmed" inline mt={7}>
                        Accepted: png, jpeg, bmp, tiff, gif, webp
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={12}>
                        Attach as many images as you like
                    </Text>
                </div>
            </Group>
        </Dropzone>
    )
}

export default DropZoneComp
