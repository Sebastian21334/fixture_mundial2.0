"use client"

import html2canvas from "html2canvas-pro"
import { jsPDF } from "jspdf"

/** Capture a DOM node to a canvas, honoring the current theme background. */
async function captureNode(node: HTMLElement): Promise<HTMLCanvasElement> {
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff"
  return html2canvas(node, {
    backgroundColor: bg,
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    logging: false,
  })
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Export a DOM node to a PNG file. */
export async function exportNodeToPng(node: HTMLElement, filename: string) {
  const canvas = await captureNode(node)
  triggerDownload(canvas.toDataURL("image/png"), filename)
}

/** Export a DOM node to a (possibly multi-page) PDF file. */
export async function exportNodeToPdf(node: HTMLElement, filename: string) {
  const canvas = await captureNode(node)
  const imgData = canvas.toDataURL("image/png")

  const orientation = canvas.width >= canvas.height ? "landscape" : "portrait"
  const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width

  let heightLeft = imgH
  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH)
  heightLeft -= pageH

  while (heightLeft > 0) {
    position -= pageH
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH)
    heightLeft -= pageH
  }

  pdf.save(filename)
}
