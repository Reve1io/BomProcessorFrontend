import React, { useState, useMemo } from 'react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent } from '../src/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../src/components/ui/select"
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";

export default function BomApp() {
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [mapping, setMapping] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoSubmitOnPartNumber] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalRows = result?.data?.length || 0;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const currentRows = result?.data?.slice(startIdx, endIdx) || [];

    const paginatedData = useMemo(() => {
        if (!result?.data || !Array.isArray(result.data)) return [];
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return result.data.slice(start, end);
    }, [result, currentPage, rowsPerPage]);

    const handleParseText = () => {
        const rows = rawData.trim().split('\n').map(r => r.split('\t'));
        setParsedData(rows.slice(0, 5));
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
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log("Parsed Excel:", jsonData.slice(0, 5));
            setParsedData(jsonData.slice(0, 5));
            setStep(2);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMappingChange = (colIndex, value) => {
        setMapping(prev => {
            const newMapping = { ...prev, [colIndex]: value };
            console.log('mapping updated:', newMapping);

            if (autoSubmitOnPartNumber && Object.values(newMapping).includes('partNumber')) {
                if (!loading) {
                    setTimeout(() => {
                        handleProcess(newMapping);
                    }, 200);
                }
            }

            return newMapping;
        });
    };

    const handleProcess = async (manualMapping?: Record<string, string>) => {
        const currentMapping = manualMapping ? { ...manualMapping } : { ...mapping };

        if (!Object.values(currentMapping).includes('partNumber')) {
            alert('Нельзя отправить запрос: необходимо сопоставить поле Part Number.');
            return;
        }

        if (!parsedData || parsedData.length === 0) {
            alert('Нет данных для обработки.');
            return;
        }

        setLoading(true);
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapping: currentMapping, data: parsedData }),
            });

            const data = await response.json();


            if (!response.ok) {
                throw new Error(data?.error || response.statusText);
            }

            if (!data || !Array.isArray(data.data)) {
                throw new Error("Некорректный ответ от сервера");
            }

            setResult(data);
            setStep(3);
        } catch (err) {
            alert(`Ошибка при обработке: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!result || !result.data || result.data.length === 0) {
            alert("Нет данных для экспорта");
            return;
        }

        // Преобразуем данные в формат для xlsx
        const ws = XLSX.utils.json_to_sheet(result.data);

        // Создаём книгу и добавляем лист
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Результаты");

        // Генерируем файл и сохраняем
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        saveAs(blob, "result.xlsx");
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Анализ BOM листа</h1>

            {step === 1 && (
                <Card>
                    <CardContent className="space-y-4">
                        <h2 className="text-xl font-semibold">Шаг 1: Ввод данных</h2>
                        <textarea
                            className="w-full h-48 border p-2 rounded"
                            placeholder="Вставьте данные из Excel или CSV (разделитель — Tab)"
                            value={rawData}
                            onChange={e => setRawData(e.target.value)}
                        />
                        <div>
                            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                        </div>
                        <Button onClick={handleParseText} disabled={!rawData.trim()}>Продолжить</Button>
                    </CardContent>
                </Card>
            )}

            {step === 2 && parsedData.length > 0 && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Шаг 2: Сопоставление колонок</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full border text-sm">
                                <thead>
                                <tr>
                                    {parsedData[0].map((_, i) => (
                                        <th key={i} className="border p-2">
                                            <Select onValueChange={val => handleMappingChange(i, val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите поле" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="partNumber">Part Number</SelectItem>
                                                    <SelectItem value="quantity">Количество</SelectItem>
                                                    <SelectItem value="manufacturer">Производитель</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {parsedData.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="border p-1">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <Button
                                onClick={() => handleProcess()}
                                disabled={!Object.values(mapping).includes('partNumber') || loading}
                            >
                                {loading ? (<><Loader2 className="animate-spin mr-2" /> Обработка...</>) : 'Начать обработку'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setParsedData([]);
                                    setMapping({});
                                    setRawData('');
                                    setStep(1);
                                }}
                            >
                                Загрузить другой файл
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}


            {step === 3 && result?.data && Array.isArray(result.data) && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Шаг 3: Результат</h2>

                        {/* Выбор количества строк на странице */}
                        <div className="mb-2 flex items-center gap-2">
                            <label>Отображать по:</label>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // сброс на первую страницу
                                }}
                                className="border rounded p-1"
                            >
                                {[5, 10, 20, 50, 100].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <Button onClick={handleExportExcel}>Скачать Excel</Button>
                        </div>

                        <div className="overflow-auto">
                            <table className="min-w-full border text-sm">
                                <thead>
                                <tr>
                                    <th className="border p-2 bg-amber-100">#</th>
                                    <th className="border p-2 bg-amber-100">Part Number</th>
                                    <th className="border p-2 bg-amber-100">Производитель</th>
                                    <th className="border p-2 bg-amber-100">Продавец</th>
                                    <th className="border p-2 bg-amber-100">Наличие</th>
                                    <th className="border p-2 bg-amber-100">Запрошено</th>
                                    <th className="border p-2 bg-amber-100">Количество в оффере</th>
                                    <th className="border p-2 bg-amber-100">Цена ($)</th>
                                    <th className="border p-2 bg-amber-100">Статус</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedData.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={row.status === "Не найдено" ? "bg-red-100" : ""}
                                    >
                                        <td className="border p-1">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                                        <td className="border p-1">{row.mpn}</td>
                                        <td className="border p-1">{row.manufacturer || "-"}</td>
                                        <td className="border p-1">{row.seller_name || "-"}</td>
                                        <td className="border p-1 text-center">{row.stock || "-"}</td>
                                        <td className="border p-1 text-center">
                                            {row.requested_quantity ?? "-"}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {row.offer_quantity ?? "-"}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {row.price ? row.price.toFixed(2) : "-"}
                                        </td>
                                        <td
                                            className={`border p-1 text-center font-semibold ${
                                                row.status === "Не найдено" ? "text-red-600" : "text-green-600"
                                            }`}
                                        >
                                            {row.status}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Пагинация */}
                        <div className="mt-2 flex justify-between items-center">
                            <div>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                >
                                    Назад
                                </Button>
                                <span className="mx-2">Страница {currentPage} из {totalPages}</span>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    variant="outline"
                                >
                                    Вперёд
                                </Button>
                            </div>

                            <Button
                                onClick={() => window.location.reload()}
                                variant="destructive"
                            >Новый анализ</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}