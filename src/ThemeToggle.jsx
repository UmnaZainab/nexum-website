import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Moon, Sun } from './icons'

const THEME_KEY = 'nexum-theme'
const readTheme = () => {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' }
  catch { return 'dark' }
}

export function useSiteTheme() {
  const [theme, setTheme] = useState(readTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F4F7FB' : '#06111E')
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* Storage may be unavailable. */ }
  }, [theme])

  useEffect(() => {
    const sync = event => {
      if (event.key === THEME_KEY) setTheme(event.newValue === 'light' ? 'light' : 'dark')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return [theme, setTheme]
}

export default function ThemeToggle({ theme, setTheme }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return <button type="button" className="theme-toggle" onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
    {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
  </button>
}
