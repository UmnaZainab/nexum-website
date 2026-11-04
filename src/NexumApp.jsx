import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from './siteRouter'
import {
  ArrowUpRight, ChartNoAxesCombined, CheckCircle2, Globe2,
  Layers3, Megaphone, PenTool, Search, Target, Users, X,
} from './icons'

const CALENDLY_URL = 'https://calendly.com/umnazainab07/30min'
const BookingContext = createContext(() => {})

const navItems = [
  ['Home', '/'], ['Services', '/services'], ['Products', '/#products'],
  ['Pricing', '/pricing'], ['Contact', '/#contact'],
]

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    }, 30)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])
  return null
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) {
      node?.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -28px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }}>{children}</Tag>
}

function BookingModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = event => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  if (!open) return null
  return <div className="booking-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="booking-head">
        <div><span>30 MINUTE STRATEGY CALL</span><h2 id="booking-title">Choose a time that works.</h2></div>
        <button onClick={onClose} aria-label="Close appointment scheduler"><X size={22} /></button>
      </div>
      <iframe title="Schedule a 30 minute call with Nexum" src={`${CALENDLY_URL}?embed_type=Inline&hide_gdpr_banner=1&background_color=0b1020&text_color=eff3ff&primary_color=8b7cf6`} />
    </section>
  </div>
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    const onResize = () => window.innerWidth > 820 && setOpen(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return <header className="site-header"><div className="header-inner">
    <NavLink to="/" className="brand" aria-label="Nexum Digital Studio home"><strong>nexum<span>.</span></strong><small>DIGITAL STUDIO</small></NavLink>
    <button className={`menu-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}><i /><i /></button>
    <nav className={`nav ${open ? 'open' : ''}`} aria-label="Primary navigation">
      {navItems.map(([label, href]) => <NavLink key={href} to={href} end={href === '/'}>{label}</NavLink>)}
      <BookButton className="nav-cta">Book a call</BookButton>
    </nav>
  </div></header>
}

function Footer() {
  return <footer>
    <div className="footer-main">
      <div className="footer-brand"><strong>nexum<span>.</span></strong><p>Digital systems and growth marketing for ambitious businesses.</p></div>
      <div><h3>Explore</h3>{navItems.slice(0, 4).map(([label, href]) => <NavLink key={href} to={href}>{label}</NavLink>)}</div>
      <div><h3>Start a conversation</h3><a href="mailto:hello@nexum.global">hello@nexum.global</a><BookButton className="text-link">Book strategy call <ArrowUpRight size={15} /></BookButton></div>
    </div>
    <div className="footer-bottom"><span>© 2026 Nexum Digital Studio</span><span>Strategy · Creative · Technology</span></div>
  </footer>
}

function BookButton({ children = 'Book a strategy call', className = 'button', secondary = false }) {
  const openBooking = useContext(BookingContext)
  return <button type="button" className={`${className}${secondary ? ' secondary' : ''}`} onClick={openBooking}>{children}{className === 'button' && <ArrowUpRight size={17} />}</button>
}

function SectionIntro({ eyebrow, title, copy, center = false }) {
  return <div className={`section-intro ${center ? 'center' : ''}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p className="lede">{copy}</p>}</div>
}

function HeroDashboard() {
  return <div className="hero-visual" aria-label="Illustrative connected growth dashboard">
    <div className="visual-top"><span><ChartNoAxesCombined size={19} /> Growth command center</span><em><i /> LIVE SIGNALS</em></div>
    <div className="visual-metric"><span>Marketing momentum</span><strong>+38.4%</strong><small>illustrative performance view</small></div>
    <svg viewBox="0 0 520 190" role="img" aria-label="Rising performance trend illustration"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b8cff" stopOpacity=".4"/><stop offset="1" stopColor="#9b8cff" stopOpacity="0"/></linearGradient></defs><path className="chart-grid" d="M0 35H520M0 80H520M0 125H520M0 170H520"/><path className="chart-area" d="M0 153C48 142 58 126 101 133S165 95 208 108s75-55 119-42 63-25 104-24 62-25 89-31V190H0Z"/><path className="chart-line" d="M0 153C48 142 58 126 101 133S165 95 208 108s75-55 119-42 63-25 104-24 62-25 89-31"/></svg>
    <div className="visual-tags"><span>SEO</span><span>Paid media</span><span>Social</span><span>Automation</span></div>
    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
  </div>
}

