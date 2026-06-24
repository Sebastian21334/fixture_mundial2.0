"use client"

import { useTournament } from "@/components/tournament-provider"
import { TeamLabel } from "@/components/team-label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Goal, ShieldCheck, Flame, CalendarCheck, Trophy } from "lucide-react"

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="truncate text-lg font-semibold">{value}</div>
          {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsView() {
  const { stats } = useTournament()

  const topScorer = stats.topScoringTeam
  const bestDefense = stats.bestDefensiveTeam
  const biggestWin = stats.biggestWin

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas del torneo</h2>
        <p className="text-sm text-muted-foreground">
          Calculadas automáticamente a partir de los resultados cargados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Goal className="size-6" />}
          label="Goles totales del torneo"
          value={stats.totalGoals}
          sub={`${stats.matchesPlayed} partidos jugados`}
        />
        <StatCard
          icon={<CalendarCheck className="size-6" />}
          label="Partidos jugados"
          value={`${stats.matchesPlayed} / ${stats.totalMatches}`}
          sub={`${stats.totalMatches - stats.matchesPlayed} pendientes`}
        />
        <StatCard
          icon={<Goal className="size-6" />}
          label="Promedio de goles por partido"
          value={stats.matchesPlayed ? (stats.totalGoals / stats.matchesPlayed).toFixed(2) : "0.00"}
        />
        <StatCard
          icon={<Flame className="size-6" />}
          label="Equipo más goleador"
          value={
            topScorer ? <TeamLabel teamId={topScorer.teamId} size="sm" /> : "Sin datos"
          }
          sub={topScorer ? `${topScorer.value} goles a favor` : undefined}
        />
        <StatCard
          icon={<ShieldCheck className="size-6" />}
          label="Menos goles recibidos"
          value={
            bestDefense ? <TeamLabel teamId={bestDefense.teamId} size="sm" /> : "Sin datos"
          }
          sub={bestDefense ? `${bestDefense.value} goles en contra` : undefined}
        />
        <StatCard
          icon={<Trophy className="size-6" />}
          label="Mayor goleada"
          value={
            biggestWin ? (
              <div className="flex items-center gap-2">
                <TeamLabel teamId={biggestWin.winner} size="sm" hideName />
                <span className="font-mono font-bold">
                  {biggestWin.winnerGoals}-{biggestWin.loserGoals}
                </span>
                <TeamLabel teamId={biggestWin.loser} size="sm" hideName />
              </div>
            ) : (
              "Sin datos"
            )
          }
          sub={biggestWin ? `Diferencia de ${biggestWin.margin} goles` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ranking de goleo por equipo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {stats.scoringRanking.slice(0, 12).map((row, i) => (
                <li key={row.teamId} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-right text-sm font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <TeamLabel teamId={row.teamId} size="sm" />
                  </div>
                  <span className="font-mono text-sm font-semibold">{row.value}</span>
                </li>
              ))}
              {stats.scoringRanking.length === 0 ? (
                <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Carga resultados para ver el ranking.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Defensas más sólidas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {stats.defensiveRanking.slice(0, 12).map((row, i) => (
                <li key={row.teamId} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-right text-sm font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <TeamLabel teamId={row.teamId} size="sm" />
                  </div>
                  <span className="font-mono text-sm font-semibold">{row.value}</span>
                </li>
              ))}
              {stats.defensiveRanking.length === 0 ? (
                <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Carga resultados para ver el ranking.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
