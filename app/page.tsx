import { TournamentProvider } from "@/components/tournament-provider"
import { AppShell } from "@/components/app-shell"

export default function Page() {
  return (
    <TournamentProvider>
      <AppShell />
    </TournamentProvider>
  )
}
