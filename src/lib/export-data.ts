'use client'

type ExportCell = string | number | null | undefined

type ExportOptions = {
  title: string
  fileName: string
  headers: string[]
  rows: ExportCell[][]
  subtitle?: string
}

function safeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase()
}

export async function exportRowsToExcel({
  title,
  fileName,
  headers,
  rows,
  subtitle,
}: ExportOptions) {
  const XLSX = await import("xlsx")

  const metadata: ExportCell[][] = [
    [title],
    ...(subtitle ? [[subtitle]] : []),
    ["Diekspor", new Date().toLocaleString("id-ID")],
    [],
  ]

  const sheet = XLSX.utils.aoa_to_sheet([
    ...metadata,
    headers,
    ...rows,
  ])

  const headerRow = metadata.length
  sheet["!cols"] = headers.map((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map(row => String(row[index] ?? "").length)
    )
    return { wch: Math.min(Math.max(maxLength + 2, 10), 40) }
  })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Data")
  XLSX.writeFile(workbook, `${safeFileName(fileName)}.xlsx`)

  return headerRow
}

export async function exportRowsToPdf({
  title,
  fileName,
  headers,
  rows,
  subtitle,
}: ExportOptions) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])

  const autoTable = autoTableModule.default
  const landscape = headers.length > 5
  const doc = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text(title, 14, 16)

  let y = 22
  if (subtitle) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text(subtitle, 14, y)
    y += 6
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, y)

  autoTable(doc, {
    startY: y + 5,
    head: [headers],
    body: rows.map(row => row.map(cell => String(cell ?? ""))),
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [250, 204, 21],
      textColor: [31, 41, 55],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [255, 251, 235],
    },
    margin: { left: 10, right: 10 },
  })

  doc.save(`${safeFileName(fileName)}.pdf`)
}
