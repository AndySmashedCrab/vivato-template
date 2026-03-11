import { AppProviders } from './app/providers/AppProviders'
import { RouteContainer } from './app/routing/RouteContainer'

function App() {
  return (
    <AppProviders>
      <RouteContainer />
    </AppProviders>
  )
}

export default App
