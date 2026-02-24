import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { parseText } from "../utils/parseText";
import { exportExcel, exportExcelKP } from "../utils/excel";
import { waitForBX, sendOfferToBitrix } from "../utils/bitrix";
import { pollStatus } from "./polling";
import { ProcessResponse, StatusResponse, Delimiter } from "./types";
import { adaptSecondApiToRows } from "./secondApiAdapter";

export function useProcessData(mode: "short" | "full") {
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState("");
    const [delimiter, setDelimiter] = useState<Delimiter>("tab");
    const [parsedData, setParsedData] = useState<any[][]>([]);
    const [previewData, setPreviewData] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<Record<number, string>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const clearError = useCallback(() => {
        setErrorMessage(null);
    }, []);

    const handleParseText = () => {
        const cleaned = parseText(rawData, delimiter);
        if (!cleaned.length) return alert("Нет данных");

        setParsedData(cleaned);
        setPreviewData(cleaned.slice(0, 5));

        const map: Record<number, string> = {};
        cleaned[0].forEach((_, i) => (map[i] = "partNumber"));
        setMapping(map);
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

            if (!jsonData || !jsonData.length) {
                alert("Файл пустой или некорректный");
                return;
            }

            setParsedData(jsonData);
            setRawData(jsonData.map(row => row.join('\t')).join('\n'));
            setPreviewData(jsonData.slice(0, 5));

            if (jsonData[0].length > 0) {
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


    const handleMappingChange = (col: number, value: string) => {
        setMapping(prev => ({ ...prev, [col]: value }));
    };

    const handleProcess = async () => {
        if (!parsedData.length) {
            setErrorMessage("Нет данных для обработки");
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        setResult({ data: [] }); // сразу очищаем

        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const SECOND_API = import.meta.env.VITE_SECOND_API;

            // 🔵 Запуск первой API (как было)
            const createRes = await fetch(`${BASE_URL}/api/v1/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mapping, data: parsedData, mode }),
            });

            const createJson: ProcessResponse = await createRes.json();
            const statusUrl = `${BASE_URL}${createJson.check_url}`;

            // 🟢 Запуск второй API ПАРАЛЛЕЛЬНО
            const secondApiPromise = fetch(`${SECOND_API}/api/v1/ru/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mapping, data: parsedData, mode }),
            })
                .then(r => r.json())
                .then(json => {
                    const rows = adaptSecondApiToRows(json);

                    // 👉 строки появляются сразу в таблице
                    setResult(prev => ({
                        data: [...(prev?.data ?? []), ...rows],
                    }));
                })
                .catch(e => console.error("Second API error", e));

            // 🔵 Poll первой API как раньше
            const finalStatus: StatusResponse = await pollStatus(statusUrl);

            setResult(prev => ({
                data: [...(prev?.data ?? []), ...finalStatus.data],
            }));

            await secondApiPromise;

        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Неизвестная ошибка";

            setErrorMessage(message);
            console.error("Process error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => exportExcel(result?.data);

    const handleGetOffer = () =>
        waitForBX(() => sendOfferToBitrix(result?.data));

    return {
        rawData, setRawData,
        delimiter, setDelimiter,
        parsedData, previewData,
        mapping, loading,
        result,
        currentPage, rowsPerPage,
        setCurrentPage, setRowsPerPage,
        handleParseText,
        handleFileUpload,
        handleMappingChange,
        handleProcess,
        handleExportExcel,
        handleGetOffer,
        errorMessage,
        clearError,
    };
}