const products = [
  { badge:'OPERATIONS PLATFORM', title:'Nexum EMS', sub:'Enterprise Management Platform', copy:'One operating layer for people, assets, approvals, and performance—built to replace fragmented administrative workflows.', features:['Automated payroll workflows','Dual-governance attendance','Asset custody & lifecycle','Real-time analytics'], action:'Request pricing' },
  { badge:'FINANCE AUTOMATION', title:'Digital Invoicing', sub:'Tax Voucher Suite', copy:'A controlled billing and tax workflow that simplifies invoice creation, voucher tracking, reconciliation, and finance visibility.', features:['Structured invoice workflows','Tax voucher management','Approval trails','Financial reporting'], action:'Talk to sales' },
  { badge:'INTELLIGENT SYSTEMS', title:'AI Workflow Engines', sub:'Automation for complex work', copy:'Purpose-built automation that connects repetitive operational tasks, business data, and human approvals into faster workflows.', features:['Process orchestration','Intelligent routing','Human-in-the-loop controls','Operational analytics'], action:'Explore a custom build' },
]

function ProductCard({ product, delay }) {
  return <Reveal as="article" className="product-card" delay={delay}>
    <span className="card-badge">{product.badge}</span><h3>{product.title}</h3><h4>{product.sub}</h4><p>{product.copy}</p>
    <ul>{product.features.map(item => <li key={item}><CheckCircle2 size={16}/>{item}</li>)}</ul>
    <div className="price-block"><div><small>ENTERPRISE TIER</small><strong>Custom quote</strong></div><BookButton className="button">{product.action}</BookButton></div>
  </Reveal>
}

function CTA({ eyebrow = 'LET’S BUILD YOUR NEXT GROWTH SYSTEM', title = 'Ready to turn momentum into measurable growth?', copy = 'Bring us the goal. We’ll map the clearest path across strategy, creative, media, and technology.' }) {
  return <Reveal as="section" className="cta-band"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div><BookButton /></Reveal>
}

