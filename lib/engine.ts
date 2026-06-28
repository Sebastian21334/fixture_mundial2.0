import type {
  GroupMatch,
  KnockoutMatch,
  StandingRow,
  GroupId,
  SlotRef,
  TournamentState,
  TournamentStats,
} from "./types"
import { GROUP_IDS, teamsByGroup, getTeam } from "./teams"

function blankRow(teamId: string, group: GroupId): StandingRow {
  return {
    teamId,
    group,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    position: 0,
  }
}

function applyMatch(row: StandingRow, gf: number, ga: number) {
  row.played += 1
  row.goalsFor += gf
  row.goalsAgainst += ga
  row.goalDiff = row.goalsFor - row.goalsAgainst
  if (gf > ga) {
    row.won += 1
    row.points += 3
  } else if (gf === ga) {
    row.drawn += 1
    row.points += 1
  } else {
    row.lost += 1
  }
}

/** Sort standings rows by points, goal difference, goals for, then name. */
function sortRows(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    const an = getTeam(a.teamId)?.name ?? ""
    const bn = getTeam(b.teamId)?.name ?? ""
    return an.localeCompare(bn)
  })
}

/** Compute the standings table for a single group. */
export function computeGroupStandings(
  group: GroupId,
  matches: GroupMatch[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>()
  for (const team of teamsByGroup(group)) {
    rows.set(team.id, blankRow(team.id, group))
  }
  for (const m of matches) {
    if (m.group !== group) continue
    if (m.homeGoals === null || m.awayGoals === null) continue
    const home = rows.get(m.homeId)
    const away = rows.get(m.awayId)
    if (!home || !away) continue
    applyMatch(home, m.homeGoals, m.awayGoals)
    applyMatch(away, m.awayGoals, m.homeGoals)
  }
  const sorted = sortRows([...rows.values()])
  sorted.forEach((r, i) => {
    r.position = i + 1
  })
  return sorted
}

/** All group standings keyed by group id. */
export function computeAllStandings(
  matches: GroupMatch[],
): Record<GroupId, StandingRow[]> {
  const result = {} as Record<GroupId, StandingRow[]>
  for (const g of GROUP_IDS) {
    result[g] = computeGroupStandings(g, matches)
  }
  return result
}

/** Is every match in a group completed? */
export function isGroupComplete(group: GroupId, matches: GroupMatch[]): boolean {
  return matches
    .filter((m) => m.group === group)
    .every((m) => m.homeGoals !== null && m.awayGoals !== null)
}

export function areAllGroupsComplete(matches: GroupMatch[]): boolean {
  return GROUP_IDS.every((g) => isGroupComplete(g, matches))
}

/**
 * Rank the 12 third-placed teams and return the best 8 (only when every group
 * is complete). Returns null entries are avoided by returning fewer items.
 */
export function rankedThirdPlaces(
  standings: Record<GroupId, StandingRow[]>,
  matches: GroupMatch[],
): StandingRow[] {
  if (!areAllGroupsComplete(matches)) return []
  const thirds = GROUP_IDS.map((g) => standings[g][2]).filter(Boolean)
  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.group.localeCompare(b.group)
  })
  return sorted.slice(0, 8)
}

export interface ResolvedTeamRef {
  teamId: string | null
  /** Placeholder text when the team is not yet known, e.g. "1A" or "3°" */
  placeholder: string
}

/**
 * Resolve every knockout match's two team slots given the current group
 * standings and previously played knockout matches. Returns a map of matchId
 * to resolved home/away team refs (with placeholders).
 */
