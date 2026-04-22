import { useState, useEffect } from 'react'

function Home() {
  const [status, setStatus] = useState('checking...')
  const [connected, setConnected] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status)
        setConnected(true)
      })
      .catch(() => {
        setStatus('error')
        setConnected(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-gray-800">GAES Dashboard</h1>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-3 w-full max-w-sm">
        <p className="text-gray-500 text-sm">Backend connection</p>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              connected === true
                ? 'bg-green-500'
                : connected === false
                ? 'bg-red-500'
                : 'bg-yellow-400'
            }`}
          />
          <span className="font-medium text-gray-700">
            {connected === true
              ? `Connected — status: ${status}`
              : connected === false
              ? 'Could not reach /api/health'
              : 'Connecting…'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
