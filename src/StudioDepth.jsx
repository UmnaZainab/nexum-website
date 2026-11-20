import React, { useEffect, useRef, useState } from 'react'
import digitalMarketingPhoto from '../assets/studio/digital-marketing.jpg'
import socialMediaPhoto from '../assets/studio/social-media-studio.jpg'
import ecommercePhoto from '../assets/studio/playbook-ecommerce.jpg'
import b2bPhoto from '../assets/studio/playbook-b2b.jpg'
import retailPhoto from '../assets/studio/playbook-retail.jpg'
import campaignReviewPhoto from '../assets/studio/campaign-review.jpg'

const channels = [
  { name: 'Search & Technical SEO', icon: '⌕', items: ['Technical site audit', 'Commercial keyword mapping', 'Search content roadmap', 'Qualified organic reporting'] },
  { name: 'Google Search & Shopping Ads', icon: '↗', items: ['Intent led search campaigns', 'Shopping feed structure', 'Conversion event setup', 'Budget and bid refinement'] },
  { name: 'Meta & LinkedIn Paid Social', icon: '◎', items: ['Audience strategy', 'Creative campaign testing', 'Lead and retargeting flows', 'Measured spend reviews'] },
  { name: 'Creative & Reels Studio', icon: '✦', items: ['Monthly content calendar', 'Short form video assets', 'Ad creative variations', 'Brand voice and copy'] },
  { name: 'Community & Inbox Management', icon: '✉', items: ['Business hours responses', 'Comment moderation', 'Message routing', 'Sensitive issue escalation'] },
  { name: 'Email & Lifecycle Automation', icon: '◌', items: ['Welcome sequences', 'Lead nurture journeys', 'Post visit follow ups', 'Lifecycle performance review'] },
]
const curves = [
  'M600 300 C450 300 440 130 220 130',
  'M600 300 C455 300 420 300 220 300',
  'M600 300 C450 300 440 470 220 470',
  'M600 300 C750 300 760 130 980 130',
  'M600 300 C745 300 780 300 980 300',
  'M600 300 C750 300 760 470 980 470',
]
const playbooks = [
  { index: '01', industry: 'ECOMMERCE', image: ecommercePhoto, alt: 'Ecommerce products beside an online checkout analytics dashboard', title: 'Ecommerce Revenue Scaling', metrics: [['4.2x ROAS', 'Return on ad spend'], ['+145% Checkout Conversions', 'Conversion lift']], actions: ['Technical tracking audit', 'Google Shopping feed restructuring', 'Meta dynamic retargeting'] },
  { index: '02', industry: 'B2B', image: b2bPhoto, alt: 'B2B team reviewing lead pipeline charts in a strategy meeting', title: 'B2B Qualified Lead Pipeline', metrics: [['+184% Organic Pipeline', 'Qualified demand'], ['41% Lower CPL', 'Lead efficiency']], actions: ['Commercial intent search content', 'LinkedIn decision maker targeting', 'Automated email follow ups'] },
  { index: '03', industry: 'RETAIL & LOCAL', image: retailPhoto, alt: 'Lifestyle products and brand photography setup in a retail store', title: 'Retail & Local Brand Growth', metrics: [['3.1x Engagement', 'Audience response'], ['98% Response SLA', 'Community care']], actions: ['Structured monthly social calendar', 'Short form video production', 'Business hours community management'] },
]
const stages = [
  ['01', 'Audit & Conversion Tracking', 'Review existing channels and conversion gaps, then configure events before campaign spend.'],
  ['02', 'Content & Campaign Build', 'Plan buyer focused creative, search, paid media, email, and social content with a shared calendar.'],
  ['03', 'Publish, Engage & Scale', 'Launch campaigns, publish consistently, answer your audience, and shift effort toward traction.'],
  ['04', 'Pipeline Reporting & Optimization', 'Review qualified leads and revenue signals, then decide what to improve next.'],
]
const weeks = [
  ['Week 1', 'Tracking & Audit', 'Check events, access, audience signals, and priorities.'],
  ['Week 2', 'Creative & Launch', 'Approve assets and activate coordinated campaigns.'],
  ['Week 3', 'A/B Testing & Bid Shifts', 'Test messages, audiences, landing pages, and spend.'],
  ['Week 4', 'Pipeline & Revenue Report', 'Review outcomes and set the next monthly roadmap.'],
]

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) { node?.classList.add('is-visible'); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.classList.add('is-visible'); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(node)
    const fallback = window.setTimeout(() => node.classList.add('is-visible'), 5000)
    return () => { observer.disconnect(); window.clearTimeout(fallback) }
  }, [])
  return <div ref={ref} className={`depth-reveal ${className}`} style={{ '--depth-delay': `${delay}ms` }}>{children}</div>
}

