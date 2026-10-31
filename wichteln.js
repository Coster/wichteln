// Reine Logik ohne DOM: Auslosung und Los-Kodierung. Läuft im Browser
// (globales Wichteln) und unter Node (require) für die Tests.
(function (root) {
  "use strict";

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Lost n Personen aus. forbidden: Array von [geber, empfaenger]-Indizes,
   * die nicht vorkommen dürfen (niemand zieht sich selbst - immer).
   * @returns {number[]|null} result[geber] = empfaenger, null wenn unmöglich
   */
  function draw(n, forbidden, rand) {
    rand = rand || Math.random;
    const no = new Set((forbidden || []).map(([a, b]) => a + ">" + b));
    for (let i = 0; i < n; i++) no.add(i + ">" + i);
    const order = shuffle([...Array(n).keys()], rand);
    const used = new Array(n).fill(false);
    const res = new Array(n);
    let steps = 0;
    function bt(k) {
      if (k === n) return true;
      if (++steps > 200000) return false;
      const g = order[k];
      for (const r of shuffle([...Array(n).keys()], rand)) {
        if (used[r] || no.has(g + ">" + r)) continue;
        used[r] = true; res[g] = r;
        if (bt(k + 1)) return true;
        used[r] = false;
      }
      return false;
    }
    return n >= 2 && bt(0) ? res : null;
  }

  // --- Los im Link -----------------------------------------------------------
  // Das Los steht im Teil hinter "#", der nie an einen Server geht. Es ist
  // nur verschleiert (XOR mit zufälligem Salz), damit es beim Weiterleiten
  // nicht lesbar ist - keine echte Verschlüsselung: wer den Link hat, hat das Los.

  function keystream(salt, len) {
    let x = (salt[0] << 24 | salt[1] << 16 | salt[2] << 8 | salt[3]) >>> 0 || 0x9e3779b9;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
      out[i] = x & 0xff;
    }
    return out;
  }

  function toB64url(bytes) {
    let s = "";
    bytes.forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function fromB64url(str) {
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  }

  function encodeTicket(ticket, rand) {
    rand = rand || Math.random;
    const data = new TextEncoder().encode(JSON.stringify(ticket));
    const salt = Uint8Array.from({ length: 4 }, () => Math.floor(rand() * 256));
    const ks = keystream(salt, data.length);
    const out = new Uint8Array(4 + data.length);
    out.set(salt);
    data.forEach((b, i) => { out[4 + i] = b ^ ks[i]; });
    return "1" + toB64url(out);
  }

  /** @returns {object|null} null bei kaputtem oder unbekanntem Los */
  function decodeTicket(code) {
    try {
      if (!code || code[0] !== "1") return null;
      const raw = fromB64url(code.slice(1));
      if (raw.length < 5) return null;
      const ks = keystream(raw.subarray(0, 4), raw.length - 4);
      const data = raw.subarray(4).map((b, i) => b ^ ks[i]);
      const t = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data));
      return t && typeof t.von === "string" && typeof t.fuer === "string" ? t : null;
    } catch (e) {
      return null;
    }
  }

  /** Namen bereinigen und prüfen. @returns {string|null} Fehlermeldung */
  function checkNames(names) {
    const clean = names.map((n) => n.trim());
    if (clean.some((n) => !n)) return "Bitte alle Namen ausfüllen oder leere Zeilen entfernen.";
    if (clean.length < 3) return "Zum Wichteln braucht ihr mindestens 3 Personen.";
    const seen = new Set();
    for (const n of clean) {
      const k = n.toLocaleLowerCase("de");
      if (seen.has(k)) return `„${n}“ steht doppelt in der Liste.`;
      seen.add(k);
    }
    return null;
  }

  const api = { draw, encodeTicket, decodeTicket, checkNames };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Wichteln = api;
})(this);
