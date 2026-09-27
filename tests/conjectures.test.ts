import { describe, expect, it } from "vitest";
import { conjectures } from "../src/conjectures";

const asBig = (r: Record<string, string>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, BigInt(v)]));

describe("conjecture catalogue", () => {
  it("has unique ids and three hints each", () => {
    expect(new Set(conjectures.map((c) => c.id)).size).toBe(conjectures.length);
    for (const c of conjectures) expect(c.hints).toHaveLength(3);
  });

  for (const c of conjectures) {
    describe(c.id, () => {
      it("accepts its canonical counterexample", () => {
        expect(Object.keys(c.counterexample).sort()).toEqual(c.fields.map((f) => f.key).sort());
        const v = c.check(asBig(c.counterexample));
        expect(v.broken, v.message).toBe(true);
      });
      it("rejects all-ones input or explains why", () => {
        const ones = Object.fromEntries(c.fields.map((f) => [f.key, 1n]));
        const v = c.check(ones);
        expect(v.broken).toBe(false);
        expect(v.message.length).toBeGreaterThan(10);
      });
    });
  }
});

const byId = (id: string) => conjectures.find((c) => c.id === id)!;

describe("the claims really do hold for small cases", () => {
  it("n² + n + 41 survives n = 0..39 and breaks at 40", () => {
    for (let n = 0n; n < 40n; n++) expect(byId("euler-41").check({ n }).broken).toBe(false);
    expect(byId("euler-41").check({ n: 40n }).broken).toBe(true);
  });
  it("circle regions double for n = 1..5 only", () => {
    for (let n = 1n; n <= 5n; n++) expect(byId("circle").check({ n }).broken).toBe(false);
    expect(byId("circle").check({ n: 6n }).message).toContain("31");
  });
  it("no composite below 341 fools the Fermat converse", () => {
    for (let n = 2n; n < 341n; n++) expect(byId("fermat-converse").check({ n }).broken).toBe(false);
  });
  it("Goldbach's other conjecture: 5777 and 5993 are the first failures", () => {
    const fails: bigint[] = [];
    for (let n = 9n; n <= 6000n; n += 2n) if (byId("goldbach-other").check({ n }).broken) fails.push(n);
    expect(fails).toEqual([5777n, 5993n]);
  });
  it("three squares: 7 is the first failure", () => {
    for (let n = 1n; n < 7n; n++) expect(byId("three-squares").check({ n }).broken).toBe(false);
  });
  it("cyclotomic: 105 is the first wild n", () => {
    for (let n = 1n; n < 105n; n++) expect(byId("cyclotomic").check({ n }).broken).toBe(false);
  });
  it("wrong factors and non-prime exponents do not count", () => {
    expect(byId("fermat").check({ n: 5n, d: 640n }).broken).toBe(false);
    expect(byId("fermat").check({ n: 5n, d: 1n }).broken).toBe(false);
    expect(byId("mersenne").check({ p: 4n, d: 3n }).broken).toBe(false);
    expect(byId("mersenne").check({ p: 11n, d: 89n }).broken).toBe(true);
    expect(byId("threes").check({ k: 7n, d: 3n }).broken).toBe(false);
    expect(byId("repunit").check({ n: 19n, d: 3n }).broken).toBe(false);
  });
  it("boss: neighbouring n values have gcd 1", () => {
    const n = 8424432925592889329288197322308900672459420460792433n;
    expect(byId("gcd-17").check({ n: n - 1n }).broken).toBe(false);
    expect(byId("gcd-17").check({ n: n + 1n }).broken).toBe(false);
    expect(byId("gcd-17").check({ n }).message).toContain("8,936,582");
  });
  it("Euler sum of powers rejects near misses", () => {
    expect(byId("euler-powers").check({ a: 27n, b: 84n, c: 110n, d: 133n, e: 143n }).broken).toBe(false);
  });
});
