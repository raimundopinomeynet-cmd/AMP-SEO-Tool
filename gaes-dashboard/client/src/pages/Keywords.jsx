import { useState } from 'react'
import { Search, AlertCircle, ExternalLink } from 'lucide-react'
import { useCountry } from '../context/CountryContext'

// ─── helpers ──────────────────────────────────────────────────────────────────

async function safeFetch(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`)
  return data
}

function activeDomainOf(url, domain) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const target   = domain.replace(/^www\./, '')
    return hostname === target
  } catch {
    return false
  }
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DifficultyBadge({ value }) {
  if (value == null) return <span className="text-gray-300">—</span>
  if (value < 30)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
        <span>{value}</span>
        <span className="font-normal opacity-70">Fácil</span>
      </span>
    )
  if (value <= 60)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
        <span>{value}</span>
        <span className="font-normal opacity-70">Medio</span>
      </span>
    )
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: 'rgba(197,0,62,0.1)', color: '#C5003E' }}
    >
      <span>{value}</span>
      <span className="font-normal opacity-70">Difícil</span>
    </span>
  )
}

function CompetitionLabel({ level }) {
  const map = {
    LOW:    { label: 'Baja',   cls: 'text-green-600' },
    MEDIUM: { label: 'Media',  cls: 'text-yellow-600' },
    HIGH:   { label: 'Alta',   cls: 'text-red-600' },
  }
  const cfg = map[level]
  if (!cfg) return <span className="text-gray-300">—</span>
  return <span className={`text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
}

