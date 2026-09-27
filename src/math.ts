export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

const SMALL_PRIMES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];

/** Miller–Rabin with the first 13 prime bases: deterministic below 3.3 × 10^24. */
export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  for (const p of SMALL_PRIMES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  outer: for (const a of SMALL_PRIMES) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let r = 1; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) continue outer;
    }
    return false;
  }
  return true;
}

export function smallestFactor(n: bigint): bigint | null {
  if (n < 4n) return null;
  if (n % 2n === 0n) return 2n;
  for (let d = 3n; d * d <= n; d += 2n) if (n % d === 0n) return d;
  return null;
}

export function binomial(n: bigint, k: bigint): bigint {
  if (k < 0n || k > n) return 0n;
  let r = 1n;
  for (let i = 1n; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export function isSumOfThreeSquares(n: bigint): boolean {
  for (let a = 0n; a * a <= n; a++)
    for (let b = a; a * a + b * b <= n; b++) {
      const rest = n - a * a - b * b;
      const c = isqrt(rest);
      if (c * c === rest) return true;
    }
  return false;
}

export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new RangeError("negative");
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x--;
  while ((x + 1n) * (x + 1n) <= n) x++;
  return x;
}

export function mobius(n: number): number {
  let m = n;
  let result = 1;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      m /= p;
      if (m % p === 0) return 0;
      result = -result;
    }
  }
  if (m > 1) result = -result;
  return result;
}

type Poly = number[];

function mulPoly(a: Poly, b: Poly): Poly {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) if (a[i]) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  return out;
}

/** Exact division of a by a monic polynomial b (coefficients low → high). */
function divPoly(a: Poly, b: Poly): Poly {
  const rem = a.slice();
  const q = new Array(Math.max(a.length - b.length + 1, 1)).fill(0);
  for (let i = a.length - b.length; i >= 0; i--) {
    const c = rem[i + b.length - 1];
    q[i] = c;
    if (c) for (let j = 0; j < b.length; j++) rem[i + j] -= c * b[j];
  }
  return q;
}

/** Coefficients of the n-th cyclotomic polynomial, lowest degree first. */
export function cyclotomic(n: number): Poly {
  let num: Poly = [1];
  let den: Poly = [1];
  for (let d = 1; d <= n; d++) {
    if (n % d !== 0) continue;
    const mu = mobius(n / d);
    if (mu === 0) continue;
    const xd1: Poly = new Array(d + 1).fill(0);
    xd1[0] = -1;
    xd1[d] = 1;
    if (mu === 1) num = mulPoly(num, xd1);
    else den = mulPoly(den, xd1);
  }
  const q = divPoly(num, den);
  return q.map((c) => (c < 0 ? -1 : 1) * Math.round(Math.abs(c)));
}

export function parseInteger(raw: string): bigint | null {
  const s = raw.replace(/[\s,_]/g, "");
  if (!/^-?\d+$/.test(s) || s.length > 400) return null;
  return BigInt(s);
}
