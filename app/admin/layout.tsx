// Shared layout for all /admin/* routes.
// Wraps every admin page in the DashboardShell with the full admin sidebar nav.
// Each page only needs to export its content — the shell, sidebar, and mobile
// top bar are handled here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The shell is rendered by the individual pages (they need the user object),
  // so this layout just acts as a structural container. The actual
  // DashboardShell + nav is in a client component shared by each page.
  return <>{children}</>
}