export function GrowthArchitecture() {
  const [active, setActive] = useState(null)
  return <section className="section architecture-section" id="architecture">
    <div className="section-head"><span className="eyebrow">CONNECTED BY DESIGN</span><h2>One connected growth engine. Every channel in sync.</h2><p>Each specialist channel contributes to one shared system for demand, conversion, and pipeline.</p></div>
    <div className="architecture-stage" onKeyDown={event => { if (event.key === 'Escape') setActive(null) }}>
      <svg className="architecture-lines" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        {curves.map((path, index) => <path key={path} d={path} className={active === index ? 'active' : ''}/>)}
      </svg>
      <div className="growth-core"><span className="core-symbol" aria-hidden="true">N</span><span>Nexum Growth Core</span><small>Strategy · Creative · Data</small></div>
      <div className="architecture-grid">{channels.map((channel, index) => <div className={`architecture-node node-${index} ${active === index ? 'active' : ''}`} key={channel.name}
        onMouseEnter={() => setActive(index)} onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setActive(current => current === index ? null : current) }}
        onFocus={() => setActive(index)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null) }}>
        <button type="button" className="channel-button" aria-expanded={active === index} aria-controls={`channel-popover-${index}`} onClick={() => setActive(index)}>
          <span className="channel-icon" aria-hidden="true">{channel.icon}</span><strong>{channel.name}</strong><span className="channel-more" aria-hidden="true">+</span>
        </button>
        <div className="channel-popover" id={`channel-popover-${index}`} aria-hidden={active !== index}><strong>{channel.name}</strong><ul>{channel.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div>
      </div>)}</div>
    </div>
  </section>
}

function Tag({ children }) { return <span className="suite-tag">{children}</span> }
function List({ title, items, icon, delay, className = '' }) {
  return <Reveal className={`suite-card ${className}`} delay={delay}><div className="suite-card-title"><span className="suite-icon" aria-hidden="true">{icon}</span><h4>{title}</h4></div><ul className="suite-list">{items.map(item => <li key={item}><span aria-hidden="true">{icon === '×' ? '×' : '✓'}</span>{item}</li>)}</ul></Reveal>
}
function Suite({ item, number }) {
  const isSocial = number === '02'
  return <div className={`service-suite ${isSocial ? 'suite-social' : ''}`}>
    <Reveal className="suite-intro"><div className="suite-intro-copy"><span className="eyebrow">SUITE {number}</span><h3>{item.name}</h3><p>{item.intro}</p></div><div className="suite-photo"><img src={isSocial ? socialMediaPhoto : digitalMarketingPhoto} alt={isSocial ? 'Social media team planning content and filming brand reels' : 'Marketing strategist reviewing search and conversion analytics'} loading="lazy" decoding="async"/><span className="suite-photo-badge">{isSocial ? 'Content, Reels & Community' : 'Search, Paid Ads & Attribution'}</span></div></Reveal>
    <div className="suite-grid">
      <List title="The Problem We Solve" items={item.problem} icon="×" delay={0}/>
      <List title="What We Deliver" items={item.scope} icon="✓" delay={80}/>
      <Reveal className="suite-card suite-outcomes" delay={160}><div className="suite-card-title"><span className="suite-icon" aria-hidden="true">↗</span><h4>Expected Outcomes & Stack</h4></div><ul className="suite-list">{item.benefits.map(text => <li key={text}><span aria-hidden="true">↗</span>{text}</li>)}</ul>
        <div className="suite-tag-group"><h5>Technology Stack</h5><div>{item.stack.map(text => <Tag key={text}>{text}</Tag>)}</div></div>
        <details className="suite-more"><summary>Explore full outcomes and inclusions</summary><h5>What Changes</h5><ul className="suite-list">{item.changes.map(text => <li key={text}><span aria-hidden="true">↗</span>{text}</li>)}</ul><div className="suite-tag-group"><h5>Included Deliverables</h5><div>{item.included.map(text => <Tag key={text}>{text}</Tag>)}</div></div><div className="suite-tag-group"><h5>Industries Served</h5><div>{item.industries.map(text => <Tag key={text}>{text}</Tag>)}</div></div></details>
      </Reveal>
    </div>
  </div>
}
export function FullServiceSuites({ data }) {
  return <section className="section full-services" id="services"><div className="section-head"><span className="eyebrow">COMPLETE SERVICE SUITES</span><h2>Digital and social, working as one.</h2><p>Two focused suites, one measurable growth plan.</p></div><Suite item={data.digital} number="01"/><Suite item={data.social} number="02"/></section>
}

