import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './App.css';

import { Step1Upload } from '../src/components/steps/Step1Upload';
import { Step2Mapping } from '../src/components/steps/Step2Mapping';
import { Step3Result } from '../src/components/steps/Step3Results';

export default function BomApp() {
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState<any[][]>([]);
    const [previewData, setPreviewData] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<Record<number, string>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [autoSubmitOnPartNumber] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalRows = result?.data?.length || 0;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginatedData = useMemo(() => {
        if (!result?.data || !Array.isArray(result.data)) return [];
        const start = (currentPage - 1) * rowsPerPage;
        return result.data.slice(start, start + rowsPerPage);
    }, [result, currentPage, rowsPerPage]);

    const handleParseText = () => {
        const cleaned = rawData
            .trim()
            .split(/\r?\n/)
            .filter(line => line.trim().length > 0) // убираем пустые строки
            .map(line => line.split(/\t|;/).map(cell => cell.trim())); // поддержка и табов, и точек с запятой

        if (cleaned.length === 0) return alert("Нет данных для обработки.");

        console.log("📋 Parsed textarea:", cleaned);

        setParsedData(cleaned);
        setPreviewData(cleaned.slice(0, 5));

        // если первая строка имеет несколько колонок, назначаем первую колонку как partNumber
        if (cleaned[0].length > 0) {
            const defaultMapping = { 0: "partNumber" };
            setMapping(defaultMapping);
        }

        setStep(2);
    };


    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;

            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            console.log("📄 Parsed Excel:", jsonData);
            setParsedData(jsonData);
            setPreviewData(jsonData.slice(0, 5));

            if (jsonData[0]?.length > 0) {
                const defaultMapping = { 0: 'partNumber' };
                setMapping(defaultMapping);
            }

            setStep(2);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMappingChange = (colIndex: number, value: string) => {
        setMapping(prev => {
            const newMapping = { ...prev, [colIndex]: value };
            console.log('🗺️ Mapping updated:', newMapping);

            if (autoSubmitOnPartNumber &&
                Object.values(newMapping).includes('partNumber') &&
                parsedData.length > 0
            ) {
                if (!loading) {
                    setTimeout(() => handleProcess(newMapping), 200);
                }
            }
            return newMapping;
        });
    };

    const handleProcess = async (manualMapping?: Record<string, string>) => {
        const currentMapping = manualMapping ? { ...manualMapping } : { ...mapping };

        if (!Object.values(currentMapping).includes('partNumber')) {
            return alert('❗ Необходимо выбрать поле Part Number.');
        }

        if (!parsedData.length) {
            return alert('❗ Нет данных для обработки.');
        }

        setLoading(true);
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}/api/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapping: currentMapping, data: parsedData }),
            });

            const json = await response.json();
            if (!response.ok) throw new Error(json?.error || response.statusText);
            if (!Array.isArray(json.data)) throw new Error("Некорректный ответ от сервера");

            setResult(json);
            setStep(3);
        } catch (err: any) {
            alert(`Ошибка при обработке: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!result?.data?.length) {
            return alert("Нет данных для экспорта");
        }
        const ws = XLSX.utils.json_to_sheet(result.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Результаты");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "result.xlsx");
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Анализ BOM листа</h1>

            {step === 1 && (
                <Step1Upload
                    rawData={rawData}
                    setRawData={setRawData}
                    handleParseText={handleParseText}
                    handleFileUpload={handleFileUpload}
                />
            )}

            {step === 2 && parsedData.length > 0 && (
                <Step2Mapping
                    parsedData={parsedData}
                    previewData={previewData}
                    mapping={mapping}
                    loading={loading}
                    handleMappingChange={handleMappingChange}
                    handleProcess={handleProcess}
                    reset={() => {
                        setParsedData([]);
                        setMapping({});
                        setRawData('');
                        setStep(1);
                    }}
                />
            )}

            {step === 3 && result?.data && (
                <Step3Result
                    result={result}
                    //paginatedData={paginatedData}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    handleExportExcel={handleExportExcel}
                    setStep={setStep}
                    //totalPages={totalPages} // <- добавляем
                    reset={() => {
                        setParsedData([]);
                        setMapping({});
                        setRawData('');
                        setStep(1);
                    }} // <- добавляем
                />
            )}
        </div>
    );
}
