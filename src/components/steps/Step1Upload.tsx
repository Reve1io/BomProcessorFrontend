import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Delimiter} from "../../services/types";

interface Step1InputProps {
    rawData: string;
    setRawData: (value: string) => void;
    delimiter: Delimiter;
    setDelimiter: React.Dispatch<React.SetStateAction<Delimiter>>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleParseText: () => void;
    next: () => void;
    setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const Step1Upload: React.FC<Step1InputProps> = ({
                                                          rawData,
    delimiter,
    setDelimiter,
                                                          setRawData,
                                                          handleFileUpload,
                                                          handleParseText,
                                                           next,
                                                           setStep,
                                                      }) => (
    <Card>
        <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">Шаг 1: Ввод данных</h2>

            <div className="mb-2 flex items-center gap-2">
                <span>Разделитель:</span>
                <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value as Delimiter)}
                    className="border rounded p-1"
                >
                    <option value="tab">TAB (Excel)</option>
                    <option value="space">Пробел</option>
                    <option value="semicolon">;</option>
                    <option value="comma">,</option>
                </select>
            </div>

            <div className="text-xs text-gray-500">
                Если вставляете из Excel — оставьте TAB. Если вводите вручную — выберите "Пробел".
            </div>


            <textarea
                className="textarea w-full h-48 border p-2 rounded"
                placeholder="Вставьте данные из Excel или CSV"
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
            />

            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            <Button
                onClick={() => {
                    handleParseText();
                    next();
                }}
                disabled={!rawData.trim()}>
                Продолжить
            </Button>
        </CardContent>
    </Card>
);
