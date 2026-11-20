import React, { useEffect, useRef, useState } from 'react'
import { defaultPricingItems, formatPrice } from './pricingItems.js'

const bookingUrl = 'https://calendly.com/nexumglobalsolutions'
const channelTabs = [
  ['all', 'All Channels'],
  ['search', 'Search & SEO'],
  ['paid', 'Paid Social'],
  ['content', 'Content & Email'],
]
const campaigns = [
  { id: 'search', icon: '⌕', title: 'Search & SEO', value: 284, metric: 'Qualified Leads', copy: 'Commercial search demand entering the pipeline' },
  { id: 'search', icon: '◎', title: 'Conversion Journey', value: 8.6, suffix: '%', decimal: 1, metric: 'Conversion Rate', copy: 'Tracked visits becoming meaningful inquiries' },
  { id: 'paid', icon: '↗', title: 'Paid Media', value: 4.2, suffix: 'x', decimal: 1, metric: 'Measured ROAS', copy: 'Revenue attribution across paid campaigns' },
  { id: 'content', icon: '✉', title: 'Pipeline Growth', value: 8.4, prefix: 'Rs ', suffix: 'm', decimal: 1, metric: 'Pipeline Value', copy: 'Opportunities shaped by connected channels' },
]
const deliverables = [
  ['SEO Technical Audit', 'Live', 'search'],
  ['Meta Conversion Campaign', 'Scaling', 'paid'],
  ['Monthly Content Calendar', 'Approved', 'content'],
]
const attributionBars = [
  ['Search Intent', 68, 'search'],
  ['Paid Social', 48, 'paid'],
  ['Content Assets', 56, 'content'],
  ['Email Sequences', 34, 'content'],
]
const addOns = [
  { id: 'seo-audit', name: 'Technical SEO Audit & Fixes', amount: 18000, period: 'one time', icon: '⌕' },
  { id: 'ads-setup', name: 'Google & Meta Ads Setup', amount: 22000, period: 'one time', icon: '↗' },
  { id: 'content-pack', name: 'Monthly Social Content & Reels Pack', amount: 25000, period: 'month', icon: '◎' },
  { id: 'email-setup', name: 'Email Automation & Funnel Setup', amount: 20000, period: 'one time', icon: '✉' },
]
const engagement = ['100% Ad Account Ownership', 'Conversion Tracking First', 'Pipeline Based Reporting', 'Dedicated Account Strategist']

const detailedFaqs = [
  ['How long does SEO take to produce results?', 'Technical fixes and indexing improvements can produce early movement within weeks, but dependable organic leads usually take several months. Competitive commercial searches require content depth, authority, and ongoing refinement. We establish a baseline first, report leading indicators such as qualified visibility, and set expectations around your market rather than promise a fixed ranking date.'],
  ['Do you require a minimum ad budget?', 'We do not apply one budget to every business. We recommend a spend level that can generate enough conversion data to learn and improve, based on your market and acquisition goals. Conversion tracking and account access are configured before meaningful spend begins, and we agree on the test budget with you before launch.'],
  ['Which platforms and tools do you work with?', 'We work with Google Analytics, HubSpot, Meta Ads, LinkedIn Ads, Buffer, and relevant tools already in your stack. The channel mix follows your buyers and goals, so a platform is included only when it has a clear role. We connect reporting where access and data quality permit.'],
  ['How is performance reported?', 'Reporting starts with the outcomes agreed during onboarding, including qualified leads, conversion rate, acquisition cost, and pipeline contribution. We show which channels influenced those outcomes and explain what changed. Each review includes decisions about creative, targeting, landing pages, and budget for the next period.'],
  ['Do we keep our accounts and data?', 'Yes. Your business retains ownership of its advertising accounts, analytics properties, customer data, and approved creative assets. We work through appropriate access permissions rather than holding accounts in our name. You can review activity and retain your reporting history throughout the engagement.'],
  ['Which platforms should we be on?', 'We begin with where your buyers research, compare, and make decisions. Search may capture active demand, while selected social channels can build preference and support retargeting. We recommend a focused mix with a clear purpose for each platform, then adjust it based on measured return.'],
  ['Do you create the content or do we supply it?', 'We can plan the calendar and produce copy, creative, and campaign assets as part of the agreed scope. Your team can also provide brand materials, product knowledge, footage, or existing content. We set a practical review and approval process so publishing remains consistent and accurate.'],
  ['How do you handle negative comments?', 'We agree on a response guide, escalation contacts, and business hours before community management begins. Routine questions and concerns receive timely, respectful replies. Sensitive complaints, legal issues, or reputational risks are escalated to your team rather than answered without approval.'],
  ['How is success measured?', 'We define success in terms of qualified demand and pipeline, not engagement alone. Tracking links campaign and social activity to meaningful actions such as inquiries, booked conversations, and sales opportunities where the data is available. Regular reviews compare performance with the agreed baseline and guide the next investment decision.'],
]

