export default function CurrencySplitter(x: number): string {
  if (!x || x === 0) return '0';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
