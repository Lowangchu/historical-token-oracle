export function interpolate(ts, ts1, price1, ts2, price2) {
  const ratio = (ts - ts1) / (ts2 - ts1);
  return price1 + (price2 - price1) * ratio;
}
