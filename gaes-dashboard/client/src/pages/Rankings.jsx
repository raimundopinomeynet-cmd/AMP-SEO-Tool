import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

function PositionBadge({ position }) {
  if (position === null) return <span style={{ color: 'rgba(0,0,0,0.3)' }}>—</span>
  if (position <= 3)
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
        style={{ background: '#C5003E' }}
      >
        {position}
      </span>
    )
  return <span className="font-medium text-gray-700">{position}</span>
}

function TrendIcon({ delta }) {
  if (!delta) return <Minus size={14} className="text-gray-400" />
  if (delta < 0) return <TrendingUp size={14} className="text-green-500" />
  return <TrendingDown size={14} className="text-red-500" />
}

export default function Rankings() {
  const { selectedCountry } = useCountry()

  return (
    <div className="p-8">
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Rankings por Dominio</h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedCountry.label} &middot; {selectedCountry.domain}
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrar por keyword..."
          className="border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none w-64 bg-white"
          style={{ borderColor: '#e5e7eb' }}
          onFocus={(e) => (e.target.style.borderColor = '#C5003E')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
        <button
          className="px-5 py-2 rounded text-sm font-medium text-white transition-colors"
          style={{ background: '#C5003E' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#a0002f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C5003E')}
        >
          Actualizar datos
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#222222' }}>
              {['#', 'Keyword', 'Posición', 'Cambio', 'Volumen', 'URL'].map((h) => (
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
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                Conecta la API para ver los rankings de{' '}
                <strong style={{ color: '#C5003E' }}>{selectedCountry.domain}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Fuente: DataForSEO · {selectedCountry.country_code} · location_code {selectedCountry.location_code}
      </p>
    </div>
  )
}
