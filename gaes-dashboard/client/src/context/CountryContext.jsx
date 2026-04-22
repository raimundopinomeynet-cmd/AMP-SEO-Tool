import { createContext, useContext, useState } from 'react'
import { COUNTRIES } from '../constants/countries'

const CountryContext = createContext(null)

export function CountryProvider({ children }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, COUNTRIES }}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const ctx = useContext(CountryContext)
  if (!ctx) throw new Error('useCountry must be used within CountryProvider')
  return ctx
}