function SectionSpinner({ label }) {
  return (
    <div className="flex items-center gap-3 py-12 justify-center">
      <div
        className="w-7 h-7 rounded-full border-[3px] border-t-transparent animate-spin"
        style={{ borderColor: '#C5003E', borderTopColor: 'transparent' }}
      />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg"
      style={{ background: '#fff1f3', border: '1px solid #fecdd6' }}
    >
      <AlertCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#C5003E' }} />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

const TABLE_HEADER_STYLE = { background: '#222222', color: 'rgba(255,255,255,0.6)' }
const TH = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
    style={TABLE_HEADER_STYLE}>
    {children}
  </th>
)

// ─── main page ────────────────────────────────────────────────────────────────

export default function Keywords() {
  const { selectedCountry } = useCountry()

  const [seedInput, setSeedInput] = useState('')
  const [submitted, setSubmitted] = useState('')   // keyword that was actually searched

  const [ideas, setIdeas]           = useState([])
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [ideasError, setIdeasError]     = useState(null)

  const [serp, setSerp]             = useState([])
  const [serpLoading, setSerpLoading]   = useState(false)
  const [serpError, setSerpError]       = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    const kw = seedInput.trim()
    if (!kw) return

    setSubmitted(kw)
    setIdeas([])
    setSerp([])
    setIdeasLoading(true)
    setSerpLoading(true)
    setIdeasError(null)
    setSerpError(null)

    const base = {
      location_code: selectedCountry.location_code,
      language_code: selectedCountry.language,
    }

    const [ideasResult, serpResult] = await Promise.allSettled([
      safeFetch('/api/keywords/ideas', { ...base, seed_keyword: kw }),
      safeFetch('/api/keywords/serp',  { ...base, keyword: kw }),
    ])

    if (ideasResult.status === 'fulfilled') {
      setIdeas(ideasResult.value.keywords ?? [])
    } else {
      setIdeasError(ideasResult.reason.message)
    }
    setIdeasLoading(false)

    if (serpResult.status === 'fulfilled') {
      setSerp(serpResult.value.results ?? [])
    } else {
      setSerpError(serpResult.reason.message)
    }
    setSerpLoading(false)
  }

  const hasResults = ideas.length > 0 || serp.length > 0 || ideasError || serpError

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Keyword Research</h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedCountry.label} &middot; {selectedCountry.domain}
        </p>
      </header>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-2xl">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder={`Ej: audífonos, centro auditivo...`}
            className="w-full border rounded pl-9 pr-4 py-2.5 text-sm focus:outline-none bg-white"
            style={{ borderColor: '#e5e7eb' }}
            onFocus={(e) => (e.target.style.borderColor = '#C5003E')}
            onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>
        <button
          type="submit"
          disabled={ideasLoading || serpLoading}
          className="px-6 py-2.5 rounded text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: '#C5003E' }}
          onMouseEnter={(e) => !(ideasLoading || serpLoading) && (e.currentTarget.style.background = '#a0002f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C5003E')}
        >
          Buscar
        </button>
      </form>

      {/* Initial empty state */}
      {!hasResults && !ideasLoading && !serpLoading && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Ingresa una keyword para ver ideas y el SERP actual en{' '}
          <strong style={{ color: '#C5003E' }}>{selectedCountry.label}</strong>
        </div>
      )}

      {/* ── Section 1: Keyword Ideas ── */}
      {(ideasLoading || ideasError || ideas.length > 0) && (
        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-base font-semibold text-gray-700">Ideas de keywords</h2>
            {submitted && (
              <span className="text-xs text-gray-400">
                seed: <em className="not-italic font-medium" style={{ color: '#C5003E' }}>{submitted}</em>
                {ideas.length > 0 && ` · ${ideas.length} resultados`}
              </span>
            )}
          </div>

          {ideasLoading && <SectionSpinner label="Cargando keyword ideas…" />}
          {ideasError   && <ErrorBanner message={`Error keyword ideas: ${ideasError}`} />}

          {!ideasLoading && ideas.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <TH>Keyword</TH>
                    <TH>Volumen</TH>
                    <TH>Dificultad</TH>
                    <TH>CPC (USD)</TH>
                    <TH>Competencia</TH>
                  </tr>
                </thead>
                <tbody>
                  {ideas.map((kw, i) => (
                    <tr
                      key={kw.keyword + i}
                      style={{ background: i % 2 === 0 ? '#ffffff' : '#f9f9f9' }}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{kw.keyword}</td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {kw.search_volume != null ? kw.search_volume.toLocaleString('es-CL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <DifficultyBadge value={kw.keyword_difficulty} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <CompetitionLabel level={kw.competition_level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── Section 2: SERP ── */}
      {(serpLoading || serpError || serp.length > 0) && (
        <section>
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-base font-semibold text-gray-700">SERP actual</h2>
            {submitted && (
              <span className="text-xs text-gray-400">
                keyword:{' '}
                <em className="not-italic font-medium" style={{ color: '#C5003E' }}>{submitted}</em>
                {' '}&middot; Google {selectedCountry.country_code}
                {serp.length > 0 && ` · top ${serp.length}`}
              </span>
            )}
          </div>

          {serpLoading && <SectionSpinner label="Consultando SERP en Google…" />}
          {serpError   && <ErrorBanner message={`Error SERP: ${serpError}`} />}

          {!serpLoading && serp.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <TH>#</TH>
                    <TH>Dominio</TH>
                    <TH>Título</TH>
                    <TH>URL</TH>
                  </tr>
                </thead>
                <tbody>
                  {serp.map((row, i) => {
                    const isGaes = activeDomainOf(row.url, selectedCountry.domain)
                    return (
                      <tr
                        key={row.url + i}
                        style={{
                          background: isGaes
                            ? 'rgba(197,0,62,0.05)'
                            : i % 2 === 0 ? '#ffffff' : '#f9f9f9',
                          borderLeft: isGaes ? '3px solid #C5003E' : '3px solid transparent',
                        }}
                      >
                        {/* Position */}
                        <td className="px-4 py-3 text-center w-10">
                          {row.position <= 3 ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                              style={{ background: '#C5003E' }}
                            >
                              {row.position}
                            </span>
                          ) : (
                            <span className="text-gray-500 font-medium tabular-nums">
                              {row.position}
                            </span>
                          )}
                        </td>

                        {/* Domain */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="text-xs font-medium"
                            style={{ color: isGaes ? '#C5003E' : '#374151' }}
                          >
                            {row.domain}
                          </span>
                          {isGaes && (
                            <span
                              className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold text-white"
                              style={{ background: '#C5003E' }}
                            >
                              GAES
                            </span>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-gray-800 line-clamp-2 text-xs leading-snug">
                            {row.title}
                          </p>
                          {row.description && (
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                              {row.description}
                            </p>
                          )}
                        </td>

                        {/* URL */}
                        <td className="px-4 py-3 max-w-xs">
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs hover:underline truncate"
                            style={{ color: '#C5003E', maxWidth: '220px' }}
                            title={row.url}
                          >
                            <span className="truncate">
                              {row.url.replace(/^https?:\/\//, '')}
                            </span>
                            <ExternalLink size={11} className="flex-shrink-0 opacity-60" />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      {(ideas.length > 0 || serp.length > 0) && (
        <p className="text-xs text-gray-400 mt-4">
          Fuente: DataForSEO · {selectedCountry.country_code} · location_code{' '}
          {selectedCountry.location_code} · idioma {selectedCountry.language}
        </p>
      )}
    </div>
  )
}
