# Devpost submission copy

**Project name:** Every Conjecture Here Is False

**Tagline (≤ 200 chars):** Every claim in this app is false. Your job is to prove it. Twelve famous math "patterns" that hold for 5, 40, even 10⁵⁰ cases, then break.

**Built with (tags):** typescript, vite, vitest, bigint, github-pages, github-actions

**Links**
- Live demo: https://sharonbasovich.github.io/every-conjecture-is-false/
- GitHub: https://github.com/sharonbasovich/every-conjecture-is-false
- Video: (upload docs/video/walkthrough.mp4 or the narrated recording to YouTube and paste the link)

---

## Inspiration

n² + n + 41 is prime for n = 0, 1, 2, … all the way to 39. Forty wins in a row. Most people, and most students on a homework set, would call that proven. Then n = 40 gives 1681 = 41².

Math classes spend a lot of time telling students that examples aren't proof, and almost no time letting them *feel* it. We wanted a place where the lesson hits you in the gut: every claim looks airtight, every one is false, and you get to be the one who breaks it.

## What it does

**Every Conjecture Here Is False** is a browser puzzle with 12 real, historically famous claims, arranged from warm-up to boss:

- **Warm-ups** like "chords between n points on a circle make 2ⁿ⁻¹ regions". That's 1, 2, 4, 8, 16… and then 31.
- **Tricky ones** like Fermat's claim that 2^(2ⁿ) + 1 is always prime, which Euler broke with the factor 641.
- **Bosses** like gcd(n¹⁷ + 9, (n+1)¹⁷ + 9) = 1. It's true for every n you could ever test by brute force. The first counterexample has **52 digits**.

For each claim you see the claim, the evidence that makes it look true, and an input box. Type a counterexample and hit **Break it**:
- If you're wrong, the app shows you exactly why the claim survives your input (for example "10² + 10 + 41 = 151 is prime").
- If you're right, the claim gets stamped **FALSE**, and a short "why it looked true" note explains the math and history behind the trap.

A three-step hint ladder keeps anyone from getting stuck, and progress is saved automatically.

## How we built it

- **No answer key.** Every submission is verified from first principles with native JavaScript BigInt: Miller–Rabin primality testing, modular exponentiation, exact gcds on numbers with 800+ digits, Legendre's three-square test, and exact cyclotomic polynomials computed with the Möbius product formula.
- Each claim is a small object with its own `check()` function and input bounds, so the page never freezes even if you paste a 400-digit number.
- The UI is plain TypeScript with no framework, built with Vite and deployed to GitHub Pages by GitHub Actions.
- 43 Vitest unit tests confirm three things: every canonical counterexample breaks its claim, every "evidence" chip is actually true, and the first failure really is the first. For example, we check that nothing below 341 fools the Fermat test and that 5777 and 5993 are the first failures of Goldbach's other conjecture.

## Challenges we ran into

- **Making the evidence honest.** A puzzle about deceptive evidence can't have wrong evidence. We wrote tests that recompute every prime shown on screen.
- **The 52-digit boss.** Verifying the gcd means raising a 52-digit number to the 17th power. BigInt handles it instantly, but we had to cap input sizes everywhere else so a curious judge can't lock up the tab.
- **Cyclotomic polynomials.** Computing Φ₁₀₅ exactly and quickly needed careful polynomial division. The coefficient −2 is the entire punchline.

## Accomplishments that we're proud of

- Twelve counterexamples spanning 350 years of mathematical history (Fermat 1640, Euler 1732, Stern 1856, Lander & Parkin 1966), all checked live in your browser.
- A design that's fun for a beginner (the first claim falls at n = 3) and still bites for a math major (the bosses).

## What we learned

A pattern holding for a long time tells you almost nothing about whether it holds forever. The only way through the boss level is algebra (the resultant of two polynomials), not faster computers.

## What's next

- A "submit your own trap" mode with community-voted claims.
- A classroom view where a teacher shares a link and sees which claims their students broke.
- Geometry and probability traps with interactive diagrams.

---

## Demo instructions for judges

1. Open https://sharonbasovich.github.io/every-conjecture-is-false/ in any modern browser. No login is needed.
2. Click **Euler's prime generator**, enter `10` → survives. Enter `40` → stamped FALSE.
3. Click **The 52-digit liar**, click **Show hint** three times, paste the number from hint 3 → broken.
4. Anything else: pick a claim, try numbers, use hints. **Reset progress** is in the footer.
