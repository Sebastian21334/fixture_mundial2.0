import type {
  GroupMatch,
  KnockoutMatch,
  GroupId,
  TournamentState,
} from "./types"
import { GROUP_IDS, teamsByGroup } from "./teams"

export const TOURNAMENT_NAME = "Copa Mundial de la FIFA 2026"

// Round-robin pairing order for a group of 4 (indices into the group array).
// Covers all 6 unique pairings across 3 match days.
const ROUND_ROBIN: Array<[number, number, number]> = [
  // [homeIndex, awayIndex, matchDay]
  [0, 1, 1],
  [2, 3, 1],
  [0, 2, 2],
  [3, 1, 2],
  [3, 0, 3],
  [1, 2, 3],
]

/** Build the 72 group-stage matches (6 per group, 12 groups). */
export function buildGroupMatches(): GroupMatch[] {
  const matches: GroupMatch[] = []
  for (const group of GROUP_IDS) {
    const teams = teamsByGroup(group)
    ROUND_ROBIN.forEach(([h, a, round], idx) => {
      matches.push({
        id: `G-${group}-${idx + 1}`,
        group,
        round,
        homeId: teams[h].id,
        awayId: teams[a].id,
        homeGoals: null,
        awayGoals: null,
      })
    })
  }
  return matches
}

// Round of 32 layout. 12 group winners + 12 runners-up + 8 best third-placed.
// Designed as a clean binary tree feeding the rest of the bracket.
interface R32Def {
  home:
    | { type: "group"; group: GroupId; pos: 1 | 2 }
    | { type: "third"; index: number }
  away:
    | { type: "group"; group: GroupId; pos: 1 | 2 }
    | { type: "third"; index: number }
}

const R32_DEFS: R32Def[] = [
  { home: { type: "group", group: "A", pos: 1 }, away: { type: "third", index: 0 } }, // M1
  { home: { type: "group", group: "C", pos: 1 }, away: { type: "group", group: "F", pos: 2 } }, // M2
  { home: { type: "group", group: "E", pos: 1 }, away: { type: "third", index: 1 } }, // M3
  { home: { type: "group", group: "G", pos: 1 }, away: { type: "group", group: "B", pos: 2 } }, // M4
  { home: { type: "group", group: "I", pos: 1 }, away: { type: "third", index: 2 } }, // M5
  { home: { type: "group", group: "K", pos: 1 }, away: { type: "group", group: "J", pos: 2 } }, // M6
  { home: { type: "group", group: "B", pos: 1 }, away: { type: "third", index: 3 } }, // M7
  { home: { type: "group", group: "D", pos: 1 }, away: { type: "group", group: "H", pos: 2 } }, // M8
  { home: { type: "group", group: "F", pos: 1 }, away: { type: "third", index: 4 } }, // M9
  { home: { type: "group", group: "H", pos: 1 }, away: { type: "group", group: "A", pos: 2 } }, // M10
  { home: { type: "group", group: "J", pos: 1 }, away: { type: "third", index: 5 } }, // M11
  { home: { type: "group", group: "L", pos: 1 }, away: { type: "group", group: "D", pos: 2 } }, // M12
  { home: { type: "group", group: "C", pos: 2 }, away: { type: "third", index: 6 } }, // M13
  { home: { type: "group", group: "E", pos: 2 }, away: { type: "group", group: "L", pos: 2 } }, // M14
  { home: { type: "group", group: "G", pos: 2 }, away: { type: "third", index: 7 } }, // M15
  { home: { type: "group", group: "I", pos: 2 }, away: { type: "group", group: "K", pos: 2 } }, // M16
]

function emptyKnockout(
  id: string,
  round: KnockoutMatch["round"],
  label: string,
  home: KnockoutMatch["home"],
  away: KnockoutMatch["away"],
): KnockoutMatch {
  return {
    id,
    round,
    label,
    home,
    away,
    homeGoals: null,
    awayGoals: null,
    homePens: null,
    awayPens: null,
  }
}

/** Build the full empty knockout bracket structure. */
export function buildKnockoutMatches(): KnockoutMatch[] {
  const matches: KnockoutMatch[] = []

  // Round of 32 (Dieciseisavos)
  R32_DEFS.forEach((def, i) => {
    matches.push(
      emptyKnockout(`R32-${i + 1}`, "R32", `Dieciseisavos ${i + 1}`, def.home, def.away),
    )
  })

  // Round of 16 (Octavos) - pairs of consecutive R32 winners
  for (let i = 0; i < 8; i++) {
    const a = i * 2 + 1
    const b = i * 2 + 2
    matches.push(
      emptyKnockout(
        `R16-${i + 1}`,
        "R16",
        `Octavos ${i + 1}`,
        { type: "winner", matchId: `R32-${a}` },
        { type: "winner", matchId: `R32-${b}` },
      ),
    )
  }

  // Quarterfinals (Cuartos)
  for (let i = 0; i < 4; i++) {
    const a = i * 2 + 1
    const b = i * 2 + 2
    matches.push(
      emptyKnockout(
        `QF-${i + 1}`,
        "QF",
        `Cuartos de final ${i + 1}`,
        { type: "winner", matchId: `R16-${a}` },
        { type: "winner", matchId: `R16-${b}` },
      ),
    )
  }

  // Semifinals (Semifinales)
  for (let i = 0; i < 2; i++) {
    const a = i * 2 + 1
    const b = i * 2 + 2
    matches.push(
      emptyKnockout(
        `SF-${i + 1}`,
        "SF",
        `Semifinal ${i + 1}`,
        { type: "winner", matchId: `QF-${a}` },
        { type: "winner", matchId: `QF-${b}` },
      ),
    )
  }

  // Third place
  matches.push(
    emptyKnockout(
      "3RD-1",
      "3RD",
      "Tercer puesto",
      { type: "loser", matchId: "SF-1" },
      { type: "loser", matchId: "SF-2" },
    ),
  )

  // Final
  matches.push(
    emptyKnockout(
      "FINAL-1",
      "FINAL",
      "Final",
      { type: "winner", matchId: "SF-1" },
      { type: "winner", matchId: "SF-2" },
    ),
  )

  return matches
}

export function createInitialState(): TournamentState {
  return {
    name: TOURNAMENT_NAME,
    groupMatches: buildGroupMatches(),
    knockoutMatches: buildKnockoutMatches(),
  }
}
