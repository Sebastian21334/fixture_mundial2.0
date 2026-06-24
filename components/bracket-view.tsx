"use client"

import { useMemo, useRef, useState } from "react"
import type { KnockoutMatch, KnockoutRound } from "@/lib/types"
import { KnockoutMatchCard } from "@/components/knockout-match-card"
import { TeamLabel } from "@/components/team-label"
import { useTournament } from "@/components/tournament-provider"
import { knockoutResultWinner } from "@/lib/engine"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Trophy } from "lucide-react"

const ROUND_ORDER: { round: KnockoutRound; title: string }[] = [
  { round: "R32", title: "Dieciseisavos" },
  { round: "R16", title: "Octavos" },
  { round: "QF", title: "Cuartos" },
  { round: "SF", title: "Semifinales" },
]

const CARD_W = 230
const COL_GAP = 44
const COL_HEIGHT = 1440

function ConnectorStubs({
  showLeft,
  showRight,
  showVertical,
}: {
  showLeft: boolean
  showRight: boolean
  showVertical: boolean
}) {
  return (
    <>
      {showLeft && (
        <span className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-[22px] -translate-x-full bg-border" />
      )}
      {showRight && (
        <span className="pointer-events-none absolute right-0 top-1/2 h-0.5 w-[22px] translate-x-full bg-border" />
      )}
      {showVertical && (
        <span
          className="pointer-events-none absolute top-1/2 h-full w-0.5 bg-border"
          style={{ right: -22 }}
        />
      )}
    </>
  )
}

export function BracketView() {
  const { state, resolvedKnockout } = useTournament()
  const [zoom, setZoom] = useState(0.8)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const byRound = useMemo(() => {
    const map = new Map<KnockoutRound, KnockoutMatch[]>()
    for (const m of state.knockoutMatches) {
      if (!map.has(m.round)) map.set(m.round, [])
      map.get(m.round)!.push(m)
    }
    return map
  }, [state.knockoutMatches])

  const finalMatch = byRound.get("FINAL")?.[0]
  const thirdMatch = byRound.get("3RD")?.[0]
  const championId = finalMatch
    ? knockoutResultWinner(finalMatch, resolvedKnockout.get(finalMatch.id))
    : null

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Eliminación Directa</h2>
          <p className="text-sm text-muted-foreground">
            Los cruces se completan solos con las posiciones de la fase de
            grupos. Usa el zoom y desliza horizontalmente.
          </p>
        </div>
        <div className="no-print flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Alejar"
            onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-sm tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Acercar"
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Restablecer zoom"
            onClick={() => setZoom(0.8)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Pantalla completa"
            onClick={toggleFullscreen}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {championId && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--gold)] bg-[var(--gold)]/15 px-4 py-3">
          <Trophy className="h-6 w-6 text-[var(--gold)]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Campeón del Mundo
            </p>
            <TeamLabel
              teamId={championId}
              flagClassName="h-5 w-7"
              nameClassName="text-lg font-bold"
            />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-border bg-card/40 p-4"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: "max-content",
          }}
        >
          <div className="flex items-stretch" style={{ height: COL_HEIGHT }}>
            {ROUND_ORDER.map((col, ci) => {
              const matches = byRound.get(col.round) ?? []
              return (
                <div
                  key={col.round}
                  className="flex flex-col"
                  style={{
                    width: CARD_W,
                    marginRight: COL_GAP,
                  }}
                >
                  <div className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {col.title}
                  </div>
                  <div className="flex flex-1 flex-col">
                    {matches.map((m, i) => (
                      <div
                        key={m.id}
                        className="relative flex flex-1 items-center"
                        style={{ width: CARD_W }}
                      >
                        <ConnectorStubs
                          showLeft={ci > 0}
                          showRight
                          showVertical={i % 2 === 0}
                        />
                        <KnockoutMatchCard match={m} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Final + Champion + Third place column */}
            <div
              className="flex flex-col justify-center"
              style={{ width: CARD_W + 20 }}
            >
              <div className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Final
              </div>
              <div className="flex flex-col gap-6">
                <div className="relative flex items-center" style={{ width: CARD_W }}>
                  <ConnectorStubs showLeft showRight={false} showVertical={false} />
                  <div className="rounded-xl bg-[var(--gold)]/10 p-1 ring-1 ring-[var(--gold)]/40">
                    {finalMatch && <KnockoutMatchCard match={finalMatch} compact />}
                  </div>
                </div>
                {thirdMatch && (
                  <div style={{ width: CARD_W }}>
                    <KnockoutMatchCard match={thirdMatch} compact />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
