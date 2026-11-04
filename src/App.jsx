import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from './router'
import {
  ArrowUpRight, BarChart3, ChartNoAxesCombined, CheckCircle2, Globe2,
  Layers3, Mail, Megaphone, Moon, PenTool, Search, Sun, Target,
  TrendingUp, Users, X,
} from './icons'

const navItems = [
  ['Home', '/'], ['About Us', '/about'], ['Our Services', '/services'],
  ['Our Process', '/process'], ['FAQs', '/faqs'], ['Contact Us', '/contact'],
]

const iconMap = { Search, Target, Users, Megaphone, PenTool, Mail, ChartNoAxesCombined, Globe2, TrendingUp, BarChart3 }

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }}>{children}</div>
}

function Header({ theme, setTheme }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink to="/" className="brand" aria-label="Nexum Global Solutions home">
          <strong>nexum</strong><span>GLOBAL SOLUTIONS</span>
        </NavLink>
        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <NavLink key={href} to={href} end={href === '/'}>{label}</NavLink>)}
        </nav>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return <footer><div className="footer-inner"><strong>nexum</strong><div><span>© 2026 Nexum Global Solutions</span><span>Powered by Nexum Global Solutions</span></div></div></footer>
}

function Button({ children = 'Book a Consultation', to = '/contact' }) {
  return <NavLink to={to} className="button">{children}<ArrowUpRight size={16} /></NavLink>
}

function SectionIntro({ eyebrow, title, copy, className = '' }) {
  return <div className={`section-intro ${className}`}><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="lede">{copy}</p>}</div>
}

function CTA() {
  return <Reveal><section className="section cta"><p className="eyebrow">LET’S BUILD WHAT’S NEXT</p><h2>Ready to Grow Your Business?</h2><p>A clear strategy starts with a good conversation.</p><Button /></section></Reveal>
}

function IconCard({ icon, title, copy, plain = false }) {
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon
  return <article className={plain ? 'icon-card plain' : 'icon-card'}>{Icon && <Icon className="card-icon" size={22} strokeWidth={2} />}<h3>{title}</h3><p>{copy}</p></article>
}

function Counter({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const duration = 900
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(value * eased)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: .4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])
  return <strong ref={ref}>{display.toFixed(decimals)}{suffix}</strong>
}

function Dashboard() {
  return <div className="dashboard">
    <div className="dashboard-head"><span><ChartNoAxesCombined size={22} />Growth overview</span><em>LIVE VIEW</em></div>
    <div className="metrics">
      <div><span>Qualified leads</span><Counter value={284} /><small>+24.8%</small></div>
      <div><span>Conversions</span><Counter value={8.6} suffix="%" decimals={1} /><small>+2.1%</small></div>
      <div><span>Return on spend</span><Counter value={4.2} suffix="×" decimals={1} /><small>+18.4%</small></div>
    </div>
    <div className="chart"><b>Pipeline momentum</b><svg viewBox="0 0 450 150" role="img" aria-label="Illustrative rising pipeline chart"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d71f1" stopOpacity=".32"/><stop offset="1" stopColor="#8d71f1" stopOpacity="0"/></linearGradient></defs><g className="grid-lines"><path d="M0 35H450M0 70H450M0 105H450M0 140H450"/></g><path className="area" d="M0 126 C28 124 35 109 60 116 S95 86 125 97 S157 61 188 76 S223 39 255 53 S288 27 321 37 S356 13 390 22 S422 10 450 4 L450 145L0 145Z"/><path className="trend" d="M0 126 C28 124 35 109 60 116 S95 86 125 97 S157 61 188 76 S223 39 255 53 S288 27 321 37 S356 13 390 22 S422 10 450 4"/><path className="baseline" d="M0 137 C65 135 110 126 160 114 S230 92 285 91 S370 94 450 70"/></svg></div>
    <div className="channels"><span>Search</span><span>Social</span><span>Content</span><span>Email</span></div>
    <p className="caption">Illustrative dashboard · not client performance data</p>
  </div>
}

