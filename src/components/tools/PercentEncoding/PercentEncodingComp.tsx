import { Box, Divider, Grid, Group, PasswordInput, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import CopyBtn from "../../common/CopyBtn";
import { specialCharactersStr } from "../../../utils/specialCharacters";
import GoUrlBtn from "../../common/GoUrlBtn";
import { IconQuestionMark } from "@tabler/icons-react";


function PercentEncodingComp() {
    const [inputString, setInputString] = useState<string>("");
    const [decodedStr, setDecodedStr] = useState<string>("");

    useEffect(() => {
        try {
            setDecodedStr(decodeURIComponent(inputString))
        } catch (error) {
            setDecodedStr("<Error - Not valid UTF-8 encoded URI>")
        }
    }, [inputString])

    return (
        <>
            <PasswordInput
                label="Input String"
                description="Your String to encode"
                placeholder="Input Str"
                value={inputString}
                onChange={(event) => setInputString(event.currentTarget.value)}
            />

            <Text fw={500} fz={14} mt={36}>
                Output
            </Text>

            <Divider my="lg" />

            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <PasswordInput
                            label="Percenten Coding"
                            description="For MySQL, PostgreSQL, CockroachDB and URL"
                            value={encodeURIComponent(inputString)}
                        />

                        <Group justify="flex-end" mt={6}>
                            <GoUrlBtn
                                title={"Know More"}
                                url={"https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding"}
                                icon={<IconQuestionMark size={18} />}
                            />
                            <CopyBtn value={encodeURIComponent(inputString)} />
                        </Group>
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <PasswordInput
                            label="Percenten Coding (Decoded)"
                            description="For MySQL, PostgreSQL, CockroachDB and URL"
                            value={decodedStr}
                        />

                        <Group justify="flex-end" mt={6}>
                            <GoUrlBtn
                                title={"Know More"}
                                url={"https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding"}
                                icon={<IconQuestionMark size={18} />}
                            />
                            <CopyBtn value={decodedStr} />
                        </Group>
                    </Box>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Box>
                        <PasswordInput
                            label="Escape of special characters"
                            description="For MS SQL"
                            value={specialCharactersStr(inputString)}
                        />

                        <Group justify="flex-end" mt={6}>
                            <GoUrlBtn
                                title={"Know More"}
                                url={"https://learn.microsoft.com/en-us/sql/relational-databases/json/how-for-json-escapes-special-characters-and-control-characters-sql-server?view=sql-server-ver16"}
                                icon={<IconQuestionMark size={18} />}
                            />
                            <CopyBtn value={specialCharactersStr(inputString)} />
                        </Group>
                    </Box>
                </Grid.Col>
            </Grid>


        </>
    )
}

export default PercentEncodingComp
