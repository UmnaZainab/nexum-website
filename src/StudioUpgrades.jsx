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
  { id: 'search', icon: '⌕', title: 'Search & Commercial SEO', value: 184, prefix: '+', suffix: '%', metric: 'Organic Pipeline', copy: 'Intent driven rankings & technical fixes' },
  { id: 'paid', icon: '↗', title: 'Paid Search & Meta Ads', value: 4.2, suffix: 'x', decimal: 1, metric: 'Measured ROAS', copy: 'Conversion tracked ad spend' },
  { id: 'content', icon: '◎', title: 'Social Content & Community', value: 98, suffix: '%', metric: 'Response SLA', copy: 'Scheduled calendars & active moderation' },
  { id: 'content', icon: '✉', title: 'Email & Lifecycle Flows', value: 34, suffix: '%', metric: 'Repeat Conversion', copy: 'Automated post visit sequences' },
]
const funnel = [
  { label: 'Search Intent', value: 84, id: 'search' },
  { label: 'Paid Social', value: 72, id: 'paid' },
  { label: 'Content Assets', value: 91, id: 'content' },
  { label: 'Email Sequences', value: 67, id: 'content' },
]
const deliverables = [
  ['SEO Technical Audit', 'Live', 'search'],
  ['Q4 Meta Conversion Campaign', 'Scaling', 'paid'],
  ['Monthly Content Calendar', 'Approved', 'content'],
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
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
  const [ref, visible] = useInView()
  const shown = channel === 'all' ? campaigns : campaigns.filter(card => card.id === channel)
  return <div className="growth-studio" ref={ref}>
    <div className="studio-browser">
      <span className="browser-dots" aria-hidden="true"><i/><i/><i/></span>
      <span>studio.nexum/campaigns</span>
      <strong><i/> LIVE STUDIO PREVIEW</strong>
    </div>
    <div className="studio-inner">
      <div className="studio-heading">
        <div><span className="eyebrow">NEXUM CAMPAIGN INTELLIGENCE</span><h2>Nexum Growth & Campaign Studio</h2><p>See how connected channels move attention into measurable opportunity.</p></div>
        <span className="studio-period">THIS QUARTER <b>●</b> ACTIVE</span>
      </div>
      <div className="studio-tabs" role="tablist" aria-label="Campaign channels">
        {channelTabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={channel === id} className={channel === id ? 'active' : ''} onClick={() => setChannel(id)}>{label}</button>)}
      </div>
      <div className="campaign-grid" key={channel}>
        {shown.map((card, index) => <RevealCard key={card.title} className="campaign-card" index={index}>
          <span className="campaign-icon" aria-hidden="true">{card.icon}</span>
          <h3>{card.title}</h3>
          <div className="campaign-value"><CountMetric value={card.value} prefix={card.prefix} suffix={card.suffix} decimal={card.decimal} active={visible}/><small>{card.metric}</small></div>
          <p>{card.copy}</p>
        </RevealCard>)}
      </div>
      <div className="studio-split">
        <section className="studio-panel"><div className="panel-title"><span className="panel-icon" aria-hidden="true">↗</span><h3>Live Attribution & Funnel Velocity</h3></div>
          <div className="funnel-list">{funnel.map(row => <div className={channel !== 'all' && channel !== row.id ? 'funnel-row muted' : 'funnel-row'} key={row.label}><div><span>{row.label}</span><b>{row.value}%</b></div><div className="funnel-track"><span style={{ width: visible && (channel === 'all' || channel === row.id) ? `${row.value}%` : '0%' }}/></div></div>)}</div>
        </section>
        <section className="studio-panel"><div className="panel-title"><span className="panel-icon" aria-hidden="true">✓</span><h3>Active Client Deliverables</h3></div>
          <div className="deliverable-list">{deliverables.map(([name, status, id], index) => <div className={channel !== 'all' && channel !== id ? 'deliverable-row muted' : 'deliverable-row'} style={{ '--reveal-delay': `${index * 90}ms` }} key={name}><span className="deliverable-check">✓</span><span>{name}</span><span className="status-pill"><i/>{status}</span></div>)}</div>
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

