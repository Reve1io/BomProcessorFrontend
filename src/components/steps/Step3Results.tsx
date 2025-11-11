import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface Step3ResultProps {
    mode: "short" | "full";
    result: any;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
    handleExportExcel: () => void;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    reset: () => void;
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
                                                        }) => {
    // 🔹 Локальная обработка пагинации
    const data = Array.isArray(result?.data) ? result.data : [];
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    const start = (currentPage - 1) * rowsPerPage;
    const paginatedData = data.slice(start, start + rowsPerPage);
    const isShortMode = mode === 'short';

    return (
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
                            <th className="border p-1 bg-amber-100">MPN</th>
                            <th className="border p-1 bg-amber-100">Производитель</th>
                            { isShortMode ? null :
                                <th className="border p-1 bg-amber-100">Поставщик</th>
                            }
                            <th className="border p-1 bg-amber-100">Склад</th>
                            <th className="border p-1 bg-amber-100">Запрошено</th>
                            { isShortMode ? null :
                                <th className="border p-1 bg-amber-100">Кол-во в оффере</th>
                            }
                            <th className="border p-1 bg-amber-100">Цена</th>
                            <th className="border p-1 bg-amber-100">Валюта</th>
                            { isShortMode ? null :
                                <>
                                <th className="border p-1 bg-amber-100">Коэф. доставки</th>
                                <th className="border p-1 bg-amber-100">Наценка</th>
                                <th className="border p-1 bg-amber-100">Целевая (закуп)</th>
                                <th className="border p-1 bg-amber-100">Себестоимость с КД</th>
                                <th className="border p-1 bg-amber-100">Целевая (продажа)</th>
                                </>
                            }
                            <th className="border p-1 bg-amber-100">Статус</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, idx) => (
                                <tr
                                    key={`${row.mpn}-${idx}`}
                                    className={row.status === 'Не найдено' ? 'bg-red-100' : ''}
                                >
                                    <td className="border p-1 text-center">
                                        {(currentPage - 1) * rowsPerPage + idx + 1}
                                    </td>
                                    <td className="border p-1">{row.mpn || '-'}</td>
                                    <td className="border p-1">{row.manufacturer || '-'}</td>
                                    { isShortMode ? null :
                                        <td className="border p-1">{row.seller_name || '-'}</td>
                                    }
                                    <td className="border p-1 text-center">{row.stock ?? '-'}</td>
                                    <td className="border p-1 text-center">{row.requested_quantity ?? '-'}</td>
                                    { isShortMode ? null :
                                        <td className="border p-1 text-center">{row.offer_quantity ?? '-'}</td>
                                    }
                                    <td className="border p-1 text-center">
                                        {typeof row.price === 'number' ? row.price.toFixed(2) : '-'}
                                    </td>
                                    <td className="border p-1 text-center">{row.currency || 'USD'}</td>

                                    { isShortMode ? null :
                                        <><td className="border p-1 text-center">
                                            {row.delivery_coef ? row.delivery_coef.toFixed(2) : '-'}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {row.markup ? row.markup.toFixed(2) : '-'}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {typeof row.target_price_purchasing === 'number'
                                                ? row.target_price_purchasing.toFixed(2)
                                                : '-'}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {typeof row.cost_with_delivery === 'number'
                                                ? row.cost_with_delivery.toFixed(2)
                                                : '-'}
                                        </td>
                                        <td className="border p-1 text-center">
                                            {typeof row.target_price_sales === 'number'
                                                ? row.target_price_sales.toFixed(2)
                                                : '-'}
                                        </td>
                                        </>
                                    }

                                    <td
                                        className={`border p-1 text-center font-semibold ${
                                            row.status === 'Не найдено' ? 'text-red-600' : 'text-green-600'
                                        }`}
                                    >
                                        {row.status || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center text-gray-500">
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
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
};