function useInView() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.12 })
    observer.observe(node)
    const fallback = window.setTimeout(() => setVisible(true), 5000)
    return () => { observer.disconnect(); window.clearTimeout(fallback) }
  }, [])
  return [ref, visible]
}

function CountMetric({ value, prefix = '', suffix = '', decimal = 0, active }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!active) { setDisplay(0); return }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) { setDisplay(value); return }
    const start = performance.now()
    let frame
    const tick = now => {
      const progress = Math.min((now - start) / 950, 1)
      setDisplay(value * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, active])
  return <>{prefix}{display.toFixed(decimal)}{suffix}</>
}

function RevealCard({ children, className = '', index = 0 }) {
  const [ref, visible] = useInView()
  return <article ref={ref} className={`reveal-card ${visible ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${index * 85}ms` }}>{children}</article>
}

export function GrowthShowcase() {
  const [channel, setChannel] = useState('all')
  const [barsReady, setBarsReady] = useState(false)
  const [ref, visible] = useInView()
  useEffect(() => {
    setBarsReady(false)
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setBarsReady(true); return }
    let secondFrame
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => setBarsReady(true)) })
    return () => { cancelAnimationFrame(firstFrame); if (secondFrame) cancelAnimationFrame(secondFrame) }
  }, [channel, visible])
  const ring = {
    all: ['conic-gradient(#E60016 0 42%, #F97383 42% 70%, #A35AE4 70% 88%, #5A85D5 88% 100%)', '4 channels'],
    search: ['conic-gradient(#E60016 0 68%, #F97383 68% 82%, #A35AE4 82% 93%, #5A85D5 93% 100%)', '68% search'],
    paid: ['conic-gradient(#E60016 0 24%, #F97383 24% 72%, #A35AE4 72% 89%, #5A85D5 89% 100%)', '48% paid'],
    content: ['conic-gradient(#E60016 0 20%, #F97383 20% 44%, #A35AE4 44% 77%, #5A85D5 77% 100%)', '56% content'],
  }[channel]
  return <div className="growth-studio" ref={ref}>
    <div className="studio-browser">
      <span className="browser-dots" aria-hidden="true"><i/><i/><i/></span>
      <span>studio.nexum/growth</span>
      <strong><i/> LIVE STUDIO PREVIEW</strong>
    </div>
    <div className="studio-inner">
      <div className="studio-heading">
        <div><span className="eyebrow">NEXUM CAMPAIGN INTELLIGENCE</span><h2>Nexum Campaign & Growth Studio</h2><p>See how connected channels move attention into measurable opportunity.</p></div>
        <span className="studio-period">THIS QUARTER <b>●</b> ACTIVE</span>
      </div>
      <div className="studio-tabs" role="tablist" aria-label="Campaign channels">
        {channelTabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={channel === id} className={channel === id ? 'active' : ''} onClick={() => setChannel(id)}>{label}</button>)}
      </div>
      <div className="campaign-grid kpi-campaign-grid" key={channel}>
        {campaigns.map((card, index) => <RevealCard key={card.title} className={`campaign-card ${channel !== 'all' && channel !== card.id ? 'muted' : ''}`} index={index}>
          <span className="campaign-icon" aria-hidden="true">{card.icon}</span>
          <h3>{card.title}</h3>
          <div className="campaign-value"><CountMetric value={card.value} prefix={card.prefix} suffix={card.suffix} decimal={card.decimal} active={visible}/><small>{card.metric}</small></div>
          <p>{card.copy}</p>
        </RevealCard>)}
      </div>
      <div className="studio-split studio-attribution-split">
        <section className="studio-panel"><div className="panel-title"><span className="panel-icon" aria-hidden="true">◎</span><h3>Channel Attribution Breakdown</h3></div>
          <div className="attribution-content"><div className="attribution-ring" style={{ background: ring[0] }}><div><strong>{ring[1]}</strong><small>attributed mix</small></div></div><div className="attribution-legend"><span><i/>Search Intent</span><span><i/>Paid Social</span><span><i/>Content Assets</span><span><i/>Email Sequences</span></div></div>
          <div className="attribution-bars">{attributionBars.map(([label, amount, id]) => <div className={channel !== 'all' && channel !== id ? 'attribution-bar muted' : 'attribution-bar'} key={label}><div><span>{label}</span><b>{amount}%</b></div><div className="attribution-track"><span style={{ width: barsReady && (channel === 'all' || channel === id) ? `${amount}%` : '0%' }}/></div></div>)}</div>
        </section>
        <section className="studio-panel"><div className="panel-title"><span className="panel-icon" aria-hidden="true">✓</span><h3>Active Client Deliverables</h3></div>
          <div className="deliverable-list">{deliverables.map(([name, status, id], index) => <div className={channel !== 'all' && channel !== id ? 'deliverable-row muted' : 'deliverable-row'} style={{ '--reveal-delay': `${index * 90}ms` }} key={name}><span className="deliverable-check">✓</span><span>{name}</span><span className="deliverable-dot" aria-hidden="true">·</span><span className="status-pill"><i/>{status}</span></div>)}</div>
        </section>
      </div>
      <p className="studio-disclaimer">Illustrative studio preview. Figures are sample data.</p>
    </div>
  </div>
}

