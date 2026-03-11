import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="app-shell__eyebrow">Vivato Template</p>
          <h1 className="app-shell__title">React + ASP.NET Core platform foundation</h1>
        </div>
        <nav className="app-shell__nav" aria-label="Primary navigation">
          <Link to="/">Home</Link>
        </nav>
      </header>

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}
