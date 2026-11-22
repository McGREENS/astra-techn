// Sets obsidian body background for the entire public store route.
// Prevents the global white body background bleeding through the bottom nav
// on mobile devices.
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Scoped style that overrides the global white body bg for this route */}
      <style>{`body { background: #0B0B0D !important; }`}</style>
      {children}
    </>
  )
}
