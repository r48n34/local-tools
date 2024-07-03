import { Card, Text, Image } from '@mantine/core'

type DisplayCardProps = {
    src?: string;
}

function DisplayImageCard({ src }: DisplayCardProps){

    return (
        <>
        <Card shadow="sm" padding="md" radius="md" withBorder mb={12}>
        
            <Text w={500} fw={300} mb={8}>
                Preview
            </Text>
   
            <Image
                id="img"
                radius="md"
                src={src || null}
            />

        </Card>
        </>
    )
}
    
export default DisplayImageCard
