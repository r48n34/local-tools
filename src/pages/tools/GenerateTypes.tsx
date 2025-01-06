import '@mantine/code-highlight/styles.css';
import { useEffect, useState } from 'react';
import { Container, Textarea, Text } from '@mantine/core';
import { CodeHighlightTabs } from '@mantine/code-highlight';
import { Helmet } from 'react-helmet-async';

import Splitter from '@devbookhq/splitter'
import JsonToTS from 'json-to-ts';

// @ts-ignore
import dJSON from 'dirty-json';
import { IconFileTypeTs, IconTypeface } from '@tabler/icons-react';

function GenerateTypes() {
    const [jsonValue, setJsonValue] = useState<string>("");
    const [finalResult, setFinalResult] = useState<string>("");

    useEffect(() => {

        if (!jsonValue) {
            return;
        }

        try {
            let obj = dJSON.parse(jsonValue);
            let result = JsonToTS(obj);

            let str = result.join("\n");
            setFinalResult(str)
        }
        catch (e: any) {
            setFinalResult("//Invalid input object.")
        }

    }, [jsonValue])

    return (
        <>
            <Helmet>
                <title>Typescript Interface Generate | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconFileTypeTs size={30} /> Typescript Interface Generate
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed' mb={36}>
                    Turn Your json / ts object to TS interface
                </Text>

                <Splitter>

                    <div>
                        <Text size="md" mb={6} w={400} c="dimmed">
                            Your object
                        </Text>

                        <Textarea
                            value={jsonValue}
                            onChange={(event) => setJsonValue(event.currentTarget.value)}
                            placeholder="Copy your object."
                            autosize
                            minRows={4}
                        />
                    </div>

                    <div>
                        <Text size="md" mb={6} ml={4} w={400} c="dimmed">
                            Result
                        </Text>

                        <CodeHighlightTabs
                            code={[
                                {
                                    fileName: 'Type.ts',
                                    code: finalResult,
                                    language: 'tsx',
                                    icon: <IconTypeface size={16}/>,
                                }
                            ]}
                        />
                    </div>

                </Splitter>

            </Container>
        </>
    )
}

export default GenerateTypes
