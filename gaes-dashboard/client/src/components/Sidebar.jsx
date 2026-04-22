import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Search } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

const NAV_ITEMS = [
  { to: '/overview',  label: 'Resumen Ejecutivo',   icon: LayoutDashboard },
  { to: '/rankings',  label: 'Rankings por Dominio', icon: TrendingUp },
  { to: '/keywords',  label: 'Keyword Research',     icon: Search },
]

export default function Sidebar() {
  const { selectedCountry, setSelectedCountry, COUNTRIES } = useCountry()

  return (
    <aside
      className="w-64 fixed top-0 left-0 h-full z-20 flex flex-col"
      style={{ background: '#222222', color: '#ffffff' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-1.5 h-7 rounded-sm flex-shrink-0" style={{ background: '#C5003E' }} />
        <div className="leading-tight">
          <div className="font-bold text-sm text-white">GAES SEO</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm rounded-r transition-colors ${
                isActive ? 'font-medium' : ''
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    color: '#C5003E',
                    borderLeft: '3px solid #C5003E',
                    background: 'rgba(197,0,62,0.08)',
                    marginLeft: '-8px',
                    paddingLeft: '28px',
                  }
                : {
                    color: 'rgba(255,255,255,0.65)',
                    borderLeft: '3px solid transparent',
                    marginLeft: '-8px',
                    paddingLeft: '28px',
                  }
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Country selector */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <label
          className="block text-xs uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          País / Dominio
        </label>
        <div className="relative">
          <select
            value={selectedCountry.country_code}
            onChange={(e) => {
              const found = COUNTRIES.find((c) => c.country_code === e.target.value)
              if (found) setSelectedCountry(found)
            }}
            className="w-full text-sm rounded px-3 py-2 appearance-none cursor-pointer focus:outline-none transition-colors"
            style={{
              background: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C5003E')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          >
            {COUNTRIES.map((c) => (
              <option key={c.country_code} value={c.country_code} style={{ background: '#2a2a2a' }}>
                {c.label} — {c.domain}
              </option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            ▾
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {selectedCountry.domain} · {selectedCountry.country_code}
        </p>
      </div>
    </aside>
  )
}
