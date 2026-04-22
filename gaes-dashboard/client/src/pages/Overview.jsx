import { useState, useEffect, useMemo } from 'react'
import { Search, TrendingUp, BarChart2, Activity, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCountry } from '../context/CountryContext'

// ─── Skeletons ────────────────────────────────────────────────────────────────

function Pulse({ style }) {
  return (
    <div
      className="animate-pulse rounded"
      style={{ background: 'rgba(255,255,255,0.08)', ...style }}
    />
  )
}

function KpiSkeleton() {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-4"
      style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
    >
      <div className="flex items-center justify-between">
        <Pulse style={{ height: 10, width: 96 }} />
        <Pulse style={{ height: 14, width: 14 }} />
      </div>
      <Pulse style={{ height: 36, width: 72 }} />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div
      className="rounded-lg p-6"
      style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
    >
      <Pulse style={{ height: 14, width: 200, marginBottom: 8 }} />
      <Pulse style={{ height: 10, width: 140, marginBottom: 28 }} />
      <div className="flex items-end gap-6 h-52 px-4">
        {[55, 80, 40, 25].map((h, i) => (
          <Pulse
            key={i}
            style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0' }}
          />
        ))}
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div
      className="rounded-lg p-6"
      style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
    >
      <Pulse style={{ height: 14, width: 200, marginBottom: 8 }} />
      <Pulse style={{ height: 10, width: 150, marginBottom: 28 }} />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Pulse style={{ height: 12, width: 16 }} />
            <Pulse style={{ height: 12, flex: 1 }} />
            <Pulse style={{ height: 12, width: 28 }} />
            <Pulse style={{ height: 12, width: 52 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recharts custom tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded px-3 py-2 text-xs shadow-lg"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
    >
      <p className="font-semibold mb-0.5">{label}</p>
      <p style={{ color: '#C5003E' }}>
        {payload[0].value} keyword{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Overview() {
  const { selectedCountry } = useCountry()

  const [keywords, setKeywords] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setKeywords([])
      try {
        const res = await fetch('/api/rankings/organic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain:        selectedCountry.domain,
            location_code: selectedCountry.location_code,
            language_code: selectedCountry.language,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`)
        if (!cancelled) setKeywords(data.keywords ?? [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedCountry])

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = keywords.length
    if (total === 0) return { total: 0, top3: 0, top10: 0, avgPos: null }
    const top3  = keywords.filter((k) => k.position <= 3).length
    const top10 = keywords.filter((k) => k.position <= 10).length
    const sum   = keywords.reduce((s, k) => s + (k.position ?? 0), 0)
    return { total, top3, top10, avgPos: Math.round(sum / total) }
  }, [keywords])

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = useMemo(() => [
    { name: 'Top 3',    count: keywords.filter((k) => k.position <= 3).length },
    { name: '4 – 10',   count: keywords.filter((k) => k.position >= 4  && k.position <= 10).length },
    { name: '11 – 20',  count: keywords.filter((k) => k.position >= 11 && k.position <= 20).length },
    { name: '21 – 50',  count: keywords.filter((k) => k.position >= 21 && k.position <= 50).length },
  ], [keywords])

  // ── Top 10 by search volume ─────────────────────────────────────────────────
  const topByVolume = useMemo(
    () =>
      [...keywords]
        .sort((a, b) => (b.search_volume ?? 0) - (a.search_volume ?? 0))
        .slice(0, 10),
    [keywords]
  )

  // ── KPI card definitions ────────────────────────────────────────────────────
  const KPI_CARDS = [
    { label: 'Keywords rankeando', value: kpis.total,  icon: Search    },
    { label: 'Top 10',             value: kpis.top10,  icon: TrendingUp },
    { label: 'Top 3',              value: kpis.top3,   icon: BarChart2  },
    { label: 'Posición promedio',  value: kpis.avgPos ?? '—', icon: Activity },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h1>
        <p className="text-sm text-gray-400 mt-1">
          {selectedCountry.label} &middot; {selectedCountry.domain}
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6"
          style={{ background: '#fff1f3', border: '1px solid #fecdd6' }}
        >
          <AlertCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#C5003E' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#C5003E' }}>
              Error al cargar datos
            </p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : KPI_CARDS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-lg p-5 flex flex-col gap-4"
                style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {label}
                  </span>
                  <Icon size={15} style={{ color: '#C5003E' }} />
                </div>
                <span className="text-3xl font-bold text-white tabular-nums">
                  {value}
                </span>
              </div>
            ))}
      </div>

      {/* ── Distribution chart ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="mb-6">
          <ChartSkeleton />
        </div>
      ) : !error && keywords.length > 0 ? (
        <div
          className="rounded-lg p-6 mb-6"
          style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
        >
          <h2 className="font-semibold text-white mb-1">Distribución de posiciones</h2>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Cantidad de keywords por rango &middot; {selectedCountry.domain}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              barSize={48}
              margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                width={32}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="count" fill="#C5003E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* ── Top 10 by volume ─────────────────────────────────────────────────── */}
      {loading ? (
        <TableSkeleton />
      ) : !error && (
        <div
          className="rounded-lg p-6"
          style={{ background: '#222222', borderTop: '3px solid #C5003E' }}
        >
          <h2 className="font-semibold text-white mb-1">Top 10 por volumen de búsqueda</h2>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Keywords con mayor volumen mensual &middot; {selectedCountry.domain}
          </p>

          {topByVolume.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sin datos para {selectedCountry.domain}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['#', 'Keyword', 'Posición', 'Volumen'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-3 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topByVolume.map((kw, i) => (
                  <tr
                    key={kw.keyword + i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <td
                      className="py-3 pr-4 text-xs tabular-nums w-8"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {i + 1}
                    </td>
                    <td className="py-3 pr-6 font-medium text-white">{kw.keyword}</td>
                    <td className="py-3 pr-6">
                      {kw.position <= 3 ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                          style={{ background: '#C5003E' }}
                        >
                          {kw.position}
                        </span>
                      ) : (
                        <span
                          className="text-sm tabular-nums"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                        >
                          {kw.position}
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 tabular-nums text-sm"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      {kw.search_volume != null
                        ? kw.search_volume.toLocaleString('es-CL')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Footer */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 mt-3">
          Fuente: DataForSEO &middot; {selectedCountry.country_code} &middot; location_code{' '}
          {selectedCountry.location_code}
          {keywords.length > 0 && ` · ${keywords.length} keywords analizadas`}
        </p>
      )}
    </div>
  )
}