export function resolveKnockout(
  knockout: KnockoutMatch[],
  standings: Record<GroupId, StandingRow[]>,
  matches: GroupMatch[],
): Map<string, { home: ResolvedTeamRef; away: ResolvedTeamRef }> {
  const thirds = rankedThirdPlaces(standings, matches)
  const byId = new Map(knockout.map((m) => [m.id, m]))
  const resolved = new Map<string, { home: string | null; away: string | null }>()

  const winnerOf = (matchId: string): string | null => {
    const m = byId.get(matchId)
    if (!m) return null
    if (m.homeGoals === null || m.awayGoals === null) return null
    const slots = resolved.get(matchId)
    if (!slots) return null
    if (m.homeGoals > m.awayGoals) return slots.home
    if (m.awayGoals > m.homeGoals) return slots.away
    // Tied on goals -> use penalties
    if (m.homePens !== null && m.awayPens !== null) {
      if (m.homePens > m.awayPens) return slots.home
      if (m.awayPens > m.homePens) return slots.away
    }
    return null
  }

  const loserOf = (matchId: string): string | null => {
    const m = byId.get(matchId)
    if (!m) return null
    if (m.homeGoals === null || m.awayGoals === null) return null
    const slots = resolved.get(matchId)
    if (!slots) return null
    const w = winnerOf(matchId)
    if (!w) return null
    return slots.home === w ? slots.away : slots.home
  }

  const resolveRef = (ref: SlotRef): ResolvedTeamRef => {
    switch (ref.type) {
      case "group": {
        const row = standings[ref.group]?.[ref.pos - 1]
        const complete = isGroupComplete(ref.group, matches)
        return {
          teamId: complete && row ? row.teamId : null,
          placeholder: `${ref.pos}° Grupo ${ref.group}`,
        }
      }
      case "third": {
        const t = thirds[ref.index]
        return {
          teamId: t ? t.teamId : null,
          placeholder: `3° (${ref.index + 1})`,
        }
      }
      case "winner": {
        return {
          teamId: winnerOf(ref.matchId),
          placeholder: `Ganador ${labelForMatch(byId, ref.matchId)}`,
        }
      }
      case "loser": {
        return {
          teamId: loserOf(ref.matchId),
          placeholder: `Perdedor ${labelForMatch(byId, ref.matchId)}`,
        }
      }
      case "team": {
        const team = getTeam(ref.teamId)
        return {
          teamId: ref.teamId,
          placeholder: team?.name ?? ref.teamId,
        }
      }
    }
  }

  // Resolve in bracket order: R32 -> R16 -> QF -> SF -> 3RD/FINAL
  for (const m of knockout) {
    const home = resolveRef(m.home)
    const away = resolveRef(m.away)
    resolved.set(m.id, { home: home.teamId, away: away.teamId })
  }

  // Build the public output with placeholders again (now that resolved is full)
  const output = new Map<
    string,
    { home: ResolvedTeamRef; away: ResolvedTeamRef }
  >()
  for (const m of knockout) {
    output.set(m.id, {
      home: resolveRef(m.home),
      away: resolveRef(m.away),
    })
  }
  return output
}

function labelForMatch(
  byId: Map<string, KnockoutMatch>,
  matchId: string,
): string {
  return byId.get(matchId)?.label ?? matchId
}

/** Winner team id of a knockout match, given resolved slots. */
export function knockoutResultWinner(
  m: KnockoutMatch,
  resolved: { home: ResolvedTeamRef; away: ResolvedTeamRef } | undefined,
): string | null {
  if (!resolved) return null
  if (m.homeGoals === null || m.awayGoals === null) return null
  if (m.homeGoals > m.awayGoals) return resolved.home.teamId
  if (m.awayGoals > m.homeGoals) return resolved.away.teamId
  if (m.homePens !== null && m.awayPens !== null) {
    if (m.homePens > m.awayPens) return resolved.home.teamId
    if (m.awayPens > m.homePens) return resolved.away.teamId
  }
  return null
}

/** Compute tournament-wide statistics across group + knockout matches. */
export function computeTournamentStats(state: TournamentState): TournamentStats {
  const scored = new Map<string, number>()
  const conceded = new Map<string, number>()
  let totalGoals = 0
  let matchesPlayed = 0
  let biggest: TournamentStats["biggestWin"] = null

  const totalMatches = state.groupMatches.length + state.knockoutMatches.length

  const consider = (
    homeId: string | null,
    awayId: string | null,
    hg: number | null,
    ag: number | null,
  ) => {
    if (!homeId || !awayId || hg === null || ag === null) return
    matchesPlayed += 1
    totalGoals += hg + ag
    scored.set(homeId, (scored.get(homeId) ?? 0) + hg)
    scored.set(awayId, (scored.get(awayId) ?? 0) + ag)
    conceded.set(homeId, (conceded.get(homeId) ?? 0) + ag)
    conceded.set(awayId, (conceded.get(awayId) ?? 0) + hg)
    if (hg !== ag) {
      const margin = Math.abs(hg - ag)
      if (!biggest || margin > biggest.margin) {
        const winner = hg > ag ? homeId : awayId
        const loser = hg > ag ? awayId : homeId
        biggest = {
          winner,
          loser,
          winnerGoals: Math.max(hg, ag),
          loserGoals: Math.min(hg, ag),
          margin,
        }
      }
    }
  }

  for (const m of state.groupMatches) {
    consider(m.homeId, m.awayId, m.homeGoals, m.awayGoals)
  }

  // For knockout we need resolved teams
  const standings = computeAllStandings(state.groupMatches)
  const resolved = resolveKnockout(
    state.knockoutMatches,
    standings,
    state.groupMatches,
  )
  for (const m of state.knockoutMatches) {
    const r = resolved.get(m.id)
    consider(
      r?.home.teamId ?? null,
      r?.away.teamId ?? null,
      m.homeGoals,
      m.awayGoals,
    )
  }

  const scoringRanking = [...scored.entries()]
    .map(([teamId, value]) => ({ teamId, value }))
    .sort((a, b) => b.value - a.value || a.teamId.localeCompare(b.teamId))

  const defensiveRanking = [...conceded.entries()]
    .map(([teamId, value]) => ({ teamId, value }))
    .sort((a, b) => a.value - b.value || a.teamId.localeCompare(b.teamId))

  return {
    totalGoals,
    matchesPlayed,
    totalMatches,
    topScoringTeam: scoringRanking[0] ?? null,
    bestDefensiveTeam: defensiveRanking[0] ?? null,
    scoringRanking,
    defensiveRanking,
    biggestWin: biggest,
  }
}
