import BeadEditor from "@/components/bead-editor"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-3xl font-bold">BeadCrafter</h1>
          <nav className="flex gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Guide
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create Your Bead Art</h2>
            <p className="mt-2 text-muted-foreground">
              Design beautiful bead patterns for bracelets, ornaments, tapestries, and more
            </p>
          </div>
          <BeadEditor />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BeadCrafter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

