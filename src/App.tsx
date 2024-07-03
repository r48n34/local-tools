import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';
import { Container, MantineProvider } from '@mantine/core';

import UploadFormComp from './components/UploadFormComp';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <MantineProvider>
            <Toaster/>
            <Container size={"lg"}>
            <UploadFormComp/>
            </Container>
        </MantineProvider>
    )
}

export default App
