import { useState } from 'react'
import { Search } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

function DifficultyBadge({ level }) {
  const config = {
    easy:   { label: 'Fácil',  style: { background: '#dcfce7', color: '#15803d' } },
    medium: { label: 'Medio',  style: { background: '#fef9c3', color: '#a16207' } },
    hard:   { label: 'Difícil',style: { background: 'rgba(197,0,62,0.1)', color: '#C5003E' } },
  }
  const { label, style } = config[level] ?? config.medium
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={style}>
      {label}
    </span>
  )
}

export default function Keywords() {
  const { selectedCountry } = useCountry()
  const [query, setQuery] = useState('')

  return (
    <div className="p-8">
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Keyword Research</h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedCountry.label} &middot; {selectedCountry.domain}
        </p>
      </header>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar keywords para ${selectedCountry.domain}...`}
            className="w-full border border-gray-200 rounded pl-9 pr-4 py-2 text-sm focus:outline-none bg-white"
            style={{ borderColor: '#e5e7eb' }}
            onFocus={(e) => (e.target.style.borderColor = '#C5003E')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>
        <button
          className="px-5 py-2 rounded text-sm font-medium text-white transition-colors"
          style={{ background: '#C5003E' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#a0002f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C5003E')}
        >
          Buscar
        </button>
      </div>

      {/* Difficulty legend */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xs text-gray-400">Dificultad:</span>
        <DifficultyBadge level="easy" />
        <DifficultyBadge level="medium" />
        <DifficultyBadge level="hard" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#222222' }}>
              {['Keyword', 'Vol. mensual', 'Dificultad', 'CPC (USD)', 'Competencia'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                Ingresa una keyword y conecta la API para ver resultados en{' '}
                <strong style={{ color: '#C5003E' }}>{selectedCountry.label}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Fuente: DataForSEO · idioma {selectedCountry.language} · location_code {selectedCountry.location_code}
      </p>
    </div>
  )
}
