import React, { Children, createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)
const readLocation = () => ({ pathname: window.location.pathname, hash: window.location.hash })

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(readLocation)
  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = to => {
    const target = new URL(to, window.location.origin)
    if (target.pathname === location.pathname && target.hash === location.hash) {
      if (target.hash) document.querySelector(target.hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`)
    setLocation({ pathname: target.pathname, hash: target.hash })
  }
  const value = useMemo(() => ({ ...location, navigate }), [location])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useLocation() {
  const { pathname, hash } = useContext(RouterContext)
  return { pathname, hash }
}

export function NavLink({ to, end = false, className = '', children, ...props }) {
  const { pathname, hash, navigate } = useContext(RouterContext)
  const target = new URL(to, window.location.origin)
  const pathMatch = end ? pathname === target.pathname : pathname === target.pathname || (target.pathname !== '/' && pathname.startsWith(`${target.pathname}/`))
  const active = target.hash ? pathMatch && hash === target.hash : pathMatch && (!end || !hash)
  const finalClass = `${typeof className === 'function' ? className({ isActive: active }) : className}${active ? ' active' : ''}`.trim()
  return <a href={to} className={finalClass} onClick={event => {
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      navigate(to)
    }
  }} {...props}>{children}</a>
}

export function Route() { return null }
export function Routes({ children }) {
  const { pathname } = useContext(RouterContext)
  const routes = Children.toArray(children)
  const match = routes.find(route => route.props.path === pathname) || routes.find(route => route.props.path === '*')
  return match?.props.element || null
}