function Home() {
  return <>
    <section className="hero section-wide">
      <div className="hero-copy"><Reveal><p className="signal"><i /> DIGITAL GROWTH, BUILT AS A SYSTEM</p><h1>We turn bold brands into <span>growth engines.</span></h1><p className="lede">Nexum connects performance marketing, standout creative, and intelligent digital products to attract demand, convert attention, and scale revenue.</p><div className="hero-actions"><BookButton /><NavLink to="/services" className="button secondary">Explore services <ArrowUpRight size={17}/></NavLink></div><div className="hero-proof"><span><CheckCircle2 size={15}/> Full-funnel strategy</span><span><CheckCircle2 size={15}/> Transparent reporting</span></div></Reveal></div>
      <Reveal delay={140}><HeroDashboard /></Reveal>
    </section>
    <section className="section service-preview">
      <Reveal><SectionIntro eyebrow="ONE PARTNER. EVERY GROWTH LEVER." title="Strategy, execution, and technology—connected." copy="From visibility to conversion and operations, every engagement is designed around the business outcome you need next." /></Reveal>
      <div className="three-grid">
        {[['01', Search, 'Search & performance', 'Capture high-intent demand through technical SEO, Google Ads, and conversion-led landing experiences.'],['02', Megaphone, 'Social & creative', 'Build an unmistakable presence with content systems, paid social, short-form video, and community.'],['03', Layers3, 'Digital products', 'Transform the way work gets done through enterprise platforms and tailored automation.']].map(([n, Icon, title, copy], i) => <Reveal as="article" className="service-card" delay={i * 90} key={title}><span>{n}</span><Icon size={24}/><h3>{title}</h3><p>{copy}</p></Reveal>)}
      </div>
    </section>
    <section className="section products-section" id="products">
      <Reveal><SectionIntro eyebrow="OUR PRODUCTS" title="Proprietary platforms for the work behind growth." copy="Scalable systems that bring control, visibility, and automation to the operational core of your business." /></Reveal>
      <div className="product-grid">{products.map((product, i) => <ProductCard key={product.title} product={product} delay={i * 90} />)}</div>
    </section>
    <section className="section impact-strip">
      {[['01','Find demand','Be present when buyers are actively searching.'],['02','Create preference','Build a brand people recognize and trust.'],['03','Convert intent','Remove friction from the path to action.'],['04','Scale intelligently','Use data and automation to compound growth.']].map(([n,t,c], i)=><Reveal as="article" delay={i*70} key={t}><span>{n}</span><h3>{t}</h3><p>{c}</p></Reveal>)}
    </section>
    <section className="section contact-section" id="contact">
      <Reveal><div><p className="eyebrow">CONTACT NEXUM</p><h2>What could your next stage of growth look like?</h2><p>Tell us where you are today. In a focused 30-minute call, we’ll identify the clearest opportunity and outline the first steps.</p></div></Reveal>
      <Reveal delay={100}><div className="contact-card"><span>NO GENERIC SALES PITCH</span><h3>A practical strategy conversation.</h3><ul><li><CheckCircle2 size={17}/>Clarify your highest-leverage goal</li><li><CheckCircle2 size={17}/>Explore the right channels or systems</li><li><CheckCircle2 size={17}/>Leave with a clear next step</li></ul><BookButton /></div></Reveal>
    </section>
  </>
}

const digitalServices = [
  [Search, 'Search Engine Optimization', 'Technical audits, search architecture, content opportunities, on-page optimization, and a roadmap built around qualified organic demand.'],
  [Target, 'Pay Per Click Advertising', 'Intent-led campaigns across Google Search, Display, and Performance Max—with disciplined budgets, testing, and attribution.'],
  [ChartNoAxesCombined, 'Conversion & Analytics', 'CRO research, landing-page recommendations, event tracking, dashboards, and measurement that connects activity to revenue.'],
]
const socialServices = [
  [Users, 'Organic Social Management', 'Channel strategy and consistent publishing across Instagram, LinkedIn, Facebook, and TikTok.'],
  [Megaphone, 'Paid Social Campaigns', 'Meta Ads, LinkedIn Sponsored Content, retargeting, and lead-generation funnels designed to move prospects forward.'],
  [PenTool, 'Content & Community', 'Graphic creatives, short video reels, copy strategy, content calendars, and thoughtful community engagement.'],
]

function CapabilitySection({ eyebrow, title, copy, items, alt = false }) {
  return <section className={`section capabilities ${alt ? 'alt' : ''}`}><Reveal><SectionIntro eyebrow={eyebrow} title={title} copy={copy}/></Reveal><div className="three-grid">{items.map(([Icon,t,c],i)=><Reveal as="article" className="capability-card" delay={i*90} key={t}><div className="icon-shell"><Icon size={22}/></div><h3>{t}</h3><p>{c}</p><span className="detail-line" /></Reveal>)}</div></section>
}