function Home() {
  const benefits = [
    [Globe2, 'Better visibility', 'Show up where your customers are looking.'],
    [Target, 'Quality leads', 'Attract people who are ready for your offer.'],
    [Megaphone, 'Brand awareness', 'Become familiar, trusted, and remembered.'],
    [TrendingUp, 'Measurable ROI', 'Know what is working and where to invest next.'],
  ]
  return <>
    <section className="hero section-wide">
      <div className="hero-grid">
        <Reveal className="hero-copy"><p className="badge"><i />DIGITAL + SOCIAL. ONE GROWTH ENGINE.</p><h1>Marketing That Turns Attention Into Growth.</h1><p className="lede">We connect digital and social media marketing to help ambitious brands attract the right people, build trust, and convert demand into measurable growth.</p><Button /><p className="micro">Strategy-led. Creative-powered. Performance-driven.</p></Reveal>
        <Reveal delay={160}><Dashboard /></Reveal>
      </div>
      <div className="checks">{['One connected strategy', 'Full-funnel thinking', 'Transparent reporting'].map(x => <span key={x}><CheckCircle2 size={15}/>{x}</span>)}</div>
    </section>
    <Reveal><section className="section"><p className="eyebrow">ONE PARTNER. ONE CONNECTED STRATEGY.</p><h2>Digital Marketing &amp; Social Media Marketing</h2><p className="lede long">From the first search to the next sale, we connect SEO, paid ads, content, social, email, and analytics into one focused growth engine.</p><Button to="/services">Explore Our Service</Button></section></Reveal>
    <Reveal><section className="section benefits"><p className="eyebrow">THE NEXUM ADVANTAGE</p><h2>Built to move your business forward.</h2><div className="four-grid">{benefits.map(([icon,title,copy]) => <IconCard key={title} icon={icon} title={title} copy={copy} plain />)}</div></section></Reveal>
    <CTA />
  </>
}

function About() {
  const approach = [[Target,'Start with the outcome','We define success around qualified leads, conversions, and revenue—not just reach.'],[Users,'Find your next customer','Audience insight guides where we show up and what we say.'],[TrendingUp,'Connect every move','Creative, media, and data work together, so each channel makes the next one stronger.']]
  const results = [['Leads','Quality over quantity','The right conversations with the right prospects.'],['Pipeline','Opportunity over impressions','A clearer path from first touch to sales readiness.'],['Conversions','Action over attention','Measure the steps that turn demand into revenue.']]
  return <>
    <Reveal><section className="section page-hero"><SectionIntro eyebrow="ABOUT NEXUM" title="Clear thinking. Connected marketing. Lasting growth." copy="Nexum Global Solutions brings strategy, creativity, and performance together. We help ambitious businesses build a marketing presence that does more than get noticed." /></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="OUR VISION" title="Make every marketing investment meaningful." copy="We believe growth starts when every channel shares a purpose. Our vision is to help businesses move beyond disconnected activity and build a confident, measurable path from attention to opportunity." /></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="OUR APPROACH" title="Not just more attention. The right kind." copy="Digital marketing and social media marketing, working as one. Every channel connects to a single strategy: turning real interest into real business." /><div className="three-grid">{approach.map(([i,t,c])=><IconCard key={t} icon={i} title={t} copy={c}/>)}</div></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="RESULTS THAT MATTER" title="Less noise. More business." copy="Likes don’t build a pipeline. We connect marketing activity to the outcomes your business actually needs." /><div className="three-grid">{results.map(([label,t,c])=><article className="result-card" key={t}><span>{label}</span><h3>{t}</h3><p>{c}</p></article>)}</div><p className="accountability">Your goals set the benchmark. Reporting keeps us accountable.</p></section></Reveal>
    <CTA />
  </>
}

function Services() {
  const services = [['Search','SEO','Be found when intent is highest.'],['Target','Google Ads','Turn active demand into action.'],['Users','Social Media Management','Build a consistent, compelling presence.'],['Megaphone','Paid Social','Reach the right people. Inspire the next step.'],['PenTool','Content Creation','Make your brand worth paying attention to.'],['Mail','Email Marketing','Nurture interest into lasting relationships.']]
  const challenges = [['01','Traffic, but no conversions?','Align your audience, message, and landing experience.'],['02','Ad spend going nowhere?','Replace guesswork with tighter targeting and ongoing testing.'],['03','Content without consistency?','Build a clear voice and a content rhythm you can sustain.'],['04','Engagement falling flat?','Create relevant stories that invite a genuine response.']]
  const tech = [['G','Google Analytics'],['G','Google Ads'],['∞','Meta Ads'],['in','LinkedIn Ads'],['⌘','HubSpot'],['◇','Buffer']]
  return <>
    <Reveal><section className="section page-hero"><SectionIntro eyebrow="ONE CONNECTED SERVICE" title="Digital Marketing & Social Media Marketing" copy="One integrated service. SEO, paid media, content, social, email, and analytics aligned around your next stage of growth." /><div className="three-grid service-grid">{services.map(([i,t,c])=><IconCard key={t} icon={i} title={t} copy={c}/>)}</div><IconCard icon={ChartNoAxesCombined} title="Analytics & reporting" copy="The intelligence behind every channel. Clear attribution, useful insights, and smarter decisions." /></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="CHALLENGES WE SOLVE" title="Sound familiar? Let’s change that." /><div className="two-grid">{challenges.map(([n,t,c])=><article className="challenge" key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></article>)}</div></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="OUR TECHNOLOGY" title="Powerful platforms. Purposefully connected." /><div className="tech-grid">{tech.map(([logo,name])=><div key={name}><b>{logo}</b><span>{name}</span></div>)}</div></section></Reveal>
    <CTA />
  </>
}

