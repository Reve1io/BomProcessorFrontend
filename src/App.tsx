import React, { useState } from 'react';
import { Button } from '../src/components/ui/button';
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

export default function BomApp() {
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [mapping, setMapping] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleParseText = () => {
        const rows = rawData.trim().split('\n').map(r => r.split('\t'));
        setParsedData(rows.slice(0, 5));
        setStep(2);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = result instanceof ArrayBuffer ? new Uint8Array(result) : new Uint8Array(result as any);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setParsedData(jsonData.slice(0, 5));
            setStep(2);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMappingChange = (colIndex, value) => {
        setMapping(prev => {
            const newMapping = { ...prev, [colIndex]: value };
            console.log('mapping updated:', newMapping);
            return newMapping;
        });
    };

    const handleProcess = async () => {
        setLoading(true);
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapping, data: parsedData })
            });
            const data = await response.json();
            setResult(data);
            setStep(3);
        } catch (err) {
            alert(`Ошибка при обработке${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">BOM Analyzer</h1>

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
                            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
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
                        <div className="mt-4">
                            <Button
                                onClick={handleProcess}
                                disabled={
                                    !Object.values(mapping).includes('partNumber')
                                    //!Object.values(mapping).includes('quantity')
                                }
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" /> Обработка...
                                    </>
                                ) : (
                                    'Начать обработку'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}


            {step === 3 && result && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Шаг 3: Результат</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full border text-sm">
                                <thead>
                                <tr>
                                    {Object.keys(result.data[0] || {}).map((key, i) => (
                                        <th key={i} className="border p-2 bg-gray-100">{key}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {result.data.map((row, rIdx) => (
                                    <tr key={rIdx} className={row.status === 'Не найдено' ? 'bg-red-100' : ''}>
                                        {Object.values(row).map((val, cIdx) => (
                                            <td key={cIdx} className="border p-1">{val as React.ReactNode}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => window.location.reload()}>Новый анализ</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
