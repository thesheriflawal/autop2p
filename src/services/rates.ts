import axios from 'axios';

// Fetch Bybit P2P best quote for USDT/NGN.
// NOTE: Bybit blocks browser-origin requests with CORS. We use a permissive proxy in dev.
// For production, route this request via your backend.
const BYBIT_P2P_URL = 'https://api2.bybit.com/fiat/otc/item/list';

export async function fetchBybitP2PNgnRate(options?: {
  side?: 0 | 1; // 0 = buy NGN (sell USDT), 1 = buy USDT (sell NGN) - Bybit semantics may vary
  amount?: number; // NGN amount to quote around
  useProxy?: boolean;
}): Promise<number | null> {
  const { side = 1, amount = 100000, useProxy = true } = options || {};

  const params = new URLSearchParams({
    token: 'USDT',
    currency: 'NGN',
    payment: 'all',
    side: String(side),
    page: '1',
    amount: String(amount),
    authMaker: 'false',
    canTrade: 'true',
  });

  // Try direct first, then proxy fallback
  const urls = [
    `${BYBIT_P2P_URL}?${params.toString()}`,
    ...(useProxy
      ? [
          `https://cors.isomorphic-git.org/${BYBIT_P2P_URL}?${params.toString()}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `${BYBIT_P2P_URL}?${params.toString()}`,
          )}`,
        ]
      : []),
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 8000 });
      // Bybit response shape: { result: { items: [{ price: '1485.00', ... }, ...] } }
      const items = (res.data?.result?.items || res.data?.result || res.data?.items) as any[] | undefined;
      if (Array.isArray(items) && items.length) {
        // take median of top 5 to smooth spikes
        const top = items.slice(0, Math.min(5, items.length));
        const prices = top
          .map((i) => Number(i?.price ?? i?.advertisePrice ?? i?.priceKyc))
          .filter((n) => Number.isFinite(n) && n > 0)
          .sort((a, b) => a - b);
        if (!prices.length) continue;
        const mid = Math.floor(prices.length / 2);
        const median = prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
        return Math.round(median * 100) / 100; // 2dp
      }
    } catch (_err) {
      // try next url
    }
  }
  return null;
}

export function applyOffset(base: number, mode: 'minus' | 'plus' | 'equal', value: number): number {
  if (!Number.isFinite(base)) return base;
  if (mode === 'equal') return base;
  const v = Number.isFinite(value) ? value : 0;
  const out = mode === 'minus' ? base - v : base + v;
  return Math.max(1, Math.round(out * 100) / 100);
}