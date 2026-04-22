import { useState, useEffect, useMemo } from 'react'
import { Search, RefreshCw, AlertCircle } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

const POSITION_FILTERS = [
  { key: 'all',   label: 'Todas',      test: () => true },
  { key: 'top3',  label: 'Top 3',      test: (p) => p <= 3 },
  { key: 'top10', label: 'Top 10',     test: (p) => p <= 10 },
  { key: 'top20', label: 'Top 20',     test: (p) => p <= 20 },
  { key: '21-50', label: 'Pos. 21–50', test: (p) => p >= 21 && p <= 50 },
]

function PositionBadge({ position }) {
  if (!position) return <span className="text-gray-300">—</span>
  if (position <= 3)
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
        style={{ background: '#C5003E' }}
      >
        {position}
      </span>
    )
  if (position <= 10)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        {position}
      </span>
    )
  return <span className="font-medium text-gray-600">{position}</span>
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div
        className="w-9 h-9 rounded-full border-[3px] border-t-transparent animate-spin"
        style={{ borderColor: '#C5003E', borderTopColor: 'transparent' }}
      />
      <p className="text-sm text-gray-400">Consultando DataForSEO…</p>
    </div>
  )
}

export default function Rankings() {
  const { selectedCountry } = useCountry()
  const [keywords, setKeywords] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [textFilter, setTextFilter] = useState('')
  const [posFilter, setPosFilter]   = useState('all')

  async function fetchRankings(country) {
    setLoading(true)
    setError(null)
    setKeywords([])
    setTotal(0)
    try {
      const res = await fetch('/api/rankings/organic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain:        country.domain,
          location_code: country.location_code,
          language_code: country.language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`)
      setKeywords(data.keywords)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch whenever the active country changes
  useEffect(() => {
    setTextFilter('')
    setPosFilter('all')
    fetchRankings(selectedCountry)
  }, [selectedCountry])

  const filtered = useMemo(() => {
    const posTest = POSITION_FILTERS.find((f) => f.key === posFilter)?.test ?? (() => true)
    const needle  = textFilter.toLowerCase()
    return keywords.filter(
      (k) => k.keyword.toLowerCase().includes(needle) && posTest(k.position)
    )
  }, [keywords, textFilter, posFilter])

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rankings por Dominio</h1>
          <p className="text-sm text-gray-400 mt-1">
            {selectedCountry.label} &middot; {selectedCountry.domain}
          </p>
        </div>
        <button
          onClick={() => fetchRankings(selectedCountry)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white transition-colors disabled:opacity-50 flex-shrink-0"
          style={{ background: '#C5003E' }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#a0002f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C5003E')}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6"
          style={{ background: '#fff1f3', border: '1px solid #fecdd6' }}
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#C5003E' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#C5003E' }}>
              Error al consultar DataForSEO
            </p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Filters — only visible when there's data */}
      {!loading && keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Filtrar keyword…"
              className="border rounded pl-8 pr-4 py-2 text-sm focus:outline-none bg-white w-56"
              style={{ borderColor: '#e5e7eb' }}
              onFocus={(e) => (e.target.style.borderColor = '#C5003E')}
              onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div className="flex gap-1">
            {POSITION_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setPosFilter(f.key)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={
                  posFilter === f.key
                    ? { background: '#C5003E', color: '#fff' }
                    : { background: '#f3f4f6', color: '#6b7280' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} de {keywords.length} keywords
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && keywords.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-14 text-center text-sm text-gray-400">
          No se encontraron keywords rankeadas para{' '}
          <strong style={{ color: '#C5003E' }}>{selectedCountry.domain}</strong>
        </div>
      )}

      {/* Results table */}
      {!loading && keywords.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#222222' }}>
                {['#', 'Keyword', 'Posición', 'Volumen', 'Tráfico est.', 'URL'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Ninguna keyword coincide con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filtered.map((kw, i) => (
                  <tr
                    key={kw.keyword + i}
                    style={{ background: i % 2 === 0 ? '#ffffff' : '#f9f9f9' }}
                  >
                    <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{kw.keyword}</td>
                    <td className="px-4 py-3">
                      <PositionBadge position={kw.position} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {kw.search_volume != null ? kw.search_volume.toLocaleString('es-CL') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {kw.traffic != null ? kw.traffic.toLocaleString('es-CL') : '—'}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {kw.url ? (
                        <a
                          href={kw.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-xs hover:underline"
                          style={{ color: '#C5003E', maxWidth: '260px' }}
                          title={kw.url}
                        >
                          {kw.url.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer note */}
      {!loading && (
        <p className="text-xs text-gray-400 mt-3">
          Fuente: DataForSEO · {selectedCountry.country_code} · location_code{' '}
          {selectedCountry.location_code}
          {total > keywords.length && ` · mostrando ${keywords.length} de ${total} keywords`}
        </p>
      )}
    </div>
  )
}