export function CampaignPlaybooks() {
  return <section className="section playbooks-section" id="results"><div className="section-head"><span className="eyebrow">CAMPAIGN PLAYBOOKS & BENCHMARKS</span><h2>Focused plans for measurable outcomes.</h2><p>Three examples of how channel choices connect to commercial goals.</p></div><div className="playbook-grid">{playbooks.map((playbook, index) => <Reveal className="playbook-card" delay={index * 90} key={playbook.title}><div className="playbook-cover"><img src={playbook.image} alt={playbook.alt} loading="lazy" decoding="async"/><span className="playbook-industry">{playbook.industry}</span></div><div className="playbook-body"><span className="playbook-index">PLAYBOOK {playbook.index}</span><h3>{playbook.title}</h3><div className="playbook-metrics">{playbook.metrics.map(([value, label]) => <div key={value}><strong>{value}</strong><small>{label}</small></div>)}</div><ul>{playbook.actions.map(action => <li key={action}><span aria-hidden="true">✓</span>{action}</li>)}</ul></div></Reveal>)}</div><p className="benchmark-note">Illustrative benchmarks for planning. These figures are not verified client results.</p></section>
}

export function MonthlyProcess() {
  const photos = [
    { src: campaignReviewPhoto, alt: 'Team reviewing creative concepts and campaign analytics', caption: 'Strategy & Tracking Audit' },
    { src: socialMediaPhoto, alt: 'Content team planning and filming social media reels', caption: 'Creative & Reels Production' },
    { src: digitalMarketingPhoto, alt: 'Strategist reviewing campaign performance on a laptop', caption: 'Live Pipeline Optimization' },
  ]
  return <section className="process-wrap monthly-process" id="process"><div className="section"><div className="section-head"><span className="eyebrow">HOW IT WORKS</span><h2>Clear steps. Measurable progress.</h2><p>A practical operating rhythm from strategy through ongoing improvement.</p></div><div className="process-grid">{stages.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="process-photo-strip">{photos.map((photo, index) => <Reveal className="process-photo-card" delay={index * 90} key={photo.caption}><img src={photo.src} alt={photo.alt} loading="lazy" decoding="async"/><div className="process-photo-caption"><span aria-hidden="true">0{index + 1}</span><h3>{photo.caption}</h3></div></Reveal>)}</div><div className="monthly-rhythm"><h3>4 Week Monthly Execution Rhythm</h3><div>{weeks.map(([week, title, copy]) => <article key={week}><span>{week}</span><h4>{title}</h4><p>{copy}</p></article>)}</div></div></div></section>
}
