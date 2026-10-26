// Security regression test (OWASP Top 10 checks). Run: node tests/security.test.js  (needs Playwright + Chromium).
// Serves public/ with netlify.toml's headers, mocks Open-Meteo, and probes for XSS / CSP problems.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..", "public");
const toml = fs.readFileSync(path.join(__dirname, "..", "netlify.toml"), "utf8");
const headers = {};
const block = toml.split('for = "/*"')[1].split("[[headers]]")[0];
for (const m of block.matchAll(/^\s*([A-Za-z-]+) = "(.*)"$/gm)) headers[m[1]] = m[2];

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404, headers); return res.end(); }
  res.writeHead(200, { ...headers, "Content-Type": types[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});

const XSS = '<img src=x onerror="window.__pwned=1">';
function forecast(evil) {
  const hours = Array.from({ length: 48 }, (_, i) => `2026-10-26T${String(i % 24).padStart(2, "0")}:00`);
  const days = Array.from({ length: 7 }, (_, i) => `2026-10-${26 + i}`);
  return {
    current: { time: "2026-10-26T14:00", temperature_2m: 84, relative_humidity_2m: 70, apparent_temperature: 90, is_day: 1, weather_code: 2, wind_speed_10m: 10, wind_direction_10m: 90, wind_gusts_10m: 20 },
    hourly: { time: hours, temperature_2m: hours.map(() => 80), precipitation_probability: hours.map(() => (evil ? XSS : 30)), weather_code: hours.map(() => 61), is_day: hours.map(() => 1) },
    daily: { time: days, weather_code: days.map(() => 3), temperature_2m_max: days.map(() => 88), temperature_2m_min: days.map(() => 74), precipitation_probability_max: days.map(() => (evil ? XSS : 40)), sunrise: days.map((d) => d + "T07:20"), sunset: days.map((d) => d + "T18:40"), uv_index_max: days.map(() => 7) },
  };
}

(async () => {
  await new Promise((r) => server.listen(8099, r));
  const browser = await chromium.launch();
  let failures = 0;
  const check = (ok, msg) => { console.log((ok ? "PASS " : "FAIL ") + msg); if (!ok) failures++; };

  for (const scenario of ["normal", "malicious-api", "tampered-storage", "malformed-api"]) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const problems = [];
    page.on("console", (m) => { if (m.type() === "error" && !/malformed/.test(m.text()) && !/fau-owl\.png/.test(m.location().url)) problems.push(m.text()); });
    page.on("pageerror", (e) => problems.push(String(e)));
    const external = [];
    page.on("request", (r) => { const u = new URL(r.url()); if (u.hostname !== "localhost" && !u.hostname.endsWith("open-meteo.com")) external.push(r.url()); });
    let sentReferer = null;
    await page.route("https://api.open-meteo.com/**", (route) => {
      sentReferer = route.request().headers()["referer"] || null;
      const body = scenario === "malformed-api" ? { current: { time: "<script>" } } : forecast(scenario === "malicious-api");
      route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    });
    await page.route("https://geocoding-api.open-meteo.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ results: [{ name: XSS, admin1: XSS, country_code: "US", latitude: 40.7, longitude: -74 }, { name: "Bad", latitude: "x", longitude: 1 }] }) }));
    if (scenario === "tampered-storage") {
      await ctx.addInitScript((x) => {
        localStorage.setItem("owl-weather:v1", JSON.stringify({ place: { name: x, region: x, lat: "1e999", lon: 0, campus: x }, unit: x }));
        localStorage.setItem("owl-weather:theme", x);
      }, XSS);
    }
    await page.goto("http://localhost:8099/");
    await page.waitForTimeout(800);

    const pwned = await page.evaluate(() => window.__pwned === 1);
    const imgs = await page.evaluate(() => document.querySelectorAll("img").length);
    check(!pwned && imgs === 1, `[${scenario}] no injected script/markup ran (img count ${imgs})`);
    check(external.length === 0, `[${scenario}] no third-party requests ${external.join(" ")}`);
    check(sentReferer === null, `[${scenario}] no Referer sent to API`);

    if (scenario === "normal") {
      const temp = await page.textContent("#current-temp");
      const hours = await page.locator("#hourly .hour svg").count();
      const days = await page.locator("#daily .day").count();
      const pop = await page.textContent("#hourly .hour .pop");
      const font = await page.evaluate(() => document.fonts.check('800 16px "Roboto Slab"'));
      check(temp === "84" && hours === 24 && days === 7 && pop === "30%", `[normal] renders weather (temp ${temp}, ${hours} hours, ${days} days, pop ${pop})`);
      check(font, "[normal] self-hosted fonts load under CSP");
      // Search renders hostile geocoder names as text and drops the invalid entry.
      await page.fill("#search-input", "new");
      await page.waitForTimeout(700);
      const opts = await page.locator("#search-results [role=option]").allTextContents();
      check(opts.length === 1 && opts[0].includes("<img"), `[normal] geocoder results shown as text, invalid dropped (${opts.length})`);
      check(problems.length === 0, `[normal] app itself triggers no CSP/Trusted Types violations ${problems.join(" | ")}`);
      // Trusted Types enforcement: a raw innerHTML string must be blocked.
      const blocked = await page.evaluate(() => { try { document.body.insertAdjacentHTML("beforeend", "<b>x</b>"); return false; } catch (e) { return true; } });
      check(blocked, "[normal] Trusted Types blocks raw HTML injection");
    }
    if (scenario === "malicious-api") {
      const pop = await page.textContent("#hourly .hour .pop");
      check(pop === "", `[malicious-api] non-numeric values dropped (pop "${pop}")`);
    }
    if (scenario === "tampered-storage") {
      const name = await page.textContent("#place-name");
      const theme = await page.evaluate(() => document.documentElement.dataset.theme);
      check(name.includes("Boca Raton") && theme !== undefined && !theme.includes("<"), `[tampered-storage] falls back to defaults (place "${name}", theme ${theme})`);
    }
    if (scenario === "malformed-api") {
      const status = await page.textContent("#status");
      check(/Couldn't load/.test(status), "[malformed-api] malformed response rejected gracefully");
    }
    if (scenario !== "normal") check(problems.length === 0, `[${scenario}] no console errors / CSP violations ${problems.join(" | ")}`);
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log(failures ? `${failures} FAILED` : "ALL PASSED");
  process.exit(failures ? 1 : 0);
})();
