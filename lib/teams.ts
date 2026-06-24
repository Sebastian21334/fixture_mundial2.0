import type { Team, GroupId } from "./types"

// 48 teams distributed across the 12 official groups (A-L) of the
// FIFA World Cup 2026 format. Flag codes follow the flag-icons set.
export const TEAMS: Team[] = [
  // Group A
{ id: "MEX", name: "México", flag: "mx", group: "A" },
{ id: "RSA", name: "Sudáfrica", flag: "za", group: "A" },
{ id: "KOR", name: "Corea del Sur", flag: "kr", group: "A" },
{ id: "CZE", name: "República Checa", flag: "cz", group: "A" },

// Group B
{ id: "CAN", name: "Canadá", flag: "ca", group: "B" },
{ id: "BIH", name: "Bosnia y Herzegovina", flag: "ba", group: "B" },
{ id: "QAT", name: "Catar", flag: "qa", group: "B" },
{ id: "SUI", name: "Suiza", flag: "ch", group: "B" },

// Group C
{ id: "BRA", name: "Brasil", flag: "br", group: "C" },
{ id: "MAR", name: "Marruecos", flag: "ma", group: "C" },
{ id: "HAI", name: "Haití", flag: "ht", group: "C" },
{ id: "SCO", name: "Escocia", flag: "gb-sct", group: "C" },

// Group D
{ id: "USA", name: "Estados Unidos", flag: "us", group: "D" },
{ id: "PAR", name: "Paraguay", flag: "py", group: "D" },
{ id: "AUS", name: "Australia", flag: "au", group: "D" },
{ id: "TUR", name: "Turquía", flag: "tr", group: "D" },

// Group E
{ id: "GER", name: "Alemania", flag: "de", group: "E" },
{ id: "CUW", name: "Curazao", flag: "cw", group: "E" },
{ id: "CIV", name: "Costa de Marfil", flag: "ci", group: "E" },
{ id: "ECU", name: "Ecuador", flag: "ec", group: "E" },

// Group F
{ id: "NED", name: "Países Bajos", flag: "nl", group: "F" },
{ id: "JPN", name: "Japón", flag: "jp", group: "F" },
{ id: "SWE", name: "Suecia", flag: "se", group: "F" },
{ id: "TUN", name: "Túnez", flag: "tn", group: "F" },

// Group G
{ id: "BEL", name: "Bélgica", flag: "be", group: "G" },
{ id: "EGY", name: "Egipto", flag: "eg", group: "G" },
{ id: "IRN", name: "Irán", flag: "ir", group: "G" },
{ id: "NZL", name: "Nueva Zelanda", flag: "nz", group: "G" },

// Group H
{ id: "ESP", name: "España", flag: "es", group: "H" },
{ id: "CPV", name: "Cabo Verde", flag: "cv", group: "H" },
{ id: "KSA", name: "Arabia Saudita", flag: "sa", group: "H" },
{ id: "URU", name: "Uruguay", flag: "uy", group: "H" },

// Group I
{ id: "FRA", name: "Francia", flag: "fr", group: "I" },
{ id: "SEN", name: "Senegal", flag: "sn", group: "I" },
{ id: "IRQ", name: "Irak", flag: "iq", group: "I" },
{ id: "NOR", name: "Noruega", flag: "no", group: "I" },

// Group J
{ id: "ARG", name: "Argentina", flag: "ar", group: "J" },
{ id: "ALG", name: "Argelia", flag: "dz", group: "J" },
{ id: "AUT", name: "Austria", flag: "at", group: "J" },
{ id: "JOR", name: "Jordania", flag: "jo", group: "J" },

// Group K
{ id: "POR", name: "Portugal", flag: "pt", group: "K" },
{ id: "COD", name: "República Democrática del Congo", flag: "cd", group: "K" },
{ id: "UZB", name: "Uzbekistán", flag: "uz", group: "K" },
{ id: "COL", name: "Colombia", flag: "co", group: "K" },

// Group L
{ id: "ENG", name: "Inglaterra", flag: "gb-eng", group: "L" },
{ id: "CRO", name: "Croacia", flag: "hr", group: "L" },
{ id: "GHA", name: "Ghana", flag: "gh", group: "L" },
{ id: "PAN", name: "Panamá", flag: "pa", group: "L" },
]

export const GROUP_IDS: GroupId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
]

const TEAM_MAP = new Map(TEAMS.map((t) => [t.id, t]))

export function getTeam(id: string | null | undefined): Team | null {
  if (!id) return null
  return TEAM_MAP.get(id) ?? null
}

export function teamsByGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group)
}
