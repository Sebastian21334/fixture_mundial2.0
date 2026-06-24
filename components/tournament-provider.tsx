"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type {
  TournamentState,
  GroupMatch,
  KnockoutMatch,
  GroupId,
  StandingRow,
} from "@/lib/types"
import { createInitialState, buildKnockoutMatches } from "@/lib/fixture"
import {
  computeAllStandings,
  resolveKnockout,
  computeTournamentStats,
  type ResolvedTeamRef,
} from "@/lib/engine"

const STORAGE_KEY = "wc2026-tournament-state-v1"

interface TournamentContextValue {
  state: TournamentState
  hydrated: boolean
  standings: Record<GroupId, StandingRow[]>
  resolvedKnockout: Map<
    string,
    { home: ResolvedTeamRef; away: ResolvedTeamRef }
  >
  stats: ReturnType<typeof computeTournamentStats>
  setGroupResult: (
    matchId: string,
    homeGoals: number | null,
    awayGoals: number | null,
  ) => void
  setKnockoutResult: (
    matchId: string,
    payload: Partial<
      Pick<KnockoutMatch, "homeGoals" | "awayGoals" | "homePens" | "awayPens">
    >,
  ) => void
  renameTournament: (name: string) => void
  newTournament: () => void
  resetResults: () => void
  clearKnockout: () => void
  restoreDefaults: () => void
}

const TournamentContext = createContext<TournamentContextValue | null>(null)

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TournamentState>(() => createInitialState())
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TournamentState
        if (parsed?.groupMatches && parsed?.knockoutMatches) {
          setState(parsed)
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  // Persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state, hydrated])

  const setGroupResult = useCallback(
    (matchId: string, homeGoals: number | null, awayGoals: number | null) => {
      setState((prev) => ({
        ...prev,
        groupMatches: prev.groupMatches.map((m) =>
          m.id === matchId ? { ...m, homeGoals, awayGoals } : m,
        ),
      }))
    },
    [],
  )

  const setKnockoutResult = useCallback(
    (
      matchId: string,
      payload: Partial<
        Pick<
          KnockoutMatch,
          "homeGoals" | "awayGoals" | "homePens" | "awayPens"
        >
      >,
    ) => {
      setState((prev) => ({
        ...prev,
        knockoutMatches: prev.knockoutMatches.map((m) =>
          m.id === matchId ? { ...m, ...payload } : m,
        ),
      }))
    },
    [],
  )

  const renameTournament = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }))
  }, [])

  const newTournament = useCallback(() => {
    setState(createInitialState())
  }, [])

  const resetResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      groupMatches: prev.groupMatches.map((m) => ({
        ...m,
        homeGoals: null,
        awayGoals: null,
      })),
      knockoutMatches: buildKnockoutMatches(),
    }))
  }, [])

  const clearKnockout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      knockoutMatches: buildKnockoutMatches(),
    }))
  }, [])

  const restoreDefaults = useCallback(() => {
    setState(createInitialState())
  }, [])

  const standings = useMemo(
    () => computeAllStandings(state.groupMatches),
    [state.groupMatches],
  )

  const resolvedKnockout = useMemo(
    () => resolveKnockout(state.knockoutMatches, standings, state.groupMatches),
    [state.knockoutMatches, standings, state.groupMatches],
  )

  const stats = useMemo(() => computeTournamentStats(state), [state])

  const value: TournamentContextValue = {
    state,
    hydrated,
    standings,
    resolvedKnockout,
    stats,
    setGroupResult,
    setKnockoutResult,
    renameTournament,
    newTournament,
    resetResults,
    clearKnockout,
    restoreDefaults,
  }

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext)
  if (!ctx) {
    throw new Error("useTournament must be used within a TournamentProvider")
  }
  return ctx
}
