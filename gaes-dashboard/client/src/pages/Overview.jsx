import { Activity, TrendingUp, Search, Globe } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

const KPI_CARDS = [
  { label: 'Keywords rastreadas', value: '—', icon: Search },
  { label: 'Posición promedio',    value: '—', icon: Activity },
  { label: 'Top 10 keywords',      value: '—', icon: TrendingUp },
  { label: 'Páginas indexadas',    value: '—', icon: Globe },
]

export default function Overview() {
  const { selectedCountry } = useCountry()

  return (
    <div className="p-8">
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedCountry.label} &middot; {selectedCountry.domain}
        </p>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg p-5 flex flex-col gap-4"
            style={{
              background: '#222222',
              borderTop: '3px solid #C5003E',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {label}
              </span>
              <Icon size={15} style={{ color: '#C5003E' }} />
            </div>
            <span className="text-3xl font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Trend chart placeholder */}
      <div
        className="rounded-lg p-6 mb-4"
        style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
      >
        <h2 className="text-white font-semibold mb-1">Tendencia de posiciones</h2>
        <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Evolución histórica · {selectedCountry.domain}
        </p>
        <div
          className="h-48 flex items-center justify-center rounded"
          style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
        >
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Gráfico disponible al conectar la API
          </span>
        </div>
      </div>

      {/* Top keywords placeholder */}
      <div
        className="rounded-lg p-6"
        style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
      >
        <h2 className="text-white font-semibold mb-1">Top keywords</h2>
        <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Palabras clave con mejor posición · {selectedCountry.domain}
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Keyword', 'Posición', 'Volumen', 'Estado'].map((h) => (
                <th key={h} className="text-left pb-3 font-medium text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="py-8 text-center text-sm"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                Sin datos · conecta la API DataForSEO
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
