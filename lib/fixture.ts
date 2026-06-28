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

// Round of 32 oficial 2026, ya confirmado tras el cierre de la fase de
// grupos (28 jun 2026). Los 16 cruces están fijos: 12 ganadores de grupo,
// 12 segundos y los 8 mejores terceros, ya determinados.
interface R32Def {
  home: { type: "team"; teamId: string }
  away: { type: "team"; teamId: string }
}

const R32_DEFS: R32Def[] = [
  { home: { type: "team", teamId: "RSA" }, away: { type: "team", teamId: "CAN" } }, // M73
  { home: { type: "team", teamId: "GER" }, away: { type: "team", teamId: "PAR" } }, // M74
  { home: { type: "team", teamId: "NED" }, away: { type: "team", teamId: "MAR" } }, // M75
  { home: { type: "team", teamId: "BRA" }, away: { type: "team", teamId: "JPN" } }, // M76
  { home: { type: "team", teamId: "FRA" }, away: { type: "team", teamId: "SWE" } }, // M77
  { home: { type: "team", teamId: "CIV" }, away: { type: "team", teamId: "NOR" } }, // M78
  { home: { type: "team", teamId: "MEX" }, away: { type: "team", teamId: "ECU" } }, // M79
  { home: { type: "team", teamId: "ENG" }, away: { type: "team", teamId: "COD" } }, // M80
  { home: { type: "team", teamId: "USA" }, away: { type: "team", teamId: "BIH" } }, // M81
  { home: { type: "team", teamId: "BEL" }, away: { type: "team", teamId: "SEN" } }, // M82
  { home: { type: "team", teamId: "POR" }, away: { type: "team", teamId: "CRO" } }, // M83
  { home: { type: "team", teamId: "ESP" }, away: { type: "team", teamId: "AUT" } }, // M84
  { home: { type: "team", teamId: "SUI" }, away: { type: "team", teamId: "ALG" } }, // M85
  { home: { type: "team", teamId: "ARG" }, away: { type: "team", teamId: "CPV" } }, // M86
  { home: { type: "team", teamId: "COL" }, away: { type: "team", teamId: "GHA" } }, // M87
  { home: { type: "team", teamId: "AUS" }, away: { type: "team", teamId: "EGY" } }, // M88
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
