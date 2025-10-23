import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface Step3ResultProps {
    result: any;
    paginatedData: any[];
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
    handleExportExcel: () => void;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    reset: () => void;
}

export const Step3Result: React.FC<Step3ResultProps> = ({
                                                            result,
                                                            paginatedData,
                                                            currentPage,
                                                            totalPages,
                                                            rowsPerPage,
                                                            setRowsPerPage,
                                                            setCurrentPage,
                                                            handleExportExcel,
                                                            reset,
                                                            setStep,
                                                        }) => (
    <Card>
        <CardContent>
            <h2 className="text-xl font-semibold mb-2">Шаг 3: Результат</h2>

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
                            className={row.status === 'Не найдено' ? 'bg-red-100' : ''}
                        >
                            <td className="border p-1">
                                {(currentPage - 1) * rowsPerPage + idx + 1}
                            </td>
                            <td className="border p-1">{row.mpn}</td>
                            <td className="border p-1">{row.manufacturer || '-'}</td>
                            <td className="border p-1">{row.seller_name || '-'}</td>
                            <td className="border p-1 text-center">{row.stock || '-'}</td>
                            <td className="border p-1 text-center">
                                {row.requested_quantity ?? '-'}
                            </td>
                            <td className="border p-1 text-center">
                                {row.offer_quantity ?? '-'}
                            </td>
                            <td className="border p-1 text-center">
                                {row.price ? row.price.toFixed(2) : '-'}
                            </td>
                            <td
                                className={`border p-1 text-center font-semibold ${
                                    row.status === 'Не найдено'
                                        ? 'text-red-600'
                                        : 'text-green-600'
                                }`}
                            >
                                {row.status}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
