import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';

import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'react-hot-toast';
import ErrorComp from './components/ErrorComp';
import LoadingPage from './components/LoadingPage';

const UploadForm = lazy(() => import('./pages/UploadFormComp'));

const router = createBrowserRouter([
    {
      path: "/",
      element: <UploadForm />,
    },
]);

function App() {
    return (
        <MantineProvider>
            <Toaster position="top-right" />
            <ErrorBoundary fallback={<ErrorComp/>}>
                <Suspense fallback={<LoadingPage />}>
                    <RouterProvider router={router} />
                </Suspense>
            </ErrorBoundary>
        </MantineProvider>
    )
}

export default App
