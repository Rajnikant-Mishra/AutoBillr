// src/utils/exportToExcel.js
import * as XLSX from "xlsx";

export const exportToExcel = (data, fileName = "Report.xlsx") => {
  if (!data || !data.length) {
    alert("No Download file is available!");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalFileName);
};