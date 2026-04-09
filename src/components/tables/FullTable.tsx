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
                <th className="border p-1 bg-amber-100">Все price breaks</th>
                <th className="border p-1 bg-amber-100">Сроки поставки</th>
                <th className="border p-1 bg-amber-100">Цена под кол-во</th>
                <th className="border p-1 bg-amber-100">Целевая закуп</th>
                <th className="border p-1 bg-amber-100">Себестоимость</th>
                <th className="border p-1 bg-amber-100">Целевая продажа</th>
                <th className="border p-1 bg-amber-100">Статус</th>
            </tr>
            </thead>


            <tbody>
            {data.length > 0 ? (
                data.map((row, idx) => {

                    const sortedBreaks = (row.priceBreaks || [])
                        .slice()
                        .sort((a, b) => a.quantity - b.quantity);

                    // 🔥 выбираем правильный priceBreak под запрошенное количество
                    let activeBreak = null;
                    for (const br of sortedBreaks) {
                        if (row.requested_quantity >= br.quantity) {
                            activeBreak = br;
                        }
                    }
                    if (!activeBreak && sortedBreaks.length > 0) {
                        activeBreak = sortedBreaks[0];
                    }

                    return (
                        <tr key={idx}>
                            <td className="border p-1 text-center">{idx + 1}</td>
                            <td className="border p-1">{row.requested_mpn}</td>
                            <td className="border p-1">{row.mpn ?? "-"}</td>
                            <td className="border p-1">{row.manufacturer ?? "-"}</td>
                            <td className="border p-1">{row.seller_name ?? "-"}</td>
                            <td className="border p-1 text-center">{row.stock ?? "-"}</td>
                            <td className="border p-1 text-center">{row.requested_quantity ?? "-"}</td>

                            {/* Все price breaks для понимания */}
                            <td className="border p-1 text-xs">
                                {sortedBreaks.map(b => (
                                    <div key={b.quantity}>
                                        {b.quantity}+ — ${b.price}
                                    </div>
                                ))}
                            </td>

                            <td className="border p-1 text-xs">{row.delivery_time ?? "2-3 недели"}</td>

                            {/* 🔥 Активная цена под количество */}
                            <td className="border p-1 text-center font-semibold">
                                ${activeBreak?.price ?? "-"}
                            </td>

                            <td className="border p-1 text-center">
                                {activeBreak?.target_price_purchasing ?? "-"}
                            </td>

                            <td className="border p-1 text-center">
                                {activeBreak?.cost_with_delivery ?? "-"}
                            </td>

                            <td className="border p-1 text-center">
                                {activeBreak?.target_price_sales ?? "-"}
                            </td>

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
                    );
                })
            ) : (
                <tr>
                    <td colSpan={13} className="text-center text-gray-500">Нет данных</td>
                </tr>
            )}
            </tbody>

        </table>
    );
};
