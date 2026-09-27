import { describe, expect, it } from "vitest";
import { cyclotomic, gcd, isPrime, isSumOfThreeSquares, mobius, modPow, parseInteger, smallestFactor } from "../src/math";

describe("math helpers", () => {
  it("isPrime agrees with trial division below 20,000", () => {
    for (let n = 0n; n < 20000n; n++) expect(isPrime(n)).toBe(n >= 2n && smallestFactor(n) === null && n !== 0n && n !== 1n);
  });
  it("isPrime rejects strong pseudoprimes and accepts large primes", () => {
    expect(isPrime(3215031751n)).toBe(false);
    expect(isPrime(3825123056546413051n)).toBe(false);
    expect(isPrime(2n ** 61n - 1n)).toBe(true);
    expect(isPrime(2n ** 67n - 1n)).toBe(false);
  });
  it("modPow and gcd", () => {
    expect(modPow(2n, 340n, 341n)).toBe(1n);
    expect(gcd(-12n, 18n)).toBe(6n);
  });
  it("three squares follows Legendre", () => {
    const legendre = (n: number) => {
      while (n % 4 === 0) n /= 4;
      return n % 8 !== 7;
    };
    for (let n = 1; n < 500; n++) expect(isSumOfThreeSquares(BigInt(n))).toBe(legendre(n));
  });
  it("mobius", () => {
    expect([1, 2, 3, 4, 5, 6, 30, 105].map(mobius)).toEqual([1, -1, -1, 0, -1, 1, -1, -1]);
  });
  it("cyclotomic polynomials", () => {
    expect(cyclotomic(1)).toEqual([-1, 1]);
    expect(cyclotomic(6)).toEqual([1, -1, 1]);
    expect(cyclotomic(12)).toEqual([1, 0, -1, 0, 1]);
    expect(cyclotomic(30)).toEqual([1, 1, 0, -1, -1, -1, 0, 1, 1]);
    const c105 = cyclotomic(105);
    expect(c105.length).toBe(49);
    expect(c105[7]).toBe(-2);
    expect(c105[41]).toBe(-2);
    for (let n = 1; n < 105; n++) expect(cyclotomic(n).every((c) => Math.abs(c) <= 1)).toBe(true);
  });
  it("parseInteger", () => {
    expect(parseInteger(" 1,000 ")).toBe(1000n);
    expect(parseInteger("12a")).toBeNull();
    expect(parseInteger("")).toBeNull();
    expect(parseInteger("9".repeat(401))).toBeNull();
  });
});

describe("facts quoted in the evidence and reveals", () => {
  it("evidence cases are genuinely prime", () => {
    for (let k = 1n; k <= 7n; k++) expect(isPrime((10n ** (k + 1n) - 7n) / 3n)).toBe(true);
    for (const n of [2n, 19n, 23n]) expect(isPrime((10n ** n - 1n) / 9n)).toBe(true);
    for (let n = 0n; n <= 4n; n++) expect(isPrime(2n ** (2n ** n) + 1n)).toBe(true);
    for (const p of [2n, 3n, 5n, 7n]) expect(isPrime(2n ** p - 1n)).toBe(true);
    for (let n = 0n; n < 40n; n++) expect(isPrime(n * n + n + 41n)).toBe(true);
  });
  it("quoted identities hold", () => {
    expect(2682440n ** 4n + 15365639n ** 4n + 18796760n ** 4n).toBe(20615673n ** 4n);
    expect(3n ** 3n + 4n ** 3n + 5n ** 3n).toBe(6n ** 3n);
    expect(641n * 6700417n).toBe(2n ** 32n + 1n);
  });
});
