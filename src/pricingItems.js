// The public page and the pricing API use the same fallback amounts.
export const defaultPricingItems = [
  { id: 'starter-growth', cardName: 'Starter Growth', defaultAmount: 35000 },
  { id: 'scale-performance', cardName: 'Scale & Performance', defaultAmount: 75000 },
  { id: 'enterprise-custom', cardName: 'Enterprise Custom', defaultAmount: 150000 },
]

export const formatPrice = amount => `Rs. ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(amount)}`
