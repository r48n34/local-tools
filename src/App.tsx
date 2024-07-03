import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/spotlight/styles.css';

import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'react-hot-toast';

import ErrorComp from './components/common/ErrorComp';
import LoadingPage from './components/common/LoadingPage';
import Layout from './components/common/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const ImageConvert = lazy(() => import('./pages/ImageConvert'));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/imageConvert",
                element: <ImageConvert />,
            },
        ]
    }
]);

function App() {
    return (
        <MantineProvider>
            <Toaster position="top-right" />
            <ErrorBoundary fallback={<ErrorComp />}>
                <Suspense fallback={<LoadingPage />}>
                    <RouterProvider router={router} />
                </Suspense>
            </ErrorBoundary>
        </MantineProvider>
    )
}

export default App
