import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Loader2 } from 'lucide-react';

interface Step2MappingProps {
    parsedData: any[][];
    previewData: any[][];
    mapping: Record<string, string>;
    handleMappingChange: (colIndex: number, value: string) => void;
    handleProcess: () => void;
    loading: boolean;
    reset: () => void;
}

export const Step2Mapping: React.FC<Step2MappingProps> = ({
                                                              parsedData,
                                                              previewData,
                                                              mapping,
                                                              handleMappingChange,
                                                              handleProcess,
                                                              loading,
                                                              reset,
                                                          }) => (
    <Card>
        <CardContent>
            <h2 className="text-xl font-semibold mb-2">Шаг 2: Сопоставление колонок</h2>
            <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                    <thead>
                    <tr>
                        {parsedData[0].map((_, i) => (
                            <th key={i} className="border p-2">
                                <Select
                                    value={mapping[i] || 'partNumber'}
                                    onValueChange={val => handleMappingChange(i, val)}>
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
                    {previewData.map((row, rIdx) => (
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
                    onClick={reset}
                >
                    Загрузить другой файл
                </Button>
            </div>
        </CardContent>
    </Card>
);
