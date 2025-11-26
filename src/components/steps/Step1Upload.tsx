import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

interface Step1InputProps {
    rawData: string;
    setRawData: (value: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleParseText: () => void;
    next: () => void;
    setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const Step1Upload: React.FC<Step1InputProps> = ({
                                                          rawData,
                                                          setRawData,
                                                          handleFileUpload,
                                                          handleParseText,
                                                           next,
                                                           setStep,
                                                      }) => (
    <Card>
        <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">Шаг 1: Ввод данных</h2>

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
