import "./style.css";
import { conjectures, type Conjecture, type Verdict } from "./conjectures";
import { parseInteger } from "./math";

const STORAGE_KEY = "ecif-progress-v1";

interface Progress {
  broken: Record<string, string>;
  hints: Record<string, number>;
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { broken: {}, hints: {}, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt storage */
  }
  return { broken: {}, hints: {} };
}

const progress = loadProgress();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

const app = document.querySelector<HTMLDivElement>("#app")!;
let current: Conjecture = conjectures.find((c) => !progress.broken[c.id]) ?? conjectures[0];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, html = ""): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (html) node.innerHTML = html;
  return node;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

function render(): void {
  const brokenCount = Object.keys(progress.broken).length;
  app.innerHTML = `
    <header class="hero">
      <p class="kicker">A puzzle about proof · ${conjectures.length} claims · 0 true</p>
      <h1>Every conjecture here is <span class="strike">true</span> <span class="false">false.</span></h1>
      <p class="lede">Each claim below holds for the first few cases, sometimes the first 40, sometimes the first 10<sup>50</sup>. Your job is to find the counterexample. The app checks it exactly, using big-integer arithmetic.</p>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${conjectures.length}" aria-valuenow="${brokenCount}" aria-label="conjectures broken">
        <div class="meter-fill" style="width:${(100 * brokenCount) / conjectures.length}%"></div>
        <span class="meter-label" data-testid="score">${brokenCount} / ${conjectures.length} broken</span>
      </div>
    </header>
    <main class="layout">
      <nav class="deck" aria-label="conjectures"></nav>
      <section class="card" aria-live="polite"></section>
    </main>
    <footer class="foot">
      <button class="ghost" id="share" type="button">Copy my score</button>
      <button class="ghost" id="reset" type="button">Reset progress</button>
      <p>Built for Hyperbloom September 2026. Examples are evidence, not proof.</p>
    </footer>`;

  const deck = app.querySelector<HTMLElement>(".deck")!;
  let lastTier = "";
  conjectures.forEach((c, i) => {
    if (c.tier !== lastTier) {
      deck.append(el("h2", { class: "tier" }, c.tier));
      lastTier = c.tier;
    }
    const isBroken = Boolean(progress.broken[c.id]);
    const btn = el(
      "button",
      {
        type: "button",
        class: `deck-item${c.id === current.id ? " active" : ""}${isBroken ? " done" : ""}`,
        "data-id": c.id,
        "aria-current": c.id === current.id ? "true" : "false",
      },
      `<span class="num">${String(i + 1).padStart(2, "0")}</span><span class="name">${c.title}</span><span class="badge">${isBroken ? "FALSE" : "?"}</span>`,
    );
    btn.addEventListener("click", () => {
      current = c;
      render();
    });
    deck.append(btn);
  });

  renderCard(app.querySelector<HTMLElement>(".card")!);

  app.querySelector("#reset")!.addEventListener("click", () => {
    if (!confirm("Forget every counterexample you've found?")) return;
    progress.broken = {};
    progress.hints = {};
    save();
    current = conjectures[0];
    render();
  });
  app.querySelector("#share")!.addEventListener("click", async (ev) => {
    const text = `I broke ${brokenCount}/${conjectures.length} "obviously true" math conjectures in Every Conjecture Here Is False. ${location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      (ev.target as HTMLButtonElement).textContent = "Copied!";
    } catch {
      prompt("Copy this:", text);
    }
  });
}

function renderCard(card: HTMLElement): void {
  const c = current;
  const solved = progress.broken[c.id];
  const hintsShown = progress.hints[c.id] ?? 0;
  card.innerHTML = `
    <div class="card-head">
      <span class="pill ${c.tier.toLowerCase().replace(/[^a-z]/g, "")}">${c.tier}</span>
      <h2>${c.title}</h2>
    </div>
    <blockquote class="claim" data-testid="claim">${c.claim}${solved ? '<span class="stamp">FALSE</span>' : ""}</blockquote>
    <div class="evidence">
      <p class="evidence-title">The evidence looks great:</p>
      <ul>${c.evidence.map((e) => `<li>${e}</li>`).join("")}</ul>
    </div>
    <form class="attack" novalidate>
      <p class="attack-title">Your counterexample</p>
      <div class="fields">
        ${c.fields
          .map(
            (f) => `<label><span>${f.label}</span><input name="${f.key}" inputmode="numeric" autocomplete="off" placeholder="${f.placeholder}" value="${escapeHtml(solved ? JSON.parse(solved)[f.key] ?? "" : "")}" /></label>`,
          )
          .join("")}
      </div>
      <button type="submit" class="primary">Break it</button>
      <p class="verdict" data-testid="verdict"></p>
    </form>
    <div class="hints">
      ${c.hints
        .slice(0, hintsShown)
        .map((h, i) => `<p class="hint"><strong>Hint ${i + 1}.</strong> ${h}</p>`)
        .join("")}
      ${hintsShown < c.hints.length ? `<button type="button" class="ghost" id="hint">Show hint ${hintsShown + 1} of ${c.hints.length}</button>` : ""}
    </div>
    ${solved ? `<div class="reveal"><p class="reveal-title">Why it looked true</p><p>${c.reveal}</p></div>` : ""}
    ${solved ? nextButton() : ""}`;

  const form = card.querySelector<HTMLFormElement>("form")!;
  const verdictEl = card.querySelector<HTMLParagraphElement>(".verdict")!;
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const raw: Record<string, string> = {};
    const values: Record<string, bigint> = {};
    for (const f of c.fields) {
      const input = form.elements.namedItem(f.key) as HTMLInputElement;
      raw[f.key] = input.value.trim();
      const parsed = parseInteger(input.value);
      if (parsed === null) {
        showVerdict(verdictEl, { broken: false, message: `“${f.label}” needs to be a whole number.` });
        input.focus();
        return;
      }
      values[f.key] = parsed;
    }
    const verdict = c.check(values);
    if (verdict.broken) {
      progress.broken[c.id] = JSON.stringify(raw);
      save();
      render();
      const v = app.querySelector<HTMLParagraphElement>(".verdict")!;
      showVerdict(v, verdict);
      app.querySelector(".stamp")?.classList.add("slam");
      return;
    }
    showVerdict(verdictEl, verdict);
  });

  card.querySelector("#hint")?.addEventListener("click", () => {
    progress.hints[c.id] = hintsShown + 1;
    save();
    render();
  });
  card.querySelector("#next")?.addEventListener("click", () => {
    const idx = conjectures.indexOf(c);
    current = conjectures.slice(idx + 1).find((x) => !progress.broken[x.id]) ?? conjectures.find((x) => !progress.broken[x.id]) ?? c;
    render();
  });
}

function nextButton(): string {
  const remaining = conjectures.filter((x) => !progress.broken[x.id]).length;
  return remaining === 0
    ? `<p class="done-all">You broke all ${conjectures.length}. Checking examples is not proving. Now you know it from experience.</p>`
    : `<button type="button" class="primary" id="next">Next conjecture →</button>`;
}

function showVerdict(node: HTMLElement, v: Verdict): void {
  node.textContent = v.message;
  node.className = `verdict ${v.broken ? "win" : "hold"}`;
}

render();