export function CenteredHero() {
  return <section className="hero section centered-hero" id="home">
    <span className="hero-badge">PERFORMANCE DRIVEN GROWTH STUDIO</span>
    <h1><span className="headline-line">Marketing measured on</span><span className="headline-line headline-gradient">what it actually produces.</span></h1>
    <p>Comprehensive Digital Marketing and Social Media programmes built around commercial search intent, conversion tracking, and measurable pipeline growth.</p>
    <div className="hero-actions"><a className="btn primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a Demo →</a><a className="btn outline" href="#services">Explore Services</a></div>
    <div className="trust">{['Conversion tracked spend','Full account ownership','Pipeline focused reporting'].map(item => <span key={item}><b>✓</b>{item}</span>)}</div>
    <GrowthShowcase/>
  </section>
}

export function PricingBuilder({ tiers }) {
  const [amounts, setAmounts] = useState(() => Object.fromEntries(defaultPricingItems.map(item => [item.id, item.defaultAmount])))
  const [selectedPlans, setSelectedPlans] = useState([])
  const [selectedExtras, setSelectedExtras] = useState([])
  useEffect(() => {
    let active = true
    const load = () => fetch('/.netlify/functions/pricing', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!active || !result?.ok || !Array.isArray(result.items)) return
        setAmounts(current => Object.fromEntries(defaultPricingItems.map(item => {
          const live = result.items.find(entry => entry.id === item.id)?.amount
          return [item.id, typeof live === 'number' && Number.isFinite(live) ? live : current[item.id]]
        })))
      }).catch(() => {})
    load()
    const onVisible = () => { if (!document.hidden) load() }
    window.addEventListener('focus', load)
    document.addEventListener('visibilitychange', onVisible)
    return () => { active = false; window.removeEventListener('focus', load); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  const toggle = (setter, id) => setter(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const selectedAddOns = addOns.filter(item => selectedExtras.includes(item.id))
  const monthly = selectedPlans.reduce((sum, id) => sum + (amounts[id] || 0), 0) + selectedAddOns.filter(item => item.period === 'month').reduce((sum, item) => sum + item.amount, 0)
  const oneTime = selectedAddOns.filter(item => item.period === 'one time').reduce((sum, item) => sum + item.amount, 0)
  const count = selectedPlans.length + selectedExtras.length
  return <section className="section pricing pricing-builder" id="pricing">
    <div className="section-head"><span className="eyebrow">PRICING</span><h2>Clear PKR plans built for measurable growth.</h2><p>Monthly starting amounts update from our live pricing system. Build an estimate before your strategy call.</p></div>
    <div className="pricing-grid">{tiers.map((tier, index) => <RevealCard className={`price-card ${tier.popular ? 'featured' : ''}`} key={tier.id} index={index}>
      <span className="price-icon">{String(index + 1).padStart(2, '0')}</span>{tier.popular && <span className="popular">MOST POPULAR</span>}
      <h3>{tier.name}</h3><p>{tier.copy}</p>
      <div className="price"><strong>{formatPrice(amounts[tier.id])}</strong><span>/ month</span></div>
      <button type="button" className={`btn ${selectedPlans.includes(tier.id) ? 'outline' : 'primary'}`} aria-pressed={selectedPlans.includes(tier.id)} onClick={() => toggle(setSelectedPlans, tier.id)}>{selectedPlans.includes(tier.id) ? 'Added to Plan ✓' : 'Add to Plan'}</button>
      <ul>{tier.features.map(feature => <li key={feature}><b>✓</b>{feature}</li>)}</ul>
    </RevealCard>)}</div>
    <div className="engagement-strip"><h3>Included With Every Engagement</h3><div>{engagement.map(item => <span key={item}><b>✓</b>{item}</span>)}</div></div>
    <div className="add-on-heading"><span className="eyebrow">OPTIONAL CHANNEL ADD ONS</span><h2>Give your plan an extra boost.</h2><p>Pick any add ons you want to discuss. One time fees are shown separately from monthly fees.</p></div>
    <div className="booster-grid">{addOns.map((item, index) => <RevealCard className={`booster-card ${selectedExtras.includes(item.id) ? 'selected' : ''}`} key={item.id} index={index}>
      <span className="booster-icon" aria-hidden="true">{item.icon}</span><h3>{item.name}</h3><div className="booster-price">{formatPrice(item.amount)} <span>/ {item.period}</span></div>
      <button type="button" aria-pressed={selectedExtras.includes(item.id)} onClick={() => toggle(setSelectedExtras, item.id)}>{selectedExtras.includes(item.id) ? 'Added ✓' : 'Add to Plan'}</button>
    </RevealCard>)}</div>
    {count > 0 && <div className="plan-summary combined-summary" role="status"><div><strong>{count} {count === 1 ? 'item' : 'items'} selected</strong><small>{formatPrice(monthly)} monthly + {formatPrice(oneTime)} one time</small></div><div className="summary-total"><span>Estimated first month</span><strong>{formatPrice(monthly + oneTime)}</strong></div><a className="btn primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Continue to Calendly →</a></div>}
  </section>
}

export function MultiOpenFAQ() {
  const [open, setOpen] = useState([])
  return <section className="section faq" id="faq"><div className="section-head"><span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Answers before we begin.</h2></div><div className="faq-list">
    {detailedFaqs.map(([question, answer], index) => <article key={question}><button type="button" aria-expanded={open.includes(index)} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index])}>{question}<b className="faq-indicator" aria-hidden="true"><i/><i/></b></button><div id={`faq-answer-${index}`} className={open.includes(index) ? 'faq-panel open' : 'faq-panel'}><p>{answer}</p></div></article>)}
  </div></section>
}
