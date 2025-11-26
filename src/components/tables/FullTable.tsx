import React from "react";

export const FullTable = ({ data }) => {
    return (
        <table className="min-w-full border text-sm">
            <thead>
            <tr>
                <th className="border p-1 bg-amber-100">#</th>
                <th className="border p-1 bg-amber-100">Запрошенный MPN</th>
                <th className="border p-1 bg-amber-100">MPN</th>
                <th className="border p-1 bg-amber-100">Производитель</th>
                <th className="border p-1 bg-amber-100">Поставщик</th>
                <th className="border p-1 bg-amber-100">Склад</th>
                <th className="border p-1 bg-amber-100">Запрошено</th>
                <th className="border p-1 bg-amber-100">Кол-во оффер</th>
                <th className="border p-1 bg-amber-100">Цена</th>
                <th className="border p-1 bg-amber-100">Валюта</th>
                <th className="border p-1 bg-amber-100">Коэф. доставки</th>
                <th className="border p-1 bg-amber-100">Наценка</th>
                <th className="border p-1 bg-amber-100">Целевая закуп</th>
                <th className="border p-1 bg-amber-100">Себестоимость</th>
                <th className="border p-1 bg-amber-100">Целевая продажа</th>
                <th className="border p-1 bg-amber-100">Статус</th>
            </tr>
            </thead>

            <tbody>
            {data.length > 0 ? (
                data.map((row, idx) => (
                    <tr key={idx}>
                        <td className="border p-1 text-center">{idx + 1}</td>
                        <td className="border p-1">{row.requested_mpn}</td>
                        <td className="border p-1">{row.mpn}</td>
                        <td className="border p-1">{row.manufacturer}</td>
                        <td className="border p-1">{row.seller_name}</td>
                        <td className="border p-1 text-center">{row.stock}</td>
                        <td className="border p-1 text-center">{row.requested_quantity}</td>
                        <td className="border p-1 text-center">{row.offer_quantity}</td>
                        <td className="border p-1 text-center">
                            {typeof row.price === "number" ? row.price.toFixed(2) : "-"}
                        </td>
                        <td className="border p-1 text-center">{row.currency}</td>
                        <td className="border p-1 text-center">{row.delivery_coef ?? "-"}</td>
                        <td className="border p-1 text-center">{row.markup ?? "-"}</td>
                        <td className="border p-1 text-center">{row.target_price_purchasing ?? "-"}</td>
                        <td className="border p-1 text-center">{row.cost_with_delivery ?? "-"}</td>
                        <td className="border p-1 text-center">{row.target_price_sales ?? "-"}</td>
                        <td
                            className={`border p-1 text-center ${
                                row.status?.toLowerCase() === "найдено"
                                    ? "text-green-600"
                                    : row.status?.toLowerCase() === "не найдено"
                                        ? "text-red-600"
                                        : ""
                            }`}
                        >
                            {row.status}
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={15} className="text-center text-gray-500">Нет данных</td>
                </tr>
            )}
            </tbody>
        </table>
    );
};
