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


type MonthlyAttendanceExport = {
  className: string
  monthLabel: string
  fileName: string
  schoolName?: string
  schoolAddress?: string
  dates: string[]
  rows: {
    no: number
    name: string
    statuses: string[]
    totals: { H: number; S: number; I: number; A: number }
  }[]
  principalName?: string
  principalNip?: string
  homeroomTeacher?: string
  homeroomTeacherNip?: string
}

export async function exportMonthlyAttendanceToExcel(data: MonthlyAttendanceExport) {
  const XLSX = await import("xlsx")
  const dayHeaders = data.dates.map(date => String(Number(date.slice(-2))))
  const headers = ["No", "Nama Siswa", ...dayHeaders, "H", "S", "I", "A"]

  const rows = data.rows.map(row => [
    row.no,
    row.name,
    ...row.statuses,
    row.totals.H,
    row.totals.S,
    row.totals.I,
    row.totals.A,
  ])

  const aoa: ExportCell[][] = [
    [data.schoolName || "SEKOLAH"],
    ["REKAP ABSENSI SISWA BULANAN"],
    [`Kelas: ${data.className}`],
    [`Bulan: ${data.monthLabel}`],
    [],
    headers,
    ...rows,
    [],
    ["Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa"],
    [],
    ["Mengetahui,", "", "", "Wali Kelas"],
    ["Kepala Sekolah", "", "", ""],
    [],
    [],
    [data.principalName || "(................................)", "", "", data.homeroomTeacher || "(................................)"],
    [data.principalNip ? `NIP. ${data.principalNip}` : "NIP. ........................", "", "", data.homeroomTeacherNip ? `NIP. ${data.homeroomTeacherNip}` : "NIP. ........................"],
  ]

  const sheet = XLSX.utils.aoa_to_sheet(aoa)
  sheet["!cols"] = [
    { wch: 5 },
    { wch: 28 },
    ...dayHeaders.map(() => ({ wch: 4 })),
    { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Rekap Bulanan")
  XLSX.writeFile(workbook, `${safeFileName(data.fileName)}.xlsx`)
}

export async function exportMonthlyAttendanceToPdf(data: MonthlyAttendanceExport) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const autoTable = autoTableModule.default
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(data.schoolName || "REKAP ABSENSI SISWA", pageWidth / 2, 11, { align: "center" })
  doc.setFontSize(11)
  doc.text("REKAP ABSENSI SISWA BULANAN", pageWidth / 2, 17, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(`Kelas: ${data.className}`, 10, 24)
  doc.text(`Bulan: ${data.monthLabel}`, 10, 29)
  if (data.schoolAddress) doc.text(data.schoolAddress, pageWidth - 10, 24, { align: "right" })

  const dayHeaders = data.dates.map(date => String(Number(date.slice(-2))))
  const headers = ["No", "Nama Siswa", ...dayHeaders, "H", "S", "I", "A"]
  const body = data.rows.map(row => [
    row.no,
    row.name,
    ...row.statuses,
    row.totals.H,
    row.totals.S,
    row.totals.I,
    row.totals.A,
  ])

  const dateStartIndex = 2
  const columnStyles: Record<number, any> = {
    0: { cellWidth: 7, halign: "center" },
    1: { cellWidth: 38 },
  }
  for (let i = 0; i < dayHeaders.length; i++) {
    columnStyles[dateStartIndex + i] = { cellWidth: 5.2, halign: "center" }
  }
  for (let i = 0; i < 4; i++) {
    columnStyles[dateStartIndex + dayHeaders.length + i] = { cellWidth: 6.5, halign: "center" }
  }

  autoTable(doc, {
    startY: 34,
    head: [headers],
    body,
    styles: {
      fontSize: 5.5,
      cellPadding: 0.8,
      lineWidth: 0.1,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [250, 204, 21],
      textColor: [31, 41, 55],
      fontStyle: "bold",
    },
    columnStyles,
    margin: { left: 8, right: 8 },
    theme: "grid",
  })

  const lastTable = (doc as any).lastAutoTable
  let y = (lastTable?.finalY || 40) + 7

  if (y > doc.internal.pageSize.getHeight() - 42) {
    doc.addPage("a4", "landscape")
    y = 18
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text("Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa", 10, y)
  y += 9

  const leftX = 45
  const rightX = pageWidth - 45

  doc.setFontSize(8)
  doc.text("Mengetahui,", leftX, y, { align: "center" })
  doc.text("Wali Kelas", rightX, y, { align: "center" })
  y += 5
  doc.text("Kepala Sekolah", leftX, y, { align: "center" })

  y += 20
  doc.setFont("helvetica", "bold")
  doc.text(data.principalName || "(................................)", leftX, y, { align: "center" })
  doc.text(data.homeroomTeacher || "(................................)", rightX, y, { align: "center" })

  doc.setFont("helvetica", "normal")
  y += 5
  doc.text(data.principalNip ? `NIP. ${data.principalNip}` : "NIP. ........................", leftX, y, { align: "center" })
  doc.text(data.homeroomTeacherNip ? `NIP. ${data.homeroomTeacherNip}` : "NIP. ........................", rightX, y, { align: "center" })

  doc.save(`${safeFileName(data.fileName)}.pdf`)
}