function Services() {
  const process = [['01','Discovery','We uncover the commercial goal, audience, constraints, and current performance.'],['02','Strategy','We define the channel mix, message, measurement plan, and growth roadmap.'],['03','Creative production','Concepts become campaign assets, content, landing experiences, and conversion flows.'],['04','Launch','We deploy with clean tracking, quality checks, and deliberate learning agendas.'],['05','Optimization','We read the signals, test improvements, and compound what drives meaningful results.']]
  return <>
    <section className="page-hero section-wide"><Reveal><p className="signal"><i /> INTEGRATED GROWTH SERVICES</p><h1>Transform your brand. <span>Scale your revenue.</span></h1><p className="lede">We combine digital strategy, performance media, social creativity, and measurement into one accountable growth partnership.</p><div className="hero-actions"><BookButton/><a href="#capabilities" className="button secondary">See our capabilities <ArrowUpRight size={17}/></a></div></Reveal><Reveal delay={120}><div className="hero-side-note"><Globe2 size={28}/><span>CONNECTED BY DESIGN</span><p>Search captures intent. Social builds preference. Creative earns attention. Data tells us what to do next.</p></div></Reveal></section>
    <div id="capabilities"><CapabilitySection eyebrow="DIGITAL MARKETING" title="Capture demand. Convert it with precision." copy="A performance foundation engineered to increase visibility, improve acquisition efficiency, and turn more visits into valuable actions." items={digitalServices}/></div>
    <CapabilitySection eyebrow="SOCIAL MEDIA MARKETING" title="Make your brand impossible to ignore." copy="A connected organic, paid, and creative system that turns consistent presence into audience trust and pipeline." items={socialServices} alt/>
    <section className="section process-section"><Reveal><SectionIntro eyebrow="THE NEXUM PROCESS" title="A clear path from ambition to momentum." copy="Five focused stages keep teams aligned, decisions fast, and every iteration connected to the outcome." /></Reveal><div className="process-roadmap">{process.map(([n,t,c],i)=><Reveal as="article" delay={i*70} key={n}><div><span>{n}</span><i /></div><h3>{t}</h3><p>{c}</p></Reveal>)}</div></section>
    <CTA eyebrow="YOUR NEXT MOVE STARTS HERE" title="Let’s find the fastest route to meaningful growth." copy="Book an exploratory strategy call. We’ll discuss your goals, current challenges, and where Nexum can create the greatest impact." />
  </>
}

const tiers = [
  { name:'Starter Growth', eyebrow:'FOUNDATION', copy:'For emerging brands building a credible, consistent organic presence.', price:'Custom', suffix:'/ month', features:['Organic social strategy','Two priority social channels','Monthly content calendar','Graphic content production','Community engagement','Monthly performance report'] },
  { name:'Scale & Performance', eyebrow:'MOST POPULAR', copy:'For brands ready to combine full-funnel marketing, paid acquisition, and rapid creative learning.', price:'Custom', suffix:'/ month', popular:true, features:['Full digital growth strategy','SEO & conversion roadmap','Paid media management','Organic social management','Weekly creative iterations','Live reporting dashboard'] },
  { name:'Enterprise Custom', eyebrow:'OMNICHANNEL', copy:'For high-growth teams managing complex campaigns, markets, and operating requirements.', price:'Tailored', suffix:' engagement', features:['Omnichannel ad management','Multi-market strategy','Dedicated account lead','Custom analytics & attribution','Priority creative production','Executive performance reviews'] },
]
const matrix = [
  ['Growth strategy','Core','Full funnel','Custom'],['Organic social channels','2','Up to 4','Custom'],['Paid ads management','—','Included','Omnichannel'],['Creative iteration','Monthly','Weekly','Priority'],['SEO & CRO roadmap','—','Included','Advanced'],['Reporting','Monthly','Live dashboard','Executive'],['Dedicated account lead','—','Included','Senior lead'],
]
const pricingFaqs = [
  ['What contract lengths do you offer?','Monthly retainers are scoped around ongoing delivery. Quarterly plans are ideal when you want enough runway for testing and optimization. Final terms are agreed in your proposal.'],
  ['Can we customize the deliverables?','Yes. The tiers are starting structures, not rigid bundles. We tailor channels, creative volume, reporting, and specialist support to your commercial priorities.'],
  ['How quickly can onboarding begin?','Most engagements can enter onboarding within one to two weeks after scope approval. We use that time for access, tracking, discovery, and the first working roadmap.'],
  ['What will we see in the reporting dashboard?','Dashboards are configured around agreed KPIs and can combine channel performance, conversion activity, acquisition costs, and pipeline signals where the required data is available.'],
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return <article className={`faq-item ${open ? 'open' : ''}`}><button onClick={() => setOpen(!open)} aria-expanded={open}><span>{question}</span><b>{open ? '−' : '+'}</b></button><div className="faq-answer"><p>{answer}</p></div></article>
}

