import React, { useState } from "react";
import "./App.css";

import { Step1Upload } from "./components/steps/Step1Upload";
import { Step2Mapping } from "./components/steps/Step2Mapping";
import { Step3Result } from "./components/steps/Step3Results";

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
        handleExportExcel, handleGetOffer
    } = useProcessData(mode);

    const reset = () => {
        window.location.reload();
    };

    return (
        <div className="container mx-auto shadow-xl">
            <h1 className="text-2xl font-bold mb-6">Анализ BOM листа</h1>

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
                <Step2Mapping
                    parsedData={parsedData}
                    previewData={previewData}
                    mapping={mapping}
                    loading={loading}
                    handleMappingChange={handleMappingChange}
                    handleProcess={() => handleProcess().then(() => setStep(3))}
                    reset={reset}
                />
            )}

            {step === 3 && result?.data && (
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
            )}
        </div>
    );
}
