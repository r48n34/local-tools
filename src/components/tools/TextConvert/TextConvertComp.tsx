import { Textarea, Divider, Text, Grid, Box } from "@mantine/core";
import { useState } from "react";
import CopyBtn from "../../common/CopyBtn";
import { capitalizeFirstLetterSentences, chaosLetter, lowerFirstLetterSentences } from "../../../utils/textConvert";

function TextConvertComp() {

    const [inputString, setInputString] = useState<string>("");

    return (
        <>
            <Textarea
                label="Input String"
                description="Your String to convert"
                placeholder="Input String"
                value={inputString}
                onChange={(event) => setInputString(event.currentTarget.value)}
                autosize
                minRows={4}
                maxRows={6}
            />

            <Text fw={500} fz={14} mt={36}>
                Output
            </Text>

            <Divider my="lg" />

            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="🔼 Upper Case"
                            description="All Upper Case Letters"
                            value={inputString.toUpperCase()}
                            rightSection={<CopyBtn value={inputString.toUpperCase()} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="🔼 First Letter Upper"
                            description="Each Word First Letter Will Be Upper"
                            value={capitalizeFirstLetterSentences(inputString)}
                            rightSection={<CopyBtn value={capitalizeFirstLetterSentences(inputString)} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="🔽 Lower Case"
                            description="All Upper Case Letters"
                            value={inputString.toLowerCase()}
                            rightSection={<CopyBtn value={inputString.toLowerCase()} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="🔽 First Letter Lower"
                            description="Each Word First Letter Will Be Lower"
                            value={lowerFirstLetterSentences(inputString)}
                            rightSection={<CopyBtn value={lowerFirstLetterSentences(inputString)} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="⏭️ Well Trim"
                            description="Remove All Unnecessary Spacing (Start, End, Middle Multi-spacing)"
                            value={inputString.replace(/ +(?= )/g, '').split("\n").map( v => v.trim()).join("\n").trim()}
                            rightSection={<CopyBtn value={inputString.replace(/ +(?= )/g, '').split("\n").map( v => v.trim()).join("\n").trim()} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <Textarea
                            label="🌀 Chaos"
                            description="Random Upper & Lower Letters"
                            value={chaosLetter(inputString)}
                            rightSection={<CopyBtn value={chaosLetter(inputString)} />}
                            autosize
                            minRows={4}
                            maxRows={6}
                        />
                    </Box>
                </Grid.Col>


            </Grid>
        </>
    )
}

export default TextConvertComp
