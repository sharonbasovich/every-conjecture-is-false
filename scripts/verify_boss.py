"""Proof that n0 = 8424432925592889329288197322308900672459420460792433 is the
smallest positive n with gcd(n^17 + 9, (n + 1)^17 + 9) > 1.

Argument
  1. R = Res(f, g) for f = x^17 + 9, g = (x + 1)^17 + 9 satisfies R = A f + B g
     with A, B in Z[x], so any common divisor of f(n) and g(n) divides R.
  2. R = p is prime (Pratt certificate below, not just a probable-prime test).
  3. So gcd(f(n), g(n)) > 1 iff p | f(n) and p | g(n), i.e. n is a common root mod p.
  4. gcd(f, g) over GF(p) has degree 1, so the common root r is unique mod p.
  5. Hence the counterexamples are exactly n = r + kp, and the smallest positive one is r.
     r > 10^50, so the claim holds for every n <= 10^50.

Run: python3 scripts/verify_boss.py   (needs sympy only for factoring p - 1)
"""
from fractions import Fraction
from math import comb, gcd

from sympy import factorint

N0 = 8424432925592889329288197322308900672459420460792433
F = [9] + [0] * 16 + [1]  # low -> high
G = [comb(17, k) for k in range(18)]
G[0] += 9


def sylvester_det(a, b):
    """Resultant via the Sylvester matrix, exact rational Gaussian elimination."""
    m, n = len(a) - 1, len(b) - 1
    ah, bh = a[::-1], b[::-1]
    rows = [[0] * i + ah + [0] * (n - 1 - i) for i in range(n)]
    rows += [[0] * i + bh + [0] * (m - 1 - i) for i in range(m)]
    M = [[Fraction(x) for x in r] for r in rows]
    size, det = m + n, Fraction(1)
    for c in range(size):
        piv = next((r for r in range(c, size) if M[r][c] != 0), None)
        if piv is None:
            return 0
        if piv != c:
            M[c], M[piv] = M[piv], M[c]
            det = -det
        det *= M[c][c]
        for r in range(c + 1, size):
            f = M[r][c] / M[c][c]
            if f:
                M[r] = [x - f * y for x, y in zip(M[r], M[c])]
    assert det.denominator == 1
    return int(det)


def poly_gcd_mod(a, b, p):
    def trim(v):
        v = [x % p for x in v]
        while v and v[-1] == 0:
            v.pop()
        return v

    def rem(u, v):
        u = u[:]
        inv = pow(v[-1], -1, p)
        while len(u) >= len(v):
            c, s = u[-1] * inv % p, len(u) - len(v)
            for i, vc in enumerate(v):
                u[s + i] = (u[s + i] - c * vc) % p
            u = trim(u)
        return u

    a, b = trim(a), trim(b)
    while b:
        a, b = b, rem(a, b)
    inv = pow(a[-1], -1, p)
    return [x * inv % p for x in a]


def is_prime_64(n):
    if n < 2:
        return False
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):  # deterministic for all n < 2^64
        if a % n == 0:
            continue
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def pratt(n, depth=0):
    """Recursive Lucas/Pratt primality certificate. Returns True only with a proof."""
    if n < 2**64:
        return is_prime_64(n)
    fac = factorint(n - 1)
    prod = 1
    for q, e in fac.items():
        prod *= q**e
    assert prod == n - 1
    if not all(pratt(q, depth + 1) for q in fac):
        return False
    for a in range(2, 1000):
        if pow(a, n - 1, n) == 1 and all(pow(a, (n - 1) // q, n) != 1 for q in fac):
            print(f"{'  ' * depth}{len(str(n))}-digit prime: witness {a}, n-1 = {fac}")
            return True
    return False


if __name__ == "__main__":
    p = abs(sylvester_det(F, G))
    print("Res(f, g) =", p, f"({len(str(p))} digits)")
    assert pratt(p), "resultant is not provably prime"
    h = poly_gcd_mod(F, G, p)
    assert len(h) == 2, f"gcd over GF(p) has degree {len(h) - 1}"
    r = -h[0] % p
    print("unique common root mod p:", r)
    assert r == N0
    assert gcd(N0**17 + 9, (N0 + 1) ** 17 + 9) == p
    assert r > 10**50
    print("PROVED: smallest counterexample is", N0, "and every n <= 10^50 has gcd 1.")