function Process() {
  const steps = [['01','Strategy','Understand your business, audience, and growth opportunities.'],['02','Campaign Building','Shape the message, creative, channels, and conversion journey.'],['03','Execution','Launch connected campaigns with precision and consistency.'],['04','Optimization','Test, learn, and refine around what drives real results.']]
  return <>
    <Reveal><section className="section page-hero"><SectionIntro eyebrow="OUR PROCESS" title="Clarity at every step." copy="A focused process. An accountable team. Continuous improvement." /><div className="four-grid process-grid">{steps.map(([n,t,c])=><article className="process-card" key={n}><strong>{n}</strong><h3>{t}</h3><p>{c}</p></article>)}</div></section></Reveal>
    <Reveal><section className="section"><SectionIntro eyebrow="BUILT TO KEEP GETTING BETTER" title="Launch is the beginning. Learning drives the rest." copy="We review campaign signals, share what we learn, and prioritize the next tests. Your audience evolves. Your marketing should too." /></section></Reveal>
    <CTA />
  </>
}

const faqs = [
  ['Is digital and social media marketing one service?','Yes. We plan and manage them as one connected service, aligning search, social, content, email, and measurement around your business goals.'],
  ['How soon can we expect results?','Paid campaigns can generate early signals after launch. SEO and organic social typically need sustained work over several months. Timelines depend on your market, budget, and starting point.'],
  ['Which channels are right for our business?','We start with your customers and goals, then prioritize the channels most likely to create qualified demand. You won’t pay for activity without a clear purpose.'],
  ['How do you measure success?','We agree on meaningful KPIs: qualified leads, pipeline, conversions, acquisition costs, and ROI. Reporting explains what happened, why it matters, and what comes next.'],
  ['Can you work with our existing marketing team?','Absolutely. We can act as your integrated marketing partner or collaborate with your in-house team, with clear ownership and regular communication.'],
]

function FAQItem({ question, answer }) {
  const [open,setOpen]=useState(false)
  return <article className={`faq-item ${open?'open':''}`}><button onClick={()=>setOpen(!open)} aria-expanded={open}><span>{question}</span>{open?<X size={20}/>:<span className="plus">+</span>}</button><div className="faq-answer"><p>{answer}</p></div></article>
}

function FAQs() {
  return <><Reveal><section className="section page-hero faq-section"><SectionIntro eyebrow="FAQs" title="Good questions. Straight answers." /><div className="faq-list">{faqs.map(([q,a])=><FAQItem key={q} question={q} answer={a}/>)}</div></section></Reveal><CTA /></>
}

function Contact() {
  const [status,setStatus]=useState('idle')
  const submit=e=>{e.preventDefault();setStatus('pending');setTimeout(()=>setStatus('success'),650)}
  return <>
    <Reveal><section className="section page-hero contact-intro"><SectionIntro eyebrow="CONTACT US" title="Let’s talk about your next stage of growth." copy="Tell us where you are today and where you want to go. We’ll explore how a connected digital and social marketing strategy can help." /></section></Reveal>
    <section className="contact-zone"><Reveal><div className="contact-wrap"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Ready to Grow Your Business?</h2><p className="lede">Let’s find the biggest opportunity in your marketing—and build a clear plan to capture it.</p><form onSubmit={submit}>
      <label>Name<input name="name" placeholder="Your name" required autoComplete="name" /></label>
      <label>Work email<input name="email" type="email" placeholder="you@company.com" required autoComplete="email" /></label>
      <label>Website<input name="website" type="url" placeholder="https://yourcompany.com" autoComplete="url" /></label>
      <label>What would you like to achieve?<textarea name="goals" placeholder="Tell us about your business and goals" required /></label>
      <button className="button form-button" disabled={status==='pending'}>{status==='pending'?'Sending…':status==='success'?'Request received':'Book a Consultation'}</button>
      {status==='success'&&<p className="form-success" role="status">Thanks — we’ll be in touch soon.</p>}
    </form><p className="micro centered">A focused conversation about your goals. No one-size-fits-all pitch.</p></div></Reveal></section>
  </>
}

export default function App() {
  const [theme,setTheme]=useState(()=>localStorage.getItem('nexum-theme')||'light')
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('nexum-theme',theme);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0a1020':'#f7f9fc')},[theme])
  return <><ScrollToTop/><Header theme={theme} setTheme={setTheme}/><main><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/services" element={<Services/>}/><Route path="/process" element={<Process/>}/><Route path="/faqs" element={<FAQs/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<Home/>}/></Routes></main><Footer/></>
}
