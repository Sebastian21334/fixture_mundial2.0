"use client"

import { useTournament } from "@/components/tournament-provider"
import { knockoutResultWinner } from "@/lib/engine"
import { TeamLabel } from "@/components/team-label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Goal, CalendarCheck, Users, ListChecks } from "lucide-react"
import type { ViewKey } from "@/lib/types"

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progreso del torneo</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {value} de {max} partidos jugados
      </p>
    </div>
  )
}

export function HomeView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { state, stats, resolvedKnockout } = useTournament()

  const finalMatch = state.knockoutMatches.find((m) => m.round === "FINAL")
  const champion = finalMatch
    ? knockoutResultWinner(finalMatch, resolvedKnockout.get(finalMatch.id))
    : null

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Trophy className="size-3.5" />
            FIFA World Cup 2026
          </span>
          <h1 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            {state.name}
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Carga los resultados y mira cómo se actualizan automáticamente las
            tablas, los clasificados y todo el cuadro de eliminación directa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("groups")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ListChecks className="size-4" />
              Cargar resultados
            </button>
            <button
              onClick={() => onNavigate("knockout")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Trophy className="size-4" />
              Ver llave
            </button>
          </div>
        </div>
      </section>

      {champion ? (
        <section className="overflow-hidden rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold-foreground">
              <Trophy className="size-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Campeón del torneo
              </p>
              <div className="mt-1 text-2xl font-bold">
                <TeamLabel teamId={champion} size="lg" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selecciones</p>
              <p className="text-xl font-bold">48</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partidos jugados</p>
              <p className="text-xl font-bold">
                {stats.matchesPlayed}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {stats.totalMatches}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Goal className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goles del torneo</p>
              <p className="text-xl font-bold">{stats.totalGoals}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Más goleador</p>
              <div className="truncate text-base font-bold">
                {stats.topScoringTeam ? (
                  <TeamLabel teamId={stats.topScoringTeam.teamId} size="sm" />
                ) : (
                  "—"
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado general</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar value={stats.matchesPlayed} max={stats.totalMatches} />
        </CardContent>
      </Card>
    </div>
  )
}
