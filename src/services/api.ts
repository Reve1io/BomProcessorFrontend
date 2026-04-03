import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { parseText } from "../utils/parseText";
import { exportExcel, exportExcelKP } from "../utils/excel";
import { waitForBX, sendOfferToBitrix } from "../utils/bitrix";
import { pollStatus } from "./polling";
import { ProcessResponse, StatusResponse, Delimiter } from "./types";
import { adaptSecondApiToRows } from "./secondApiAdapter";
import { adaptThirdApiToRows } from "./thirdApiAdapter";

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
        // Инициализируем объект сразу, чтобы UI начал рендерить пустую таблицу/список
        setResult({ data: [] });

        const preparedData =
            parsedData.length && parsedData[0][0] !== "MPN"
                ? [["MPN", "Qty"], ...parsedData]
                : parsedData;

        const BASE_URL = import.meta.env.VITE_BASE_URL;

        // Функция-помощник для добавления данных, чтобы не дублировать код
        const appendData = (newRows: any[]) => {
            setResult((prev: any) => ({
                ...prev,
                data: [...(prev?.data ?? []), ...newRows],
            }));
            // Выключаем loading, как только пришли первые данные
            setLoading(false);
        };

        // 🔵 1. Первая API (с поллингом)
        const firstApiPromise = fetch(`${BASE_URL}/api/v1/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mapping, data: parsedData, mode }),
        })
            .then(r => r.json())
            .then(async (createJson: ProcessResponse) => {
                const statusUrl = `${BASE_URL}${createJson.check_url}`;
                const finalStatus: StatusResponse = await pollStatus(statusUrl);
                appendData(finalStatus.data);
            })
            .catch(e => console.error("First API error", e));

        // 🟢 2. Вторая API
        const secondApiPromise = fetch(`/proxy.php?target=process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mapping, data: preparedData, mode }),
        })
            .then(r => r.json())
            .then(json => appendData(adaptSecondApiToRows(json)))
            .catch(e => console.error("Second API error", e));

        // 🟣 3. Третья API
        const thirdApiPromise = fetch(`/proxy.php?target=search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mapping, data: preparedData, mode }),
        })
            .then(async r => {
                const text = await r.text();
                return JSON.parse(text);
            })
            .then(json => appendData(adaptThirdApiToRows(json)))
            .catch(e => console.error("Third API error", e));

        Promise.allSettled([firstApiPromise, secondApiPromise, thirdApiPromise]).then(() => {
            setLoading(false); // Окончательно выключаем loading
            console.log("All streams finished");
        });
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


