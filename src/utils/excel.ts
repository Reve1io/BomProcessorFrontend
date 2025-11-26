import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportExcel(rows: any[]) {
    if (!rows?.length) return alert("Нет данных");

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Результаты");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), "result.xlsx");
}

export function exportExcelKP(rows: any[]) {
    if (!rows?.length) return null;

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Результаты");

    return new Blob(
        [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
}
