import React, { Children, createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

export function BrowserRouter({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (to) => {
    if (to === window.location.pathname) return
    window.history.pushState({}, '', to)
    setPathname(to)
  }
  const value = useMemo(() => ({ pathname, navigate }), [pathname])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useLocation() {
  const { pathname } = useContext(RouterContext)
  return { pathname }
}

export function NavLink({ to, end = false, className = '', children, ...props }) {
  const { pathname, navigate } = useContext(RouterContext)
  const active = end ? pathname === to : pathname === to || (to !== '/' && pathname.startsWith(`${to}/`))
  const finalClass = `${typeof className === 'function' ? className({ isActive: active }) : className}${active ? ' active' : ''}`.trim()
  return <a href={to} className={finalClass} onClick={(event) => {
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
