import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './App.css';

import { Step1Upload } from '../src/components/steps/Step1Upload';
import { Step2Mapping } from '../src/components/steps/Step2Mapping';
import { Step3Result } from '../src/components/steps/Step3Results';

declare global {
    interface Window {
        BX: any;
        BOM_FORM_DATA?: { name?: string; email?: string; phone?: string };
    }
}

interface BomAppProps {
    mode: "short" | "full";
}

interface FormDataFields {
    name: string;
    email: string;
    comment?: string;
}

export default function BomApp({ mode }: BomAppProps) {
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

    const handleParseText = () => {
        const cleaned = rawData
            .trim()
            .split(/\r?\n/)
            .filter(line => line.trim().length > 0)
            .map(line => line.split(/\t|;/).map(cell => cell.trim()));

        if (cleaned.length === 0) return alert("Нет данных для обработки.");

        console.log("📋 Parsed textarea:", cleaned);

        setParsedData(cleaned);
        setPreviewData(cleaned.slice(0, 5));

        // если первая строка имеет несколько колонок, назначаем первую колонку как partNumber
        if (cleaned[0].length > 0) {
            const defaultMapping: Record<number, string> = {};
            cleaned[0].forEach((_, i) => {
                defaultMapping[i] = "partNumber";
            });
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
                const defaultMapping: Record<number, string> = {};
                jsonData[0].forEach((_, i) => {
                    defaultMapping[i] = "partNumber";
                });
                setMapping(defaultMapping);
            }

            setStep(2);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMappingChange = (colIndex: number, value: string) => {
        setMapping(prev => {
            let newMapping = { ...prev };

            for (const [key, val] of Object.entries(newMapping)) {
                if (val === value && Number(key) !== colIndex) {
                    delete newMapping[key];
                }
            }

            newMapping[colIndex] = value;

            newMapping = { ...newMapping };

            console.log("🗺️ Mapping updated:", newMapping);

            if (
                autoSubmitOnPartNumber &&
                Object.values(newMapping).includes("partNumber") &&
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
                body: JSON.stringify({
                    mapping: currentMapping,
                    data: parsedData,
                    mode: mode,
                }),
            });

            const json = await response.json();
            if (!response.ok) throw new Error(json?.error || response.statusText);
            if (!Array.isArray(json.data)) throw new Error("Некорректный ответ от сервера");

            setResult(json);
            setStep(3);
        } catch (err: any) {
            console.log(`Ошибка при обработке: ${err.message}`);
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

    const handleExportExcelKP = (data: any[]) => {
        if (!data?.length) {
            alert("Нет данных для экспорта");
            return null;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Результаты");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        return new Blob([wbout], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    };

// 1️⃣ Ожидаем, пока BX загрузится
    const waitForBX = (callback: () => void) => {
        if (window.BX) callback();
        else setTimeout(() => waitForBX(callback), 200);
    };

// 2️⃣ Открытие модалки и установка слушателя
    const handleGetOffer = () => {
        waitForBX(() => {
            const modal = new window.BX.PopupWindow("offer_popup", null, {
                content: window.BX("offer-modal"),
                autoHide: false,
                closeByEsc: true,
                closeIcon: { right: "10px", top: "10px" },
                overlay: { backgroundColor: "black", opacity: 60 },
                titleBar: { content: window.BX.create("span", { html: "<b>Запрос КП</b>" }) },
                width: 600,
            });
            modal.show();

            console.log("🟢 Bitrix форма открыта, навешиваем слушатель...");

            const form = document.querySelector('#offer-modal form') as HTMLFormElement | null;

            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault(); // 👈 отменяем стандартный submit

                    console.log("Перехват отправки Bitrix формы, начинаем handleSendOffer()");
                    await handleSendOffer(form);
                }, { once: true });
            } else {
                console.warn("Форма не найдена внутри offer-modal");
            }
        });
    };

    const handleSendOffer = async (form: HTMLFormElement) => {
        try {
            const name = (form.querySelector('input[name="form_text_140"]') as HTMLInputElement)?.value || "";
            const email = (form.querySelector('input[name="form_email_141"]') as HTMLInputElement)?.value || "";
            const phone = (form.querySelector('textarea[name="form_text_142"]') as HTMLTextAreaElement)?.value || "";

            if (!name || !email) {
                alert("Пожалуйста, заполните форму полностью перед отправкой КП");
                return;
            }

            console.log("Полученные данные из формы:", { name, email, phone });

            const excelBlob = await handleExportExcelKP(result.data); // твоя функция
            const payload = new FormData();
            payload.append("name", name);
            payload.append("email", email);
            payload.append("phone", phone);
            payload.append("file", excelBlob, "bom-list.xlsx");

            console.log("Отправляем данные AJAX-запросом...");

            const response = await fetch("/local/ajax/send_offer.php", {
                method: "POST",
                body: payload,
            });

            const json = await response.json();
            console.log("Результат отправки:", json);

            alert(json.success ? "✅ КП отправлено!" : "❌ Ошибка при отправке КП");
        } catch (err) {
            console.error("Ошибка при отправке КП:", err);
            alert("Произошла ошибка при формировании КП");
        }
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
                    mode={mode}
                    result={result}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    handleExportExcel={handleExportExcel}
                    setStep={setStep}
                    handleGetOffer={handleGetOffer}
                    reset={() => {
                        setParsedData([]);
                        setMapping({});
                        setRawData('');
                        setStep(1);
                    }}
                />
            )}
        </div>
    );
}