function Pricing() {
  const [quarterly, setQuarterly] = useState(true)
  return <>
    <section className="pricing-hero section-wide"><Reveal><p className="signal"><i /> TRANSPARENT BY DESIGN</p><h1>Choose the structure. <span>We’ll tailor the scope.</span></h1><p className="lede">Clear starting points for ongoing growth services, with every final retainer shaped around your goals, channels, and pace.</p></Reveal><Reveal delay={100}><div className="billing-toggle" role="group" aria-label="Billing frequency"><button className={!quarterly ? 'active' : ''} onClick={()=>setQuarterly(false)}>Monthly retainer</button><button className={quarterly ? 'active' : ''} onClick={()=>setQuarterly(true)}>Quarterly plan <span>Preferred value</span></button></div></Reveal></section>
    <section className="section pricing-section"><div className="pricing-grid">{tiers.map((tier,i)=><Reveal as="article" className={`pricing-card ${tier.popular?'popular':''}`} delay={i*90} key={tier.name}>{tier.popular&&<div className="popular-glow"/>}<span className="tier-label">{tier.eyebrow}</span><h2>{tier.name}</h2><p>{tier.copy}</p><div className="tier-price"><strong>{tier.price}</strong><span>{quarterly && tier.price === 'Custom' ? '/ quarterly scope' : tier.suffix}</span></div><BookButton className="button">Inquire about this plan</BookButton><ul>{tier.features.map(f=><li key={f}><CheckCircle2 size={16}/>{f}</li>)}</ul></Reveal>)}</div></section>
    <section className="section comparison"><Reveal><SectionIntro eyebrow="COMPARE TIERS" title="The right level of support, at a glance." copy="Every engagement includes strategic direction, clear ownership, and agreed success measures."/></Reveal><Reveal><div className="matrix" role="table" aria-label="Pricing feature comparison"><div className="matrix-head" role="row"><strong>Deliverable</strong>{tiers.map(t=><strong key={t.name}>{t.name}</strong>)}</div>{matrix.map(([feature,...values])=><div className="matrix-row" role="row" key={feature}><b>{feature}</b>{values.map((v,i)=><span key={i} data-tier={tiers[i].name}>{v==='Included'?<><CheckCircle2 size={16}/> {v}</>:v}</span>)}</div>)}</div></Reveal></section>
    <section className="section faq-section"><Reveal><SectionIntro eyebrow="PRICING FAQ" title="Straight answers before we start." /></Reveal><div className="faq-list">{pricingFaqs.map(([q,a],i)=><Reveal delay={i*60} key={q}><FAQItem question={q} answer={a}/></Reveal>)}</div></section>
    <CTA eyebrow="NEED A CUSTOM SOFTWARE SCOPE?" title="Let’s price the outcome, not a generic package." copy="For enterprise platforms, invoicing systems, and AI workflow automation, we’ll map the requirements and build a tailored proposal." />
  </>
}

export default function NexumApp() {
  const [bookingOpen, setBookingOpen] = useState(false)
  return <BookingContext.Provider value={() => setBookingOpen(true)}><ScrollManager/><Header/><main><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<Services/>}/><Route path="/pricing" element={<Pricing/>}/><Route path="*" element={<Home/>}/></Routes></main><Footer/><BookingModal open={bookingOpen} onClose={()=>setBookingOpen(false)}/></BookingContext.Provider>
}
