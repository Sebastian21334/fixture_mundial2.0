"use client"

import { Home, Users, Trophy, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewKey } from "@/lib/types"

const TABS: { key: ViewKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Inicio", icon: Home },
  { key: "groups", label: "Grupos", icon: Users },
  { key: "knockout", label: "Eliminatorias", icon: Trophy },
  { key: "stats", label: "Estadísticas", icon: BarChart3 },
]

export function MainNav({
  active,
  onChange,
}: {
  active: ViewKey
  onChange: (v: ViewKey) => void
}) {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 sm:w-auto"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
