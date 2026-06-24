import { cn } from "@/lib/utils"
import { getTeam } from "@/lib/teams"

interface TeamLabelProps {
  teamId: string | null
  /** Fallback text shown when the team is not yet decided */
  placeholder?: string
  className?: string
  flagClassName?: string
  nameClassName?: string
  /** Reverse layout: name then flag (useful for right-aligned home team) */
  reverse?: boolean
  /** Show full name (default) or short id code */
  short?: boolean
  highlight?: boolean
}

export function Flag({
  code,
  className,
}: {
  code: string | null
  className?: string
}) {
  if (!code) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-block rounded-[2px] bg-muted ring-1 ring-border",
          className,
        )}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "fi inline-block rounded-[2px] bg-cover ring-1 ring-border/60",
        `fi-${code}`,
        className,
      )}
    />
  )
}

export function TeamLabel({
  teamId,
  placeholder = "Por definir",
  className,
  flagClassName = "h-4 w-6",
  nameClassName,
  reverse = false,
  short = false,
  highlight = false,
}: TeamLabelProps) {
  const team = getTeam(teamId)
  const name = team ? (short ? team.id : team.name) : placeholder

  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2",
        reverse && "flex-row-reverse",
        className,
      )}
    >
      <Flag code={team?.flag ?? null} className={flagClassName} />
      <span
        className={cn(
          "truncate",
          !team && "italic text-muted-foreground",
          highlight && "font-semibold",
          nameClassName,
        )}
        title={name}
      >
        {name}
      </span>
    </span>
  )
}