function ServiceList({ title, items, icon, index, className = '' }) {
  return <RevealCard className={`service-bento ${className}`} index={index}><div className="bento-title"><span className={`bento-icon ${icon}`} aria-hidden="true">{icon === 'alert' ? '!' : icon === 'growth' ? '↗' : '✓'}</span><h3>{title}</h3></div><ul>{items.map(item => <li key={item}><span className={`list-icon ${icon}`} aria-hidden="true">{icon === 'alert' ? '×' : icon === 'growth' ? '↗' : '✓'}</span>{item.replaceAll('E-commerce', 'Ecommerce')}</li>)}</ul></RevealCard>
}
function Tag({ label }) {
  const [selected, setSelected] = useState(false)
  return <button type="button" className={selected ? 'tag selected' : 'tag'} aria-pressed={selected} onClick={() => setSelected(value => !value)}>{label.replaceAll('E-commerce', 'Ecommerce')}</button>
}

export function BentoServices({ data }) {
  const [active, setActive] = useState('digital')
  const pillar = data[active]
  return <section className="section bento-services" id="services">
    <div className="section-head"><span className="eyebrow">CORE SERVICES</span><h2>Two disciplines. One growth system.</h2><p>Explore what each pillar addresses and delivers for your business.</p></div>
    <div className={`pillar-switch ${active}`} role="tablist" aria-label="Service pillar">
      <span className="switch-highlight" aria-hidden="true"/>
      {Object.entries(data).map(([id, item]) => <button key={id} role="tab" aria-selected={active === id} onClick={() => setActive(id)}><span className="switch-icon" aria-hidden="true">{id === 'digital' ? '↗' : '◎'}</span>{item.name}</button>)}
    </div>
    <div className="pillar-view" key={active} role="tabpanel">
      <div className="pillar-intro"><span className="eyebrow">{pillar.name.toUpperCase()}</span><h3>Built around outcomes, from the first interaction.</h3><p>{pillar.intro}</p></div>
      <div className="bento-grid">
        <ServiceList title="The Problem We Solve" items={pillar.problem} icon="alert" index={0}/>
        <ServiceList title="Scope & What We Deliver" items={pillar.scope} icon="check" index={1}/>
        <ServiceList title="Key Benefits & What Changes" items={[...pillar.benefits, ...pillar.changes]} icon="growth" index={2}/>
        <RevealCard className="service-bento bento-tags" index={3}>
          <div className="bento-title"><span className="bento-icon check" aria-hidden="true">✦</span><h3>Included Deliverables, Tech Stack & Industries</h3></div>
          <div className="tag-group"><h4>Included Deliverables</h4><div>{pillar.included.map(item => <Tag label={item} key={item}/>)}</div></div>
          <div className="tag-group"><h4>Tech Stack</h4><div>{pillar.stack.map(item => <Tag label={item} key={item}/>)}</div></div>
          <div className="tag-group"><h4>Industries Served</h4><div>{pillar.industries.map(item => <Tag label={item} key={item}/>)}</div></div>
        </RevealCard>
      </div>
    </div>
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
  return <section className="section pricing-builder" id="pricing">
    <div className="section-head"><span className="eyebrow">TRANSPARENT STARTING POINTS</span><h2>Choose a plan built for growth.</h2><p>Live PKR plan amounts from our pricing system. Build an estimate before your strategy call.</p></div>
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
    {detailedFaqs.map(([question, answer], index) => <article key={question}><button type="button" aria-expanded={open.includes(index)} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index])}>{question}<b aria-hidden="true">{open.includes(index) ? '−' : '+'}</b></button><div id={`faq-answer-${index}`} className={open.includes(index) ? 'faq-panel open' : 'faq-panel'}><p>{answer}</p></div></article>)}
  </div></section>
}
