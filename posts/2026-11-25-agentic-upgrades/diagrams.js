// Animated canvas diagrams for "Upgrades on autopilot".
// Each <canvas data-diagram="name"> gets a looping animation drawn in a fixed
// logical coordinate space and scaled to the container width.
(function () {
  "use strict";

  const C = {
    bg: "#0f1513", line: "#1f2a27", line2: "#2c3b37", fg: "#d7e2dc", bright: "#eef5f1",
    muted: "#8a9a92", green: "#7ee787", amber: "#f2b866", blue: "#79b8ff", red: "#ff7b72",
  };
  const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
  const SANS = '"Inter", system-ui, sans-serif';
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (x) => { x = clamp(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const lerp = (a, b, u) => a + (b - a) * u;

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function box(c, x, y, w, h, o) {
    o = o || {};
    rr(c, x, y, w, h, o.r || 8);
    c.fillStyle = o.fill || C.bg; c.fill();
    c.lineWidth = o.lw || 1.4; c.strokeStyle = o.stroke || C.line2;
    if (o.glow) { c.shadowColor = o.stroke; c.shadowBlur = o.glow; }
    c.stroke(); c.shadowBlur = 0;
  }
  function text(c, s, x, y, o) {
    o = o || {};
    c.font = (o.weight || 400) + " " + (o.size || 13) + "px " + (o.sans ? SANS : MONO);
    c.fillStyle = o.color || C.fg;
    c.textAlign = o.align || "left";
    c.textBaseline = o.base || "alphabetic";
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.fillText(s, x, y);
    c.globalAlpha = 1;
  }
  function dot(c, x, y, r, color, glow) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = color; c.shadowColor = color; c.shadowBlur = glow || 0;
    c.fill(); c.shadowBlur = 0;
  }
  function pill(c, s, x, y, color) {
    c.font = "600 10px " + MONO;
    const w = c.measureText(s).width + 12;
    rr(c, x, y, w, 18, 9); c.fillStyle = color; c.fill();
    text(c, s, x + w / 2, y + 13, { size: 10, weight: 600, color: C.bg, align: "center" });
    return w;
  }
  function arrow(c, x1, y1, x2, y2, color, dashed) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = color; c.lineWidth = 1.4;
    if (dashed) c.setLineDash([4, 5]);
    c.stroke(); c.setLineDash([]);
    const a = Math.atan2(y2 - y1, x2 - x1);
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - 8 * Math.cos(a - 0.45), y2 - 8 * Math.sin(a - 0.45));
    c.lineTo(x2 - 8 * Math.cos(a + 0.45), y2 - 8 * Math.sin(a + 0.45));
    c.closePath(); c.fillStyle = color; c.fill();
  }
  function check(c, x, y, s, color) {
    c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s / 3, y + s * 0.7); c.lineTo(x + s, y - s * 0.7);
    c.strokeStyle = color; c.lineWidth = 2.2; c.lineCap = "round"; c.stroke(); c.lineCap = "butt";
  }
  // stable pseudo-random per index
  const rnd = (i) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); };

  // ---------- 1. the loop
  const loop = {
    W: 900, H: 380, period: 8000, still: 0.1,
    draw(c, p) {
      const cx = 450, cy = 190, rx = 300, ry = 125;
      // orbit
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      c.strokeStyle = C.line2; c.lineWidth = 1.4; c.setLineDash([3, 7]); c.stroke(); c.setLineDash([]);

      const nodes = [
        { a: Math.PI, t: "1 · find", s: "scan the whole fleet", col: C.blue },
        { a: Math.PI * 5 / 3, t: "2 · fix", s: "agent + playbook", col: C.green, ai: true },
        { a: Math.PI / 3, t: "3 · review + merge", s: "owner merges, finding closes", col: C.amber },
      ];
      const ang = Math.PI + p * Math.PI * 2;
      // trail
      for (let k = 18; k >= 0; k--) {
        const a = ang - k * 0.035;
        dot(c, cx + rx * Math.cos(a), cy + ry * Math.sin(a), 4 - k * 0.18, C.green, 0);
        c.globalAlpha = 1;
      }
      const hx = cx + rx * Math.cos(ang), hy = cy + ry * Math.sin(ang);
      dot(c, hx, hy, 6, C.green, 18);

      nodes.forEach((n) => {
        const x = cx + rx * Math.cos(n.a), y = cy + ry * Math.sin(n.a);
        let d = Math.abs(((ang - n.a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        const on = d < 0.45;
        const w = 230, h = 66;
        box(c, x - w / 2, y - h / 2, w, h, { stroke: on ? n.col : C.line2, lw: on ? 2 : 1.4, glow: on ? 16 : 0, fill: C.bg });
        text(c, n.t, x - w / 2 + 14, y - 6, { size: 15, weight: 700, color: on ? n.col : C.bright });
        text(c, n.s, x - w / 2 + 14, y + 16, { size: 12, color: C.muted, sans: true });
        if (n.ai) pill(c, "AI", x + w / 2 - 38, y - h / 2 + 10, C.green);
      });

      text(c, "a closed loop", cx, cy - 8, { size: 16, weight: 700, color: C.bright, align: "center" });
      text(c, "runs by itself, every few hours", cx, cy + 16, { size: 12.5, color: C.muted, align: "center", sans: true });
    },
  };

  // ---------- 2. find: scan the fleet from several sources
  const scan = {
    W: 900, H: 420, period: 9000, still: 0.95,
    draw(c, p) {
      const t = p * 9;
      // sources
      const src = [
        { t: "inventory DB", s: "which services exist, who owns them", col: C.blue },
        { t: "data lake", s: "SQL over build + deploy data", col: C.blue },
        { t: "SBOMs", s: "what's really inside each artifact", col: C.blue },
        { t: "GitHub Actions", s: "sh · python · API call · headless agent", col: C.green, any: true },
      ];
      const sx = 20, sw = 250, sh = 60, sg = 18, sy0 = 46;
      text(c, "where the facts come from", sx, 28, { size: 11, color: C.muted });
      const R = { x: 330, y: 168, w: 150, h: 78 };
      src.forEach((s, i) => {
        const y = sy0 + i * (sh + sg);
        const ph = (t * 0.9 + i * 0.55) % 2.2; // each source sends a packet every ~2.4s
        const busy = ph < 0.9 && t < 7;
        box(c, sx, y, sw, sh, { stroke: busy ? s.col : C.line2, glow: busy ? 8 : 0 });
        text(c, s.t, sx + 14, y + 25, { size: 14, weight: 700, color: C.bright });
        text(c, s.s, sx + 14, y + 45, { size: 11.5, color: C.muted, sans: true });
        if (s.any) pill(c, "any detector", sx + sw - 98, y + 9, C.green);
        // connector + packet
        const x1 = sx + sw, y1 = y + sh / 2, x2 = R.x, y2 = R.y + R.h / 2;
        c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo(x1 + 40, y1, x2 - 40, y2, x2, y2);
        c.strokeStyle = C.line2; c.lineWidth = 1.2; c.stroke();
        if (busy) {
          const u = ease(ph / 0.9), v = 1 - u;
          const bx = v * v * v * x1 + 3 * v * v * u * (x1 + 40) + 3 * v * u * u * (x2 - 40) + u * u * u * x2;
          const by = v * v * v * y1 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y2;
          dot(c, bx, by, 4.5, s.col, 12);
        }
      });
      // rule check
      const pulse = t < 7 ? 8 + 6 * Math.sin(t * 4) : 4;
      box(c, R.x, R.y, R.w, R.h, { stroke: C.amber, lw: 2, glow: pulse });
      text(c, "rule check", R.x + 14, R.y + 26, { size: 11, color: C.amber });
      text(c, "version ≥ 4", R.x + 14, R.y + 52, { size: 15, weight: 700, color: C.bright });
      arrow(c, R.x + R.w + 4, R.y + R.h / 2, 508, R.y + R.h / 2, C.line2);

      // fleet grid
      const cols = 8, rows = 6, s = 36, g = 8;
      const gx = 520, gy = 46;
      text(c, "the fleet", gx, 28, { size: 11, color: C.muted });
      const sweep = ease(span(t, 1.2, 6.6)) * (cols + 0.5);
      let behind = 0, scanned = 0;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const i = r * cols + k, x = gx + k * (s + g), y = gy + r * (s + g);
        const bad = rnd(i) < 0.3, seen = k + 1 <= sweep, fade = clamp(sweep - k, 0, 1);
        if (seen) { scanned++; if (bad) behind++; }
        const col = !seen ? C.line2 : bad ? C.amber : C.green;
        box(c, x, y, s, s, { stroke: col, r: 5, lw: seen ? 1.7 : 1.1, glow: seen && bad ? 7 * fade : 0 });
        if (seen && bad) text(c, "v3", x + s / 2, y + s / 2 + 5, { size: 12, weight: 700, color: C.amber, align: "center", alpha: fade });
        else if (seen) { c.globalAlpha = fade; check(c, x + s / 2, y + s / 2, 7, C.green); c.globalAlpha = 1; }
      }
      if (sweep > 0 && sweep < cols + 0.4) {
        const bx = gx + sweep * (s + g) - g / 2;
        c.beginPath(); c.moveTo(bx, gy - 8); c.lineTo(bx, gy + rows * (s + g) - 2);
        c.strokeStyle = C.blue; c.lineWidth = 2; c.shadowColor = C.blue; c.shadowBlur = 12; c.stroke(); c.shadowBlur = 0;
      }
      const by = gy + rows * (s + g) + 30;
      text(c, "scanned " + scanned + " / " + rows * cols, gx, by, { size: 12.5, color: C.muted });
      text(c, behind + " behind → findings", gx + cols * (s + g) - g, by, { size: 12.5, weight: 700, color: C.amber, align: "right" });
      text(c, "the policy picks the sources: appliesTo for scope, observed.mode for facts", 20, 404, { size: 12, color: C.muted, sans: true });
    },
  };

  // ---------- 3. fix: agent + playbook → PR
  const fix = {
    W: 900, H: 360, period: 10000, still: 0.9,
    draw(c, p) {
      const t = p * 10; // seconds
      const books = ["upgrade-framework", "bump-library", "fix-config", "patch-cve", "rename-api"];
      const pick = 0;
      const bw = 140, bg = 12, bx0 = (900 - (books.length * bw + (books.length - 1) * bg)) / 2, by = 22;
      text(c, "playbook library", bx0, by - 6, { size: 11, color: C.muted });

      // shelf scan highlight 1.2s → 2.6s, lands on `pick`
      const hiF = t < 1.2 ? -1 : t < 2.4 ? Math.floor(span(t, 1.2, 2.4) * books.length * 1.6) % books.length : pick;
      books.forEach((b, i) => {
        const x = bx0 + i * (bw + bg);
        const on = i === hiF;
        const chosen = i === pick && t >= 2.4;
        box(c, x, by, bw, 34, { stroke: chosen ? C.green : on ? C.blue : C.line2, fill: C.bg, r: 5, glow: chosen ? 10 : 0 });
        text(c, b, x + bw / 2, by + 22, { size: 11, color: chosen ? C.green : on ? C.bright : C.muted, align: "center" });
      });

      // nodes
      const F = { x: 30, y: 140, w: 210, h: 70 }, A = { x: 345, y: 140, w: 210, h: 70 }, P = { x: 660, y: 140, w: 210, h: 70 };
      box(c, F.x, F.y, F.w, F.h, { stroke: C.amber });
      text(c, "finding", F.x + 14, F.y + 24, { size: 11, color: C.amber });
      text(c, "svc-17 is on v3", F.x + 14, F.y + 48, { size: 14, weight: 700, color: C.bright });

      const working = t > 1 && t < 7;
      const pulse = working ? 10 + 8 * Math.sin(t * 5) : 0;
      box(c, A.x, A.y, A.w, A.h, { stroke: C.green, lw: 2, glow: pulse });
      text(c, "agent", A.x + 14, A.y + 24, { size: 11, color: C.green });
      pill(c, "AI", A.x + A.w - 40, A.y + 10, C.green);
      text(c, t < 1.2 ? "waiting…" : t < 2.6 ? "which playbook?" : t < 3.6 ? "reading it" : t < 6.6 ? "editing code" : "done", A.x + 14, A.y + 48, { size: 14, weight: 700, color: C.bright });

      const prOn = span(t, 7.2, 7.8);
      c.globalAlpha = 0.25 + 0.75 * prOn;
      box(c, P.x, P.y, P.w, P.h, { stroke: prOn > 0 ? C.blue : C.line2, glow: prOn * 10 });
      text(c, "pull request", P.x + 14, P.y + 24, { size: 11, color: C.blue });
      text(c, prOn > 0 ? "#128 · in review" : "", P.x + 14, P.y + 48, { size: 14, weight: 700, color: C.bright });
      c.globalAlpha = 1;

      arrow(c, F.x + F.w + 6, F.y + 35, A.x - 8, A.y + 35, C.line2);
      arrow(c, A.x + A.w + 6, A.y + 35, P.x - 8, P.y + 35, C.line2);
      // packet: finding → agent
      if (t < 1.2) { const u = ease(span(t, 0, 1.2)); dot(c, lerp(F.x + F.w, A.x, u), F.y + 35, 5, C.amber, 14); }
      // playbook drop
      if (t >= 2.6 && t < 3.6) {
        const u = ease(span(t, 2.6, 3.6));
        const x0 = bx0 + pick * (bw + bg) + bw / 2;
        const x = lerp(x0, A.x + A.w / 2, u), y = lerp(by + 34, A.y, u);
        box(c, x - 46, y - 8, 92, 18, { stroke: C.green, fill: C.bg, r: 4, glow: 12 });
        text(c, "SKILL.md", x, y + 5, { size: 10, color: C.green, align: "center" });
      }
      // packet: agent → PR
      if (t >= 6.6 && t < 7.4) { const u = ease(span(t, 6.6, 7.4)); dot(c, lerp(A.x + A.w, P.x, u), A.y + 35, 5, C.blue, 14); }

      // diff panel
      const D = { x: 300, y: 236, w: 300, h: 108 };
      box(c, D.x, D.y, D.w, D.h, { stroke: C.line2, r: 6 });
      const lines = [
        ["- framework 3.9", C.red, 3.8],
        ["+ framework 4.2", C.green, 4.3],
        ["~ renamed 3 config keys", C.amber, 4.9],
        ["✓ build   ✓ tests", C.green, 5.7],
      ];
      lines.forEach(([s, col, at], i) => {
        const u = span(t, at, at + 0.5);
        if (u <= 0) return;
        const n = Math.ceil(s.length * u);
        text(c, s.slice(0, n), D.x + 16, D.y + 26 + i * 22, { size: 13, color: col });
      });

      // step caption
      const steps = ["1 · ask which playbook fits", "2 · fetch only that one", "3 · edit and self-check", "4 · open a pull request"];
      const si = t < 2.6 ? 0 : t < 3.6 ? 1 : t < 6.6 ? 2 : 3;
      text(c, steps[si], 30, 330, { size: 13, weight: 700, color: C.bright });
    },
  };

  // ---------- 3b. under the hood: skill server (MCP), agent platform, ephemeral env
  const platform = {
    W: 900, H: 430, period: 12000, still: 0.95,
    draw(c, p) {
      const t = p * 12;
      const O = { x: 16, y: 180, w: 176, h: 76 };
      const G = { x: 222, y: 24, w: 440, h: 392 };
      const T = { x: 240, y: 84, w: 404, h: 314 };
      const M = { x: 704, y: 24, w: 180, h: 120 };
      const P = { x: 704, y: 168, w: 180, h: 84 };
      const E = { x: 704, y: 276, w: 180, h: 140 };

      // agent platform group
      rr(c, G.x, G.y, G.w, G.h, 12); c.fillStyle = "rgba(126,231,135,0.04)"; c.fill();
      c.setLineDash([5, 5]); c.strokeStyle = C.line2; c.lineWidth = 1.2; c.stroke(); c.setLineDash([]);
      text(c, "agent platform", G.x + 18, G.y + 26, { size: 13, weight: 700, color: C.bright });
      text(c, "one isolated, headless Claude session per run", G.x + 18, G.y + 46, { size: 11.5, color: C.muted, sans: true });

      // terminal
      const busy = t > 0.8 && t < 10.2;
      box(c, T.x, T.y, T.w, T.h, { stroke: busy ? C.green : C.line2, glow: busy ? 6 + 4 * Math.sin(t * 4) : 0, r: 8 });
      dot(c, T.x + 16, T.y + 16, 4, "#3a4a45"); dot(c, T.x + 30, T.y + 16, 4, "#3a4a45"); dot(c, T.x + 44, T.y + 16, 4, "#3a4a45");
      text(c, "claude -p  · headless", T.x + 62, T.y + 20, { size: 11, color: C.muted });
      pill(c, "AI", T.x + T.w - 40, T.y + 8, C.green);
      const lines = [
        ["→ resolve_skill(policy, observed)", C.blue, 1.0],
        ["← upgrade-framework  + graders", C.fg, 2.4],
        ["→ fetch_skill(upgrade-framework)", C.blue, 2.8],
        ["← SKILL.md + helper scripts", C.fg, 4.0],
        ["✎ follow the playbook · 4 files", C.amber, 4.6],
        ["✓ build   ✓ unit tests", C.green, 5.6],
        ["→ open PR #128", C.blue, 6.6],
        ["→ validate in an ephemeral env", C.blue, 7.6],
        ["✓ checks passed · env torn down", C.green, 9.8],
      ];
      lines.forEach(([s, col, at], i) => {
        const u = span(t, at, at + 0.45);
        if (u <= 0) return;
        text(c, s.slice(0, Math.ceil(s.length * u)), T.x + 18, T.y + 56 + i * 29, { size: 13, color: col });
      });

      // orchestrator
      const doneO = t > 10.8;
      box(c, O.x, O.y, O.w, O.h, { stroke: doneO ? C.green : C.amber, glow: doneO ? 10 : 0 });
      text(c, "orchestrator", O.x + 14, O.y + 24, { size: 11, color: doneO ? C.green : C.amber });
      text(c, doneO ? "PR validated" : "start a run", O.x + 14, O.y + 50, { size: 14, weight: 700, color: C.bright });
      arrow(c, O.x + O.w + 4, O.y + 30, T.x - 6, O.y + 30, C.line2);
      arrow(c, T.x - 6, O.y + 50, O.x + O.w + 4, O.y + 50, C.line2, true);

      // skill server (MCP)
      const mOn = (t > 1.0 && t < 2.4) || (t > 2.8 && t < 4.0);
      box(c, M.x, M.y, M.w, M.h, { stroke: mOn ? C.blue : C.line2, glow: mOn ? 10 : 0 });
      text(c, "skill server · MCP", M.x + 12, M.y + 22, { size: 11.5, weight: 700, color: C.blue });
      ["upgrade-framework", "bump-library", "patch-cve"].forEach((k, i) => {
        const hi = i === 0 && t > 2.2;
        text(c, (hi ? "▸ " : "  ") + k, M.x + 12, M.y + 50 + i * 22, { size: 12, color: hi ? C.green : C.muted });
      });

      // pull request
      const prOn = t > 7.2;
      box(c, P.x, P.y, P.w, P.h, { stroke: prOn ? C.blue : C.line2, glow: prOn ? 8 : 0 });
      text(c, "git host", P.x + 12, P.y + 22, { size: 11.5, weight: 700, color: C.blue });
      text(c, prOn ? "PR #128 opened" : "—", P.x + 12, P.y + 52, { size: 13.5, weight: 700, color: prOn ? C.bright : C.muted });

      // ephemeral env
      const eState = t < 8.2 ? "idle" : t < 8.9 ? "spinning up…" : t < 9.6 ? "running checks…" : t < 10.4 ? "passed ✓" : "torn down";
      const eOn = t > 8.2 && t < 10.4;
      box(c, E.x, E.y, E.w, E.h, { stroke: eOn ? C.amber : C.line2, glow: eOn ? 10 : 0 });
      text(c, "ephemeral env", E.x + 12, E.y + 22, { size: 11.5, weight: 700, color: C.amber });
      text(c, "deploy the PR branch,", E.x + 12, E.y + 46, { size: 11.5, color: C.muted, sans: true });
      text(c, "test it, throw it away", E.x + 12, E.y + 64, { size: 11.5, color: C.muted, sans: true });
      text(c, eState, E.x + 12, E.y + 104, { size: 13.5, weight: 700, color: eState === "passed ✓" ? C.green : eOn ? C.bright : C.muted });

      // connectors terminal ↔ right-hand systems
      const tx = T.x + T.w;
      [[M, 0], [P, 1], [E, 2]].forEach(([n]) => arrow(c, tx + 4, n.y + n.h / 2, n.x - 6, n.y + n.h / 2, C.line2));
      const mv = (a, b, x1, x2, y, col) => { if (t >= a && t < b) dot(c, lerp(x1, x2, ease(span(t, a, b))), y, 5, col, 14); };
      mv(0.1, 0.8, O.x + O.w, T.x, O.y + 30, C.amber);
      mv(1.0, 1.6, tx, M.x, M.y + M.h / 2, C.blue); mv(1.8, 2.4, M.x, tx, M.y + M.h / 2, C.green);
      mv(2.8, 3.4, tx, M.x, M.y + M.h / 2, C.blue); mv(3.4, 4.0, M.x, tx, M.y + M.h / 2, C.green);
      mv(6.6, 7.2, tx, P.x, P.y + P.h / 2, C.blue);
      mv(7.6, 8.2, tx, E.x, E.y + E.h / 2, C.amber);
      mv(10.2, 10.8, T.x, O.x + O.w, O.y + 50, C.green);
    },
  };

  // ---------- 4. done: only a merge counts
  const done = {
    W: 900, H: 280, period: 8000, still: 0.95,
    draw(c, p) {
      const t = p * 8;
      const xs = [110, 330, 550, 770], y = 70;
      const labels = [["PR opened", "by the agent"], ["checks pass", "build + tests"], ["owner approves", "a human"], ["merged", "the only proof"]];
      const prog = ease(span(t, 0.4, 5.2)) * 3; // 0..3
      c.beginPath(); c.moveTo(xs[0], y); c.lineTo(xs[3], y); c.strokeStyle = C.line2; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.moveTo(xs[0], y); c.lineTo(lerp(xs[0], xs[3], prog / 3), y);
      c.strokeStyle = C.green; c.lineWidth = 3; c.shadowColor = C.green; c.shadowBlur = 10; c.stroke(); c.shadowBlur = 0;
      xs.forEach((x, i) => {
        const reached = prog >= i - 0.001;
        c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2);
        c.fillStyle = C.bg; c.fill();
        c.lineWidth = 2; c.strokeStyle = reached ? (i === 2 ? C.amber : C.green) : C.line2; c.stroke();
        if (reached) check(c, x, y, 6, i === 2 ? C.amber : C.green);
        text(c, labels[i][0], x, y + 44, { size: 13, weight: 700, color: reached ? C.bright : C.muted, align: "center" });
        text(c, labels[i][1], x, y + 64, { size: 11.5, color: C.muted, align: "center", sans: true });
      });

      // finding card flips at the end
      const flip = span(t, 5.6, 6.2);
      const fx = 300, fy = 180, fw = 300, fh = 64;
      const col = flip > 0.5 ? C.green : C.amber;
      box(c, fx, fy, fw, fh, { stroke: col, glow: flip > 0.5 ? 14 : 0 });
      text(c, "svc-17 · framework upgrade", fx + 16, fy + 26, { size: 12, color: C.muted });
      text(c, flip > 0.5 ? "FIXED by PR #128" : "OPEN", fx + 16, fy + 48, { size: 15, weight: 700, color: col });
      if (flip > 0 && flip < 1) {
        c.globalAlpha = 1 - Math.abs(flip - 0.5) * 2;
        rr(c, fx, fy, fw, fh, 8); c.fillStyle = C.green; c.globalAlpha *= 0.25; c.fill(); c.globalAlpha = 1;
      }
    },
  };

  // ---------- 5. the whole architecture, three journeys on one map
  function along(pts, f) {
    let L = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let d = L * f;
    for (let i = 1; i < pts.length; i++) {
      if (d <= seg[i - 1]) { const u = seg[i - 1] ? d / seg[i - 1] : 0; return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; }
      d -= seg[i - 1];
    }
    return pts[pts.length - 1];
  }
  const arch = {
    W: 1000, H: 600, period: 15000, still: 0.2,
    draw(c, p) {
      const PH = [
        { k: "detect", t: "1 · find what's behind", col: C.blue },
        { k: "fix", t: "2 · fix it with an agent", col: C.green },
        { k: "close", t: "3 · merge closes the finding", col: C.amber },
      ];
      const pi = Math.floor(p * 3) % 3, pu = (p * 3) % 1, ph = PH[pi];

      const N = {
        policies: { x: 20, y: 70, w: 180, h: 66, t: "policies", s: "documents in MongoDB", ph: ["detect"] },
        sched: { x: 20, y: 160, w: 180, h: 60, t: "scheduler", s: "every few hours", ph: ["detect"] },
        owner: { x: 20, y: 500, w: 180, h: 66, t: "service owner", s: "reviews + merges", ph: ["close"], human: true },
        gha: { x: 540, y: 70, w: 210, h: 76, t: "GitHub Actions", s: "sh · python · API · headless agent", ph: ["detect"] },
        data: { x: 540, y: 168, w: 210, h: 66, t: "inventory · lake · SBOMs", s: "facts already collected", ph: ["detect"] },
        content: { x: 800, y: 70, w: 180, h: 76, t: "content repo", s: "detectors + skills", ph: ["detect", "fix"] },
        fleet: { x: 800, y: 168, w: 180, h: 66, t: "service repos", s: "cloned read-only", ph: ["detect"] },
        agent: { x: 540, y: 280, w: 210, h: 76, t: "agent platform", s: "headless Claude session", ph: ["fix"], ai: true },
        mcp: { x: 800, y: 280, w: 180, h: 76, t: "skill server", s: "MCP · resolve + fetch", ph: ["fix"] },
        env: { x: 800, y: 390, w: 180, h: 70, t: "ephemeral env", s: "deploy, test, tear down", ph: ["fix"] },
        git: { x: 540, y: 500, w: 210, h: 66, t: "git host", s: "pull requests", ph: ["fix", "close"] },
      };
      const O = { x: 250, y: 70, w: 236, h: 400 };
      const E = [
        // detect
        { ph: "detect", o: 0, pts: [[200, 190], [250, 190]] },
        { ph: "detect", o: 0, pts: [[200, 103], [250, 103]] },
        { ph: "detect", o: 1, pts: [[486, 100], [540, 100]], l: "dispatch" },
        { ph: "detect", o: 2, pts: [[800, 100], [750, 100]], l: "detector" },
        { ph: "detect", o: 3, pts: [[750, 128], [775, 128], [775, 200], [800, 200]] },
        { ph: "detect", o: 4, pts: [[540, 128], [486, 128]], l: "callback", d: true },
        { ph: "detect", o: 4, pts: [[540, 200], [486, 200]], l: "facts" },
        // fix
        { ph: "fix", o: 0, pts: [[486, 312], [540, 312]], l: "run" },
        { ph: "fix", o: 1, pts: [[750, 300], [800, 300]], l: "skill" },
        { ph: "fix", o: 1, pts: [[980, 100], [993, 100], [993, 318], [980, 318]], l: "sync" },
        { ph: "fix", o: 2, pts: [[645, 356], [645, 500]], l: "open PR" },
        { ph: "fix", o: 3, pts: [[750, 340], [775, 340], [775, 425], [800, 425]], l: "validate" },
        { ph: "fix", o: 4, pts: [[540, 340], [486, 340]], l: "status", d: true },
        // close
        { ph: "close", o: 0, pts: [[200, 533], [540, 533]], l: "review + merge" },
        { ph: "close", o: 1, pts: [[560, 500], [560, 485], [440, 485], [440, 470]], l: "close sweep" },
      ];

      // edges
      const order = {};
      E.forEach((e) => { order[e.ph] = Math.max(order[e.ph] || 0, e.o + 1); });
      E.forEach((e) => {
        const on = e.ph === ph.k;
        const col = on ? ph.col : C.line2;
        c.globalAlpha = on ? 1 : 0.55;
        c.beginPath(); e.pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
        c.strokeStyle = col; c.lineWidth = on ? 2 : 1.2;
        if (e.d) c.setLineDash([4, 5]);
        c.stroke(); c.setLineDash([]);
        const a = e.pts[e.pts.length - 2], b = e.pts[e.pts.length - 1];
        const an = Math.atan2(b[1] - a[1], b[0] - a[0]);
        c.beginPath(); c.moveTo(b[0], b[1]);
        c.lineTo(b[0] - 7 * Math.cos(an - 0.45), b[1] - 7 * Math.sin(an - 0.45));
        c.lineTo(b[0] - 7 * Math.cos(an + 0.45), b[1] - 7 * Math.sin(an + 0.45));
        c.closePath(); c.fillStyle = col; c.fill();
        c.globalAlpha = 1;
        if (e.l && on) {
          const m = along(e.pts, 0.5);
          c.font = "500 10px " + MONO;
          const w = c.measureText(e.l).width + 10;
          const vertical = Math.abs(e.pts[0][0] - e.pts[e.pts.length - 1][0]) < 2;
          const lx = vertical ? m[0] + 8 : m[0] - w / 2, ly = vertical ? m[1] - 8 : m[1] - 20;
          rr(c, lx, ly, w, 15, 7); c.fillStyle = C.bg; c.fill();
          text(c, e.l, lx + w / 2, ly + 11, { size: 10, color: ph.col, align: "center" });
        }
        if (on) {
          const n = order[e.ph], a0 = e.o / n, a1 = (e.o + 1) / n;
          const u = span(pu, a0 * 0.9, a1 * 0.9);
          if (u > 0 && u < 1) { const q = along(e.pts, ease(u)); dot(c, q[0], q[1], 4.5, ph.col, 14); }
        }
      });

      // orchestrator
      const findingFixed = ph.k === "close" && pu > 0.75;
      rr(c, O.x, O.y, O.w, O.h, 12); c.fillStyle = "rgba(242,184,102,0.05)"; c.fill();
      c.lineWidth = 1.6; c.strokeStyle = C.amber; c.stroke();
      text(c, "orchestrator", O.x + 16, O.y + 26, { size: 14, weight: 700, color: C.bright });
      text(c, "the only system of record", O.x + 16, O.y + 46, { size: 11.5, color: C.muted, sans: true });
      const rows = [
        ["rules engine", "CEL checks", ["detect"]],
        ["findings", findingFixed ? "FIXED by PR" : ph.k === "detect" ? "OPEN" : "OPEN", ["detect", "close"]],
        ["remediation runs", "one at a time", ["fix"]],
        ["async workers", "queues → Kafka", ["detect", "fix", "close"]],
      ];
      rows.forEach(([a, b, phs], i) => {
        const y = O.y + 66 + i * 80, on = phs.includes(ph.k);
        const col = a === "findings" && findingFixed ? C.green : on ? ph.col : C.line2;
        box(c, O.x + 14, y, O.w - 28, 64, { stroke: col, glow: on && a !== "async workers" ? 6 : 0 });
        text(c, a, O.x + 28, y + 26, { size: 12.5, weight: 700, color: on ? C.bright : C.muted });
        text(c, b, O.x + 28, y + 46, { size: 12, color: a === "findings" ? (findingFixed ? C.green : C.amber) : C.muted });
      });

      // nodes
      Object.values(N).forEach((n) => {
        const on = n.ph.includes(ph.k);
        c.globalAlpha = on ? 1 : 0.5;
        box(c, n.x, n.y, n.w, n.h, { stroke: on ? ph.col : C.line2, glow: on ? 8 : 0 });
        text(c, n.t, n.x + 12, n.y + 25, { size: 13, weight: 700, color: C.bright });
        text(c, n.s, n.x + 12, n.y + 45, { size: 11.5, color: C.muted, sans: true });
        if (n.ai) pill(c, "AI", n.x + n.w - 36, n.y + 9, C.green);
        if (n.human) pill(c, "human", n.x + n.w - 58, n.y + 9, C.amber);
        c.globalAlpha = 1;
      });

      // phase tabs
      PH.forEach((q, i) => {
        const x = 20 + i * 250, on = i === pi;
        rr(c, x, 16, 236, 30, 15); c.fillStyle = on ? q.col : C.bg; c.fill();
        c.lineWidth = 1.2; c.strokeStyle = on ? q.col : C.line2; c.stroke();
        text(c, q.t, x + 118, 36, { size: 12, weight: 700, color: on ? C.bg : C.muted, align: "center" });
      });
      // progress bar inside the active tab
      rr(c, 20 + pi * 250 + 14, 42, 208 * pu, 2, 1); c.fillStyle = C.bg; c.fill();
    },
  };

  const DIAGRAMS = { loop, scan, fix, platform, done, arch };

  // ---------- stage plumbing
  function mount(canvas) {
    const d = DIAGRAMS[canvas.dataset.diagram];
    if (!d) return;
    const ctx = canvas.getContext("2d");
    const st = { visible: true, start: performance.now() };
    function size() {
      const w = Math.max(canvas.parentElement.clientWidth, +canvas.dataset.minw || 0);
      const dpr = window.devicePixelRatio || 1;
      st.k = w / d.W;
      canvas.style.width = w + "px";
      canvas.style.height = d.H * st.k + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(d.H * st.k * dpr);
      st.dpr = dpr;
      paint(performance.now());
    }
    function paint(now) {
      const k = st.k * st.dpr;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, d.W, d.H);
      const p = reduce ? d.still : ((now - st.start) % d.period) / d.period;
      d.draw(ctx, p);
    }
    new ResizeObserver(size).observe(canvas.parentElement);
    new IntersectionObserver((es) => { st.visible = es[0].isIntersecting; }).observe(canvas);
    size();
    if (reduce) return;
    (function tick(now) {
      if (st.visible) paint(now);
      requestAnimationFrame(tick);
    })(performance.now());
  }

  function init() {
    const go = () => document.querySelectorAll("canvas[data-diagram]").forEach(mount);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
