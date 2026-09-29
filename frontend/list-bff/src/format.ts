const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const money = (v: unknown) => usd.format(Number(v))
