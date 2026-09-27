import {
  binomial,
  cyclotomic,
  gcd,
  isPrime,
  isSumOfThreeSquares,
  modPow,
  smallestFactor,
} from "./math";

export type Tier = "Warm-up" | "Tricky" | "Boss";

export interface Field {
  key: string;
  label: string;
  placeholder: string;
}

export interface Verdict {
  broken: boolean;
  message: string;
}

export interface Conjecture {
  id: string;
  tier: Tier;
  title: string;
  claim: string;
  evidence: string[];
  fields: Field[];
  check: (v: Record<string, bigint>) => Verdict;
  hints: [string, string, string];
  reveal: string;
  counterexample: Record<string, string>;
}

const survive = (message: string): Verdict => ({ broken: false, message });
const broken = (message: string): Verdict => ({ broken: true, message });
const fmt = (n: bigint): string => {
  const s = n.toString();
  return s.length > 60 ? `${s.slice(0, 24)}…${s.slice(-24)} (${s.length} digits)` : s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const repunit = (n: bigint): bigint => (10n ** n - 1n) / 9n;
const threes = (k: bigint): bigint => (10n ** (k + 1n) - 7n) / 3n;
const mersenne = (p: bigint): bigint => 2n ** p - 1n;
const fermat = (n: bigint): bigint => 2n ** (2n ** n) + 1n;
const euler = (n: bigint): bigint => n * n + n + 41n;
const regions = (n: bigint): bigint => binomial(n, 4n) + binomial(n, 2n) + 1n;
const boss = (n: bigint): bigint => gcd(n ** 17n + 9n, (n + 1n) ** 17n + 9n);

function factorVerdict(value: bigint, d: bigint, label: string): Verdict {
  if (d <= 1n || d >= value) return survive(`${fmt(d)} isn't a proper factor. It must be strictly between 1 and ${label}.`);
  if (value % d !== 0n) return survive(`${fmt(d)} does not divide ${label} = ${fmt(value)}. The claim survives.`);
  return broken(`${label} = ${fmt(value)} = ${fmt(d)} × ${fmt(value / d)}. Not prime. Conjecture broken.`);
}

function range(n: number): bigint[] {
  return Array.from({ length: n }, (_, i) => BigInt(i));
}

export const conjectures: Conjecture[] = [
  {
    id: "repunit",
    tier: "Warm-up",
    title: "Prime repunits",
    claim: "If <em>n</em> is prime, the repunit 11…1 (<em>n</em> ones) is prime.",
    evidence: ["n = 2 → 11 is prime ✓", "n = 19 → 1111111111111111111 is prime ✓", "n = 23 → 11111111111111111111111 is prime ✓"],
    fields: [
      { key: "n", label: "prime n", placeholder: "prime n" },
      { key: "d", label: "a factor of the repunit", placeholder: "a proper divisor" },
    ],
    check: ({ n, d }) => {
      if (n < 2n || n > 300n) return survive("Pick a prime n between 2 and 300.");
      if (!isPrime(n)) return survive(`${n} isn't prime, so the claim says nothing about it.`);
      return factorVerdict(repunit(n), d, `R(${n})`);
    },
    hints: ["The cherry-picked evidence skipped the smallest odd prime.", "Try n = 3. Add up the digits of 111.", "111 = 3 × 37."],
    reveal:
      "The claim only ever works one way: if the repunit is prime then n is prime, never the other way round. Digit-sum divisibility kills n = 3 right away. Prime repunits are rare. The only known ones have n = 2, 19, 23, 317 and 1031, plus a few enormous probable primes.",
    counterexample: { n: "3", d: "3" },
  },
  {
    id: "three-squares",
    tier: "Warm-up",
    title: "Three squares suffice",
    claim: "Every positive integer is a sum of at most three perfect squares (0 allowed).",
    evidence: ["1 = 1²", "5 = 1² + 2²", "6 = 1² + 1² + 2²", "11 = 1² + 1² + 3²", "…and 1–6 all work."],
    fields: [{ key: "n", label: "n", placeholder: "e.g. 12" }],
    check: ({ n }) => {
      if (n < 1n || n > 100000n) return survive("Pick n between 1 and 100,000.");
      return isSumOfThreeSquares(n)
        ? survive(`${fmt(n)} is a sum of three squares. The claim survives.`)
        : broken(`${fmt(n)} cannot be written as a² + b² + c². Conjecture broken.`);
    },
    hints: ["The smallest counterexample is a single digit.", "Squares mod 8 are only 0, 1 or 4. Which residue can't three of them reach?", "7 = 4 + 1 + 1 + 1 needs four squares."],
    reveal:
      "Legendre proved that n is a sum of three squares exactly when n isn't of the form 4ᵃ(8b + 7). So the failures (7, 15, 23, 28, …) make up about a sixth of all numbers. Lagrange's four-square theorem says four squares always suffice.",
    counterexample: { n: "7" },
  },
  {
    id: "euler-41",
    tier: "Warm-up",
    title: "Euler's prime generator",
    claim: "<em>n</em>² + <em>n</em> + 41 is prime for every integer <em>n</em> ≥ 0.",
    evidence: range(40)
      .filter((n) => n % 13n === 0n || n === 39n)
      .map((n) => `n = ${n} → ${euler(n)} is prime ✓`)
      .concat(["All 40 values for n = 0…39 are prime."]),
    fields: [{ key: "n", label: "n", placeholder: "e.g. 10" }],
    check: ({ n }) => {
      if (n < 0n || n > 1000000n) return survive("Pick n between 0 and 1,000,000.");
      const v = euler(n);
      if (isPrime(v)) return survive(`${n}² + ${n} + 41 = ${fmt(v)} is prime. The claim survives.`);
      const f = smallestFactor(v) ?? v;
      return broken(`${n}² + ${n} + 41 = ${fmt(v)} = ${fmt(f)} × ${fmt(v / f)}. Conjecture broken.`);
    },
    hints: ["Forty straight wins. What's special about the constant term?", "What happens when n is a multiple of 41, or one less than one?", "n = 40 gives 40² + 40 + 41 = 40·41 + 41 = 41²."],
    reveal:
      "Euler noticed this polynomial in 1772. It works so well because 41 is one of Euler's 'lucky numbers', tied to the fact that ℚ(√−163) has class number 1 (163 = 4·41 − 1). But no non-constant polynomial produces only primes: plug in n = 41 and 41 divides the result.",
    counterexample: { n: "40" },
  },
  {
    id: "circle",
    tier: "Warm-up",
    title: "Circle regions double",
    claim:
      "Put <em>n</em> points on a circle in general position and join every pair. The chords cut the disk into 2<sup><em>n</em>−1</sup> regions.",
    evidence: range(6)
      .slice(1)
      .map((n) => `n = ${n} → ${regions(n)} regions = 2^${n - 1n} ✓`),
    fields: [{ key: "n", label: "number of points n", placeholder: "e.g. 4" }],
    check: ({ n }) => {
      if (n < 1n || n > 1000n) return survive("Pick n between 1 and 1,000.");
      const r = regions(n);
      const p = 2n ** (n - 1n);
      return r === p
        ? survive(`n = ${n}: ${fmt(r)} regions, and 2^${n - 1n} = ${fmt(p)}. The claim survives.`)
        : broken(`n = ${n}: C(n,4) + C(n,2) + 1 = ${fmt(r)} regions, but 2^${n - 1n} = ${fmt(p)}. Conjecture broken.`);
    },
    hints: ["1, 2, 4, 8, 16… your brain fills in the next term. Don't trust it.", "Count for 6 points. Each interior crossing adds one region.", "Six points give 31 regions, not 32."],
    reveal:
      "This is Moser's circle problem. The true count is C(n,4) + C(n,2) + 1, a degree-4 polynomial, so it can't keep doubling. It just matches 2ⁿ⁻¹ for the first five terms. It's the classic warning against guessing from pattern-matching.",
    counterexample: { n: "6" },
  },
  {
    id: "mersenne",
    tier: "Tricky",
    title: "Mersenne's shortcut",
    claim: "If <em>p</em> is prime, then 2<sup><em>p</em></sup> − 1 is prime.",
    evidence: [2n, 3n, 5n, 7n].map((p) => `p = ${p} → ${mersenne(p)} is prime ✓`),
    fields: [
      { key: "p", label: "prime p", placeholder: "e.g. 13" },
      { key: "d", label: "a factor of 2^p − 1", placeholder: "e.g. 7" },
    ],
    check: ({ p, d }) => {
      if (p < 2n || p > 2000n) return survive("Pick a prime p between 2 and 2,000.");
      if (!isPrime(p)) return survive(`${p} isn't prime, so the claim says nothing about it.`);
      return factorVerdict(mersenne(p), d, `2^${p} − 1`);
    },
    hints: ["The next prime after 7 still works. The one after that doesn't.", "Try p = 11. Any factor of 2^p − 1 has the form 2kp + 1.", "2047 = 23 × 89."],
    reveal:
      "The converse is true: if 2ⁿ − 1 is prime, n must be prime. Hudalricus Regius found 2¹¹ − 1 = 2047 = 23 × 89 in 1536. Mersenne primes are still the source of nearly every record-sized prime.",
    counterexample: { p: "11", d: "23" },
  },
  {
    id: "fermat-converse",
    tier: "Tricky",
    title: "The Chinese hypothesis",
    claim: "If <em>n</em> > 1 divides 2<sup><em>n</em></sup> − 2, then <em>n</em> is prime.",
    evidence: ["n = 3 divides 6 ✓ prime", "n = 5 divides 30 ✓ prime", "n = 7 divides 126 ✓ prime", "No composite n below 300 passes."],
    fields: [{ key: "n", label: "n", placeholder: "e.g. 91" }],
    check: ({ n }) => {
      if (n < 2n || n > 10n ** 15n) return survive("Pick n between 2 and 10^15.");
      const passes = modPow(2n, n, n) === 2n % n;
      if (!passes) return survive(`${fmt(n)} does not divide 2^n − 2, so the claim says nothing about it.`);
      if (isPrime(n)) return survive(`${fmt(n)} divides 2^n − 2 and it is prime. The claim survives.`);
      const f = smallestFactor(n) ?? n;
      return broken(`${fmt(n)} divides 2^n − 2, but ${fmt(n)} = ${fmt(f)} × ${fmt(n / f)}. Conjecture broken.`);
    },
    hints: ["Fermat's little theorem goes one way. This claim tries to reverse it.", "Look just above 300, at a product of two primes whose orders of 2 are small.", "341 = 11 × 31, and 2¹⁰ ≡ 1 mod 341."],
    reveal:
      "For centuries this was wrongly credited to ancient Chinese mathematicians. Sarrus found 341 = 11 × 31 in 1819. Numbers like it are called base-2 pseudoprimes, and they're the reason real primality tests (like Miller–Rabin, used in this app) do more than one check.",
    counterexample: { n: "341" },
  },
  {
    id: "threes",
    tier: "Tricky",
    title: "The 31 tower",
    claim: "31, 331, 3331, 33331, … every number of the form 33…31 is prime.",
    evidence: range(8)
      .slice(1)
      .map((k) => `${threes(k)} is prime ✓`),
    fields: [
      { key: "k", label: "number of 3s (k)", placeholder: "e.g. 4" },
      { key: "d", label: "a factor of 33…31", placeholder: "e.g. 7" },
    ],
    check: ({ k, d }) => {
      if (k < 1n || k > 60n) return survive("Pick k between 1 and 60.");
      return factorVerdict(threes(k), d, `${"3".repeat(Number(k))}1`);
    },
    hints: ["Seven wins in a row. The eighth tower is taller than it looks.", "Try k = 8: 333333331. Test small primes up to 20.", "333333331 = 17 × 19607843."],
    reveal:
      "The number with k threes equals (10ᵏ⁺¹ − 7)/3. Seven primes in a row is just luck: primes of that size have density about 1/ln(N), so a long streak is unusual but not remarkable.",
    counterexample: { k: "8", d: "17" },
  },
  {
    id: "fermat",
    tier: "Tricky",
    title: "Fermat's primes",
    claim: "Every Fermat number 2<sup>2<sup><em>n</em></sup></sup> + 1 is prime.",
    evidence: range(5).map((n) => `n = ${n} → ${fermat(n)} is prime ✓`),
    fields: [
      { key: "n", label: "n", placeholder: "e.g. 4" },
      { key: "d", label: "a factor of F(n)", placeholder: "e.g. 3" },
    ],
    check: ({ n, d }) => {
      if (n < 0n || n > 14n) return survive("Pick n between 0 and 14.");
      return factorVerdict(fermat(n), d, `F(${n})`);
    },
    hints: ["Fermat checked five cases and stopped. Try the sixth.", "Any factor of F(5) has the form 64k + 1.", "k = 10: 641 divides 4294967297."],
    reveal:
      "Fermat believed this in 1640. Euler factored F(5) = 641 × 6700417 in 1732. No Fermat prime beyond F(4) = 65537 has ever been found. The five known Fermat primes determine which odd-sided regular polygons can be drawn with ruler and compass.",
    counterexample: { n: "5", d: "641" },
  },
  {
    id: "goldbach-other",
    tier: "Tricky",
    title: "Goldbach's other conjecture",
    claim: "Every odd composite number is a prime plus twice a square: <em>n</em> = <em>p</em> + 2<em>k</em>².",
    evidence: ["9 = 7 + 2·1²", "15 = 7 + 2·2²", "21 = 3 + 2·3²", "25 = 7 + 2·3²", "…every odd composite up to 5,000 works."],
    fields: [{ key: "n", label: "odd composite n", placeholder: "e.g. 33" }],
    check: ({ n }) => {
      if (n < 9n || n > 10n ** 7n || n % 2n === 0n) return survive("Pick an odd n between 9 and 10,000,000.");
      if (isPrime(n)) return survive(`${fmt(n)} is prime, so the claim says nothing about it.`);
      for (let k = 1n; 2n * k * k < n; k++) {
        const p = n - 2n * k * k;
        if (isPrime(p)) return survive(`${fmt(n)} = ${fmt(p)} + 2·${k}². The claim survives.`);
      }
      return broken(`No prime p and integer k give ${fmt(n)} = p + 2k². Conjecture broken.`);
    },
    hints: ["Goldbach proposed this to Euler in 1752. It survived for a century.", "The first failure is between 5,700 and 5,800.", "5777 = 53 × 109. Try it."],
    reveal:
      "Moritz Stern and his students found 5777 and 5993 in 1856. No other counterexamples are known. So it's 'almost true', which is why small checks were so convincing.",
    counterexample: { n: "5777" },
  },
  {
    id: "euler-powers",
    tier: "Boss",
    title: "Euler's sum of powers",
    claim: "A fifth power can't be written as a sum of fewer than five fifth powers.",
    evidence: ["3³ + 4³ + 5³ = 6³ uses three cubes", "Euler (1769): kth powers need k terms", "k = 3 (no cube is a sum of two cubes) is Fermat's Last Theorem ✓"],
    fields: [
      { key: "a", label: "a", placeholder: "a" },
      { key: "b", label: "b", placeholder: "b" },
      { key: "c", label: "c", placeholder: "c" },
      { key: "d", label: "d", placeholder: "d" },
      { key: "e", label: "e (target)", placeholder: "e" },
    ],
    check: ({ a, b, c, d, e }) => {
      if ([a, b, c, d, e].some((x) => x < 1n)) return survive("All five numbers must be positive integers.");
      const lhs = a ** 5n + b ** 5n + c ** 5n + d ** 5n;
      const rhs = e ** 5n;
      return lhs === rhs
        ? broken(`${a}⁵ + ${b}⁵ + ${c}⁵ + ${d}⁵ = ${fmt(rhs)} = ${e}⁵. Four fifth powers make a fifth power. Conjecture broken.`)
        : survive(`${a}⁵ + ${b}⁵ + ${c}⁵ + ${d}⁵ = ${fmt(lhs)} ≠ ${e}⁵ = ${fmt(rhs)}. The claim survives.`);
    },
    hints: ["It took until 1966 and a CDC 6600 computer to find it.", "The target e is 144.", "27⁵ + 84⁵ + 110⁵ + 133⁵ = 144⁵."],
    reveal:
      "Lander and Parkin published a two-sentence paper in 1966 giving this counterexample. Noam Elkies later broke the fourth-power case in 1988: 2682440⁴ + 15365639⁴ + 18796760⁴ = 20615673⁴.",
    counterexample: { a: "27", b: "84", c: "110", d: "133", e: "144" },
  },
  {
    id: "cyclotomic",
    tier: "Boss",
    title: "Tame cyclotomics",
    claim: "Every coefficient of every cyclotomic polynomial Φ<sub><em>n</em></sub>(<em>x</em>) is −1, 0 or 1.",
    evidence: ["Φ₆(x) = x² − x + 1 ✓", "Φ₁₂(x) = x⁴ − x² + 1 ✓", "Φ₃₀(x) = x⁸ + x⁷ − x⁵ − x⁴ − x³ + x + 1 ✓", "All n below 100 check out."],
    fields: [{ key: "n", label: "n", placeholder: "e.g. 30" }],
    check: ({ n }) => {
      if (n < 1n || n > 400n) return survive("Pick n between 1 and 400.");
      const coeffs = cyclotomic(Number(n));
      const wild = coeffs.findIndex((c) => Math.abs(c) > 1);
      return wild === -1
        ? survive(`All ${coeffs.length} coefficients of Φ${n} lie in {−1, 0, 1}. The claim survives.`)
        : broken(`Φ${n}(x) has coefficient ${coeffs[wild]} on x^${wild}. Conjecture broken.`);
    },
    hints: ["You need n with three distinct odd prime factors.", "Multiply the three smallest odd primes.", "n = 105 = 3 · 5 · 7. The coefficient of x⁷ is −2."],
    reveal:
      "Φₙ(x) is the minimal polynomial of a primitive nth root of unity. If n has at most two distinct odd prime factors, every coefficient really is −1, 0 or 1. Φ₁₀₅ is the first exception, and coefficients can grow without bound (Schur, 1931).",
    counterexample: { n: "105" },
  },
  {
    id: "gcd-17",
    tier: "Boss",
    title: "The 52-digit liar",
    claim: "For every positive integer <em>n</em>, gcd(<em>n</em>¹⁷ + 9, (<em>n</em> + 1)¹⁷ + 9) = 1.",
    evidence: ["n = 1 → gcd(10, 131081) = 1 ✓", "n = 2 → gcd = 1 ✓", "…true for every n up to 10⁵⁰."],
    fields: [{ key: "n", label: "n (paste as many digits as you like)", placeholder: "a very large n" }],
    check: ({ n }) => {
      if (n < 1n) return survive("Pick a positive integer.");
      const g = boss(n);
      return g === 1n
        ? survive(`gcd = 1 for n = ${fmt(n)}. The claim survives.`)
        : broken(`gcd(n¹⁷ + 9, (n+1)¹⁷ + 9) = ${fmt(g)} for n = ${fmt(n)}. Conjecture broken.`);
    },
    hints: [
      "No amount of checking will find this one. The smallest counterexample has 52 digits.",
      "Take the resultant of x¹⁷ + 9 and (x + 1)¹⁷ + 9. It's a prime p, and the counterexample is a common root mod p.",
      "n = 8424432925592889329288197322308900672459420460792433",
    ],
    reveal:
      "The two polynomials share a root modulo the prime 8936582237915716659950962253358945635793453256935559, their resultant. The first n where both vanish is 8424432925592889329288197322308900672459420460792433. A brute-force search at a billion checks a second would need about 10³⁵ years to get there. The only way through is algebra.",
    counterexample: { n: "8424432925592889329288197322308900672459420460792433" },
  },
];
