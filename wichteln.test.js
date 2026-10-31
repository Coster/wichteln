const { test } = require("node:test");
const assert = require("node:assert/strict");
const { draw, encodeTicket, decodeTicket, checkNames } = require("./wichteln.js");

function valid(res, n, forbidden) {
  assert.ok(res, "Auslosung sollte möglich sein");
  assert.equal(new Set(res).size, n, "jede Person wird genau einmal gezogen");
  res.forEach((r, g) => {
    assert.notEqual(r, g, "niemand zieht sich selbst");
    assert.ok(!forbidden.some(([a, b]) => a === g && b === r), `Ausschluss ${g}>${r} verletzt`);
  });
}

test("draw: gültig für viele Gruppengrößen und Zufälle", () => {
  for (let n = 2; n <= 25; n++) {
    for (let k = 0; k < 20; k++) valid(draw(n, []), n, []);
  }
});

test("draw: beachtet gegenseitige Ausschlüsse (Paare)", () => {
  const forbidden = [[0, 1], [1, 0], [2, 3], [3, 2], [4, 5], [5, 4]];
  for (let k = 0; k < 200; k++) valid(draw(6, forbidden), 6, forbidden);
});

test("draw: null, wenn Ausschlüsse keine Lösung zulassen", () => {
  assert.equal(draw(3, [[0, 1], [0, 2]]), null);
  assert.equal(draw(1, []), null);
});

test("draw: alle Paarungen kommen vor (kein fester Ablauf)", () => {
  const seen = new Set();
  for (let k = 0; k < 500; k++) draw(4, []).forEach((r, g) => seen.add(g + ">" + r));
  assert.equal(seen.size, 12);
});

test("Los: Hin- und Rückweg inkl. Umlaute und Emoji", () => {
  const t = { v: 1, g: "Familie Müller 🎄", von: "Jürgen", fuer: "Anna-Lena", w: "Bücher", b: "25 €", d: "2026-12-24" };
  const code = encodeTicket(t);
  assert.match(code, /^1[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeTicket(code), t);
});

test("Los: Namen stehen nicht lesbar im Link", () => {
  const code = encodeTicket({ v: 1, von: "Jürgen", fuer: "Annabelle" });
  const plain = Buffer.from(code.slice(1).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("latin1");
  assert.ok(!plain.includes("Annabelle") && !code.includes("Annabelle"));
});

test("Los: kaputte oder fremde Codes ergeben null", () => {
  for (const c of ["", "2abc", "1", "1!!!", "1AAAAAAAA", encodeTicket({ v: 1, von: "a" })]) {
    assert.equal(decodeTicket(c), null, c);
  }
  const ok = encodeTicket({ v: 1, von: "a", fuer: "b" });
  assert.equal(decodeTicket(ok.slice(0, -3)), null);
});

test("checkNames: leer, zu wenige, doppelt", () => {
  assert.match(checkNames(["a", " ", "c"]), /ausfüllen/);
  assert.match(checkNames(["a", "b"]), /mindestens 3/);
  assert.match(checkNames(["Anna", "Bernd", "anna "]), /doppelt/);
  assert.equal(checkNames(["Anna", "Bernd", "Cleo"]), null);
});
