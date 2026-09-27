# Devpost submission copy

**Project name:** Every Conjecture Here Is False

**Tagline (≤ 200 chars):** Every claim here is false. Your job is to break it. 12 famous math patterns that hold for 5, 40, even 10⁵⁰ cases, then fail. Find the counterexample; the browser checks it exactly.

**Built with (tags):** typescript, vite, vitest, bigint, github-pages, github-actions, python, sympy

**Links**
- Live demo (no login): https://sharonbasovich.github.io/every-conjecture-is-false/
- GitHub: https://github.com/sharonbasovich/every-conjecture-is-false
- Video: (paste YouTube/Vimeo link of docs/video/demo.mp4)

---

**Every claim here is false. Your job is to break it.**

Try this one: n² + n + 41 is prime. n = 0 gives 41, n = 1 gives 43, n = 10 gives 151... it keeps working for **forty straight values**. Then n = 40 gives 1681 = 41 × 41.

That's the warm-up. The boss claims gcd(n¹⁷ + 9, (n+1)¹⁷ + 9) = 1 for every n. It's true for every n up to 10⁵⁰. The first counterexample has **52 digits**, and a computer checking a billion values a second would need about 10³⁵ years to reach it. You only get there with algebra.

## Judges: the 60-second route

1. Open https://sharonbasovich.github.io/every-conjecture-is-false/ (desktop or phone, no login).
2. Click **03 Euler's prime generator**. Type `10`, press **Break it** → "151 is prime. The claim survives."
3. Type `40` → the claim is stamped **FALSE** (1681 = 41 × 41) and a note explains why it fooled Euler's readers.
4. Click **12 The 52-digit liar**, press **Show hint** three times, paste the number from hint 3, press **Break it** → the two numbers share a 52-digit prime factor.
5. Optional: any other claim. Wrong answers tell you exactly why the claim survives. **Reset progress** is in the footer.

## What it does

Twelve real, historically famous claims, from warm-up to boss. Each shows the claim, the evidence that makes it look true, and an input box.

- **Warm-ups:** chords between n points on a circle make 1, 2, 4, 8, 16 regions... and then 31.
- **Tricky:** Fermat thought 2^(2ⁿ) + 1 was always prime. Euler found the factor 641.
- **Boss:** Euler's sum-of-powers conjecture (broken by computer in 1966), cyclotomic polynomial coefficients (Φ₁₀₅ has a −2), and the 52-digit gcd.

Enter a counterexample and the app checks it. Right answers get a FALSE stamp and a short "why it looked true" note with the history. A three-step hint ladder means nobody gets stuck; the last hint gives the answer.

## How we built it

- **Verifiers, not an answer key.** Every submission runs through a per-claim checker using native JavaScript BigInt: exact products and divisibility, modular exponentiation, gcd, Miller–Rabin primality (deterministic at every size the app ever tests), exhaustive three-square search, and exact cyclotomic polynomials from the Möbius product formula.
- **Input limits so the tab never freezes.** Each claim has bounds (for example n ≤ 10¹⁵ for the pseudoprime claim, 400 digits max anywhere). The slowest worst case we found runs in about 50 ms.
- **Honest evidence.** Unit tests recompute every green "evidence" chip and check that each first failure really is the first (nothing below 341 fools the Fermat test; 5777 and 5993 are the only Goldbach failures below 6000; 105 is the first wild cyclotomic).
- **The boss is proved, not asserted.** `scripts/verify_boss.py` computes the resultant of the two polynomials, proves it prime with a Pratt certificate, and shows the polynomials share exactly one root mod that prime. So the 52-digit number really is the smallest counterexample.
- Plain TypeScript UI, no framework, no runtime dependencies. GitHub Actions runs typecheck, tests and build, then deploys to GitHub Pages.

## AI assistance

Built with heavy AI assistance (Devin by Cognition) for code, tests, copy and QA, which the rules allow. The math was independently re-checked with SymPy, and the boss claim with the proof script above.

## Challenges

- A puzzle about misleading evidence can't have wrong evidence, so every number shown on screen is recomputed in tests.
- Claiming "smallest counterexample" needs a proof, not a search. The resultant argument gave us one.
- Letting judges paste anything without freezing the browser meant picking bounds per claim.

## What we learned

A pattern holding for a long time tells you almost nothing about whether it holds forever.

## What's next

A "submit your own trap" mode, a classroom view for teachers, and geometry and probability traps with interactive diagrams.
