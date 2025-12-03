import jsPDF from "jspdf"

interface PdfRow {
  label: string
  value: string
}

interface PdfSection {
  title: string
  rows: PdfRow[]
}

interface PdfHeader {
  titulo: string
  subtitulo?: string
  metadata?: string[]
}

interface PdfPayload {
  header: PdfHeader
  sections: PdfSection[]
  voucherImage?: string | null
  filename?: string
}

const PAGE_MARGIN_X = 20
const PAGE_MARGIN_Y = 20
const CONTENT_WIDTH = 210 - PAGE_MARGIN_X * 2
const LABEL_WIDTH = 60
const VALUE_WIDTH = CONTENT_WIDTH - LABEL_WIDTH
const LINE_HEIGHT = 6

const getImageFormat = (dataUrl: string): "PNG" | "JPEG" | "WEBP" => {
  if (dataUrl.startsWith("data:image/png")) return "PNG"
  if (dataUrl.startsWith("data:image/webp")) return "WEBP"
  return "JPEG"
}

const ensurePageSpace = (doc: jsPDF, nextHeight: number, currentY: number): number => {
  const bottomLimit = doc.internal.pageSize.getHeight() - PAGE_MARGIN_Y
  if (currentY + nextHeight <= bottomLimit) {
    return currentY
  }
  doc.addPage()
  return PAGE_MARGIN_Y
}

const drawSection = (doc: jsPDF, section: PdfSection, startY: number): number => {
  let currentY = ensurePageSpace(doc, LINE_HEIGHT, startY)

  const drawTitle = (text: string) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(text, PAGE_MARGIN_X, currentY)
    currentY += LINE_HEIGHT
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
  }

  drawTitle(section.title)

  for (const row of section.rows) {
    const labelLines = doc.splitTextToSize(row.label, LABEL_WIDTH - 4)
    const valueLines = doc.splitTextToSize(row.value, VALUE_WIDTH - 4)
    const lines = Math.max(labelLines.length, valueLines.length)
    const rowHeight = Math.max(lines * LINE_HEIGHT, LINE_HEIGHT)

    const nextY = ensurePageSpace(doc, rowHeight, currentY)
    if (nextY !== currentY) {
      currentY = nextY
      drawTitle(`${section.title} (cont.)`)
    }

    doc.rect(PAGE_MARGIN_X, currentY, LABEL_WIDTH, rowHeight)
    doc.rect(PAGE_MARGIN_X + LABEL_WIDTH, currentY, VALUE_WIDTH, rowHeight)

    labelLines.forEach((line: string, index: number) => {
      const y = currentY + LINE_HEIGHT * (index + 0.75)
      doc.text(line, PAGE_MARGIN_X + 2, y)
    })

    valueLines.forEach((line: string, index: number) => {
      const y = currentY + LINE_HEIGHT * (index + 0.75)
      doc.text(line, PAGE_MARGIN_X + LABEL_WIDTH + 2, y)
    })

    currentY += rowHeight
  }

  currentY += LINE_HEIGHT / 2
  return currentY
}

export function generateComprobanteInscripcionPdf(payload: PdfPayload) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  let currentY = PAGE_MARGIN_Y

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(payload.header.titulo, 105, currentY, { align: "center" })
  currentY += LINE_HEIGHT + 2

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  if (payload.header.subtitulo) {
    doc.text(payload.header.subtitulo, 105, currentY, { align: "center" })
    currentY += LINE_HEIGHT
  }

  if (payload.header.metadata?.length) {
    payload.header.metadata.forEach((meta) => {
      doc.text(meta, 105, currentY, { align: "center" })
      currentY += LINE_HEIGHT
    })
  }

  currentY += LINE_HEIGHT / 2

  for (const section of payload.sections) {
    currentY = drawSection(doc, section, currentY)
  }

  if (payload.voucherImage) {
    currentY = ensurePageSpace(doc, LINE_HEIGHT * 2, currentY)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text("Voucher adjunto", PAGE_MARGIN_X, currentY)
    currentY += LINE_HEIGHT

    const imageType = getImageFormat(payload.voucherImage)
    const props = doc.getImageProperties(payload.voucherImage)
    const maxWidth = CONTENT_WIDTH
    const maxHeight = doc.internal.pageSize.getHeight() - PAGE_MARGIN_Y - currentY

    let imageWidth = maxWidth
    let imageHeight = (props.height * imageWidth) / props.width
    if (imageHeight > maxHeight) {
      imageHeight = maxHeight
      imageWidth = (props.width * imageHeight) / props.height
    }

    doc.addImage(payload.voucherImage, imageType, PAGE_MARGIN_X, currentY, imageWidth, imageHeight)
    currentY += imageHeight + LINE_HEIGHT
  }

  const filename = payload.filename ?? "Comprobante-preinscripcion.pdf"
  doc.save(filename)
}
