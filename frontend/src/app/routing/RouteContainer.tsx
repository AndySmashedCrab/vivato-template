import { useRoutes, type RouteObject } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { getModuleRoutes } from './moduleRoutes'

function HomePage() {
  return (
    <section className="surface">
      <h2>Template shell is ready</h2>
      <p>
        Use the backend host, frontend app shell, and explicit module registration points as the
        starting point for real project work.
      </p>
    </section>
  )
}

const hostRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]

export function RouteContainer() {
  const routes = [...hostRoutes, ...getModuleRoutes()]

  return useRoutes(routes)
}
