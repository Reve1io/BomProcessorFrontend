import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

import { ShortTable } from '../tables/ShortTable';
import { FullTable } from '../tables/FullTable';

interface Step3ResultProps {
    mode: "short" | "full";
    result: any;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
    handleExportExcel: () => void;
    reset: () => void;
    handleGetOffer: () => void;
    setStep: (step: number) => void;
}

export const Step3Result: React.FC<Step3ResultProps> = ({
                                                            mode,
                                                            result,
                                                            currentPage,
                                                            setCurrentPage,
                                                            rowsPerPage,
                                                            setRowsPerPage,
                                                            handleExportExcel,
                                                            reset,
                                                            handleGetOffer
                                                        }) => {
    const data = Array.isArray(result?.data) ? result.data : [];

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    const start = (currentPage - 1) * rowsPerPage;
    const paginatedData = data.slice(start, start + rowsPerPage);

    const TableComponent = mode === "short" ? ShortTable : FullTable;

    return (
        <Card>
            <CardContent>
                <h2 className="text-xl font-semibold mb-2">Шаг 3: Результат</h2>

                {/* Настройки */}
                <div className="mb-2 flex items-center gap-2">
                    <label>Отображать по:</label>

                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border rounded p-1"
                    >
                        {[5, 10, 20, 50, 100].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>

                    {mode === "short" ? (
                        <Button onClick={handleGetOffer}>Получить КП</Button>
                    ) : (
                        <Button onClick={handleExportExcel}>Скачать Excel</Button>
                    )}
                </div>

                {/* Таблица */}
                <div className="overflow-auto">
                    <TableComponent data={paginatedData} />
                </div>

                {/* Пагинация */}
                <div className="mt-2 flex justify-between items-center">
                    <div>
                        <Button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Назад
                        </Button>

                        <span className="mx-2">
                            Страница {currentPage} из {totalPages}
                        </span>

                        <Button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                        >
                            Вперёд
                        </Button>
                    </div>

                    <Button onClick={reset} variant="destructive">
                        Новый анализ
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
