import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/spotlight/styles.css';

import { HelmetProvider } from 'react-helmet-async';

import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'react-hot-toast';

import ErrorComp from './components/common/ErrorComp';
import LoadingPage from './components/common/LoadingPage';
import Layout from './components/common/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const ImageConvert = lazy(() => import('./pages/tools/ImageConvert'));
const ImageConvertPDF = lazy(() => import('./pages/tools/ImageConvertPDF'));
const PdfConvertImage = lazy(() => import('./pages/tools/PdfConvertImage'));
const ScanQR = lazy(() => import('./pages/tools/ScanQR'));
const QRmaker = lazy(() => import('./pages/tools/QRmaker'));
const ScanDocs = lazy(() => import('./pages/tools/ScanDocs'));

const GenerateTypes = lazy(() => import('./pages/tools/GenerateTypes'));

export const mainRouteObj = [
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/legal",
                element: <LegalPage />,
            },
            {
                path: "/imageConvert",
                element: <ImageConvert />,
            },
            {
                path: "/imageConvertPDF",
                element: <ImageConvertPDF />,
            },
            {
                path: "/pdfConvertImages",
                element: <PdfConvertImage />,
            },
            {
                path: "/scanQR",
                element: <ScanQR />,
            },
            {
                path: "/scanDocs",
                element: <ScanDocs />,
            },
            {
                path: "/makeQR",
                element: <QRmaker />,
            },
            {
                path: "/types",
                element: <GenerateTypes />,
            },
        ]
    }
]

const router = createBrowserRouter(mainRouteObj);

function App() {
    return (
        <HelmetProvider>
            <MantineProvider>
                <Toaster position="top-right" />
                <ErrorBoundary fallback={<ErrorComp />}>
                    <Suspense fallback={<LoadingPage />}>
                        <RouterProvider router={router} />
                    </Suspense>
                </ErrorBoundary>
            </MantineProvider>
        </HelmetProvider>
    )
}

export default App
