"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useTournament } from "@/components/tournament-provider"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { exportNodeToPng, exportNodeToPdf } from "@/lib/export"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Moon,
  Sun,
  Download,
  FileText,
  Printer,
  Settings,
  Image as ImageIcon,
  FilePlus2,
  RotateCcw,
  Eraser,
  Undo2,
  Loader2,
} from "lucide-react"

type ConfirmKind = "new" | "reset" | "clearKnockout" | "restore" | null

const CONFIRM_COPY: Record<
  Exclude<ConfirmKind, null>,
  { title: string; description: string }
> = {
  new: {
    title: "Crear nuevo torneo",
    description:
      "Se reiniciarán todos los resultados y se restaurará el fixture oficial. Esta acción no se puede deshacer.",
  },
  reset: {
    title: "Reiniciar resultados",
    description:
      "Se borrarán todos los goles de fase de grupos y eliminatorias. El fixture se mantiene. ¿Continuar?",
  },
  clearKnockout: {
    title: "Limpiar eliminatorias",
    description:
      "Se borrarán únicamente los resultados de la fase de eliminación directa. ¿Continuar?",
  },
  restore: {
    title: "Restaurar valores iniciales",
    description:
      "Se restaurará el fixture oficial del Mundial 2026 y se borrarán todos los resultados. ¿Continuar?",
  },
}

export function Toolbar({ exportTargetId }: { exportTargetId: string }) {
  const { theme, setTheme } = useTheme()
  const {
    newTournament,
    resetResults,
    clearKnockout,
    restoreDefaults,
  } = useTournament()
  const [confirm, setConfirm] = useState<ConfirmKind>(null)
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null)

  const isDark = theme === "dark"

  const runExport = async (kind: "png" | "pdf") => {
    const node = document.getElementById(exportTargetId)
    if (!node) return
    setExporting(kind)
    try {
      const date = new Date().toISOString().slice(0, 10)
      if (kind === "png") {
        await exportNodeToPng(node, `fixture-mundial-2026-${date}.png`)
      } else {
        await exportNodeToPdf(node, `fixture-mundial-2026-${date}.pdf`)
      }
    } catch (err) {
      console.log("[v0] export error:", err)
    } finally {
      setExporting(null)
    }
  }

  const handleConfirm = () => {
    switch (confirm) {
      case "new":
        newTournament()
        break
      case "reset":
        resetResults()
        break
      case "clearKnockout":
        clearKnockout()
        break
      case "restore":
        restoreDefaults()
        break
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Exportar fixture</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => runExport("png")}
            disabled={exporting !== null}
          >
            <ImageIcon className="size-4" />
            Exportar a PNG
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => runExport("pdf")}
            disabled={exporting !== null}
          >
            <FileText className="size-4" />
            Exportar a PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" />
            <span className="hidden sm:inline">Gestión</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Herramientas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirm("new")}>
            <FilePlus2 className="size-4" />
            Nuevo torneo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirm("reset")}>
            <RotateCcw className="size-4" />
            Reiniciar resultados
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirm("clearKnockout")}>
            <Eraser className="size-4" />
            Limpiar eliminatorias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirm("restore")}>
            <Undo2 className="size-4" />
            Restaurar valores iniciales
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm ? CONFIRM_COPY[confirm].title : ""}
        description={confirm ? CONFIRM_COPY[confirm].description : ""}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
