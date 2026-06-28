// Core domain types for the FIFA World Cup 2026 fixture app

export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"

export interface Team {
  /** Stable unique id (FIFA-style 3 letter code) */
  id: string
  /** Display name in Spanish */
  name: string
  /** ISO code used by flag-icons (e.g. "ar", "gb-eng") */
  flag: string
  /** Group the team belongs to */
  group: GroupId
}

/** A match in the group stage */
export interface GroupMatch {
  id: string
  group: GroupId
  /** Match day within the group (1, 2 or 3) */
  round: number
  homeId: string
  awayId: string
  homeGoals: number | null
  awayGoals: number | null
}

/** Reference describing where a knockout slot's team comes from */
export type SlotRef =
  | { type: "group"; group: GroupId; pos: 1 | 2 }
  | { type: "third"; index: number }
  | { type: "winner"; matchId: string }
  | { type: "loser"; matchId: string }
  | { type: "team"; teamId: string } // equipo fijo ya conocido (hardcodeado)

export type KnockoutRound =
  | "R32"
  | "R16"
  | "QF"
  | "SF"
  | "3RD"
  | "FINAL"

/** A knockout match definition (structure only, results live in state) */
export interface KnockoutMatch {
  id: string
  round: KnockoutRound
  /** Human readable label, e.g. "Dieciseisavos 1" */
  label: string
  home: SlotRef
  away: SlotRef
  homeGoals: number | null
  awayGoals: number | null
  /** Penalty shootout score used only when goals are tied */
  homePens: number | null
  awayPens: number | null
}

/** A row in a computed standings table */
export interface StandingRow {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
  /** 1-based position inside the group after sorting */
  position: number
  group: GroupId
}

/** Persisted tournament state (only the editable bits) */
export interface TournamentState {
  name: string
  groupMatches: GroupMatch[]
  knockoutMatches: KnockoutMatch[]
}

export type ViewKey = "home" | "groups" | "knockout" | "stats"

export interface TeamStatRow {
  teamId: string
  value: number
}

export interface TournamentStats {
  totalGoals: number
  matchesPlayed: number
  totalMatches: number
  topScoringTeam: TeamStatRow | null
  bestDefensiveTeam: TeamStatRow | null
  scoringRanking: TeamStatRow[]
  defensiveRanking: TeamStatRow[]
  biggestWin: {
    winner: string
    loser: string
    winnerGoals: number
    loserGoals: number
    margin: number
  } | null
}
