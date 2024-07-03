import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';
import { Container, MantineProvider } from '@mantine/core';

import UploadFormComp from './components/UploadFormComp';

function App() {
    return (
        <MantineProvider>
            <Container size={"lg"}>
            <UploadFormComp/>
            </Container>
        </MantineProvider>
    )
}

export default App
