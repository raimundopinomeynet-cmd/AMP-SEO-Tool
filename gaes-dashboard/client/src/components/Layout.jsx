import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: '#f5f5f5' }}>
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
