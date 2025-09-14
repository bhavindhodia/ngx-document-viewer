/* export function niceBytes<T extends string | number>(x: T): T {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let l = 0;
  let n: number = typeof x === 'string' ? parseInt(x, 10) || 0 : x;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  const result = `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
  console.log('result',result);

  return (
    typeof x === 'string'
      ? result
      : Number(parseFloat(n.toFixed(n < 10 && l > 0 ? 1 : 0)))
  ) as T;
}
 */

export function niceBytes(x: string): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let l = 0;
  let n: number = typeof x === 'string' ? parseInt(x, 10) || 0 : x;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  const result = `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
  return result;
}
