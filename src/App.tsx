import React, { useState } from "react";
import "./App.css";

import { Step1Upload } from "./components/steps/Step1Upload";
import { Step2Mapping } from "./components/steps/Step2Mapping";
import { Step3Result } from "./components/steps/Step3Results";

import { ErrorBoundary} from "./components/error/ErrorBoundary";
import {ApiErrorAlert} from "./components/error/ApiErrorAlert";
import { LoadingErrorWrapper} from "./components/error/LoadingErrorWrapper";

import { useProcessData } from "./services/api";

interface BomAppProps {
    mode: "short" | "full";
}

export default function App({ mode }: BomAppProps) {
    const [step, setStep] = useState(1);

    const {
        rawData, setRawData,
        parsedData, previewData,
        mapping, loading,
        result,
        currentPage, rowsPerPage,
        setCurrentPage, setRowsPerPage,
        handleParseText, handleFileUpload,
        handleMappingChange, handleProcess,
        handleExportExcel, handleGetOffer,
        errorMessage, clearError
    } = useProcessData(mode);

    const handleProcessWithStep = async () => {
        await handleProcess();
        if (!errorMessage) {
            setStep(3);
        }
    };

    const reset = () => {
        window.location.reload();
    };

    const handleDismissError = () => {
        clearError?.();
    };

    const errorFallback = (
        <div className="error-boundary-fallback">
            <h2>Произошла критическая ошибка</h2>
            <p>Приложение не может продолжить работу</p>
            <button
                onClick={() => window.location.reload()}
                className="refresh-button"
            >
                Обновить страницу
            </button>
        </div>
    );

    return (
        <ErrorBoundary fallback={errorFallback}>
        <div className="container mx-auto shadow-xl">
            <h1 className="text-2xl font-bold mb-6">Анализ BOM листа</h1>

            {errorMessage && (
                <div className="mb-6">
                    <ApiErrorAlert
                        error={errorMessage}
                        onRetry={handleProcess}
                        onDismiss={handleDismissError}
                        reset={reset}
                        retryText="Повторить обработку"
                        dismissText="Назад"
                    />
                </div>
            )}

            {step === 1 && (
                <Step1Upload
                    rawData={rawData}
                    setRawData={setRawData}
                    handleParseText={handleParseText}
                    handleFileUpload={handleFileUpload}
                    next={() => setStep(2)}
                    setStep={setStep}
                />
            )}

            {step === 2 && parsedData.length > 0 && (
                <LoadingErrorWrapper
                    isLoading={loading}
                    error={null}
                    onRetry={handleProcessWithStep}
                >
                <Step2Mapping
                    parsedData={parsedData}
                    previewData={previewData}
                    mapping={mapping}
                    loading={loading}
                    handleMappingChange={handleMappingChange}
                    handleProcess={() => handleProcess().then(() => setStep(3))}
                    reset={reset}
                />
                </LoadingErrorWrapper>
            )}

            {step === 3 && result?.data && (
                <ErrorBoundary>
                <Step3Result
                    mode={mode}
                    result={result}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    handleExportExcel={handleExportExcel}
                    handleGetOffer={handleGetOffer}
                    reset={reset}
                    setStep={setStep}
                />
                </ErrorBoundary>
            )}
        </div>
        </ErrorBoundary>
    );
}
