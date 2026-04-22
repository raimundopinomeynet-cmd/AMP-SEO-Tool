import { Routes, Route, Navigate } from 'react-router-dom'
import { CountryProvider } from './context/CountryContext'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Rankings from './pages/Rankings'
import Keywords from './pages/Keywords'

function App() {
  return (
    <CountryProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="keywords" element={<Keywords />} />
        </Route>
      </Routes>
    </CountryProvider>
  )
}

export default App
