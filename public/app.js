/* Owl Weather — FAU-branded weather app powered by Open-Meteo (no API key required). */
(function () {
  "use strict";

  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const STORAGE_KEY = "owl-weather:v1";

  const CAMPUSES = [
    { name: "Boca Raton", label: "FAU Boca Raton Campus", region: "Florida", lat: 26.3728, lon: -80.1024 },
    { name: "Jupiter", label: "FAU Jupiter Campus", region: "Florida", lat: 26.8886, lon: -80.1107 },
    { name: "Davie", label: "FAU Davie Campus", region: "Florida", lat: 26.0806, lon: -80.2366 },
    { name: "Fort Lauderdale", label: "FAU Fort Lauderdale Campus", region: "Florida", lat: 26.1195, lon: -80.1432 },
    { name: "Dania Beach", label: "FAU SeaTech, Dania Beach", region: "Florida", lat: 26.0569, lon: -80.1111 },
    { name: "Harbor Branch", label: "FAU Harbor Branch, Fort Pierce", region: "Florida", lat: 27.5358, lon: -80.3598 },
  ];

  const DEFAULT_PLACE = { name: "Boca Raton", region: "Florida", lat: 26.3728, lon: -80.1024, campus: "Boca Raton" };

  // ---------- State ----------
  const saved = loadSaved();
  const state = {
    place: saved.place || DEFAULT_PLACE,
    unit: saved.unit === "celsius" ? "celsius" : "fahrenheit",
    requestId: 0,
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    status: $("status"),
    placeName: $("place-name"),
    placeTime: $("place-time"),
    currentIcon: $("current-icon"),
    currentTemp: $("current-temp"),
    currentDesc: $("current-desc"),
    feelsLike: $("feels-like"),
    todayHi: $("today-hi"),
    todayLo: $("today-lo"),
    humidity: $("stat-humidity"),
    wind: $("stat-wind"),
    gusts: $("stat-gusts"),
    uv: $("stat-uv"),
    rain: $("stat-rain"),
    sun: $("stat-sun"),
    hourly: $("hourly"),
    daily: $("daily"),
    form: $("search-form"),
    input: $("search-input"),
    results: $("search-results"),
    locate: $("locate-btn"),
    campusList: $("campus-list"),
  };

  // ---------- Weather codes (WMO) ----------
  const WEATHER = {
    0: ["Clear sky", "clear"],
    1: ["Mainly clear", "clear"],
    2: ["Partly cloudy", "partly"],
    3: ["Overcast", "cloudy"],
    45: ["Fog", "fog"],
    48: ["Depositing rime fog", "fog"],
    51: ["Light drizzle", "drizzle"],
    53: ["Drizzle", "drizzle"],
    55: ["Heavy drizzle", "drizzle"],
    56: ["Freezing drizzle", "drizzle"],
    57: ["Heavy freezing drizzle", "drizzle"],
    61: ["Light rain", "rain"],
    63: ["Rain", "rain"],
    65: ["Heavy rain", "rain"],
    66: ["Freezing rain", "rain"],
    67: ["Heavy freezing rain", "rain"],
    71: ["Light snow", "snow"],
    73: ["Snow", "snow"],
    75: ["Heavy snow", "snow"],
    77: ["Snow grains", "snow"],
    80: ["Light showers", "rain"],
    81: ["Showers", "rain"],
    82: ["Violent showers", "rain"],
    85: ["Snow showers", "snow"],
    86: ["Heavy snow showers", "snow"],
    95: ["Thunderstorm", "storm"],
    96: ["Thunderstorm with hail", "storm"],
    99: ["Severe thunderstorm with hail", "storm"],
  };

  function describe(code) {
    return WEATHER[code] || ["Unknown", "cloudy"];
  }

  // ---------- Icons (inline SVG, FAU palette) ----------
  const C = { sun: "#f5a623", moon: "#8fa9c7", cloud: "#b9c4d2", cloudDark: "#7f8b9b", rain: "#004a8f", bolt: "#cc0000", snow: "#7fb2e5" };
  const sunSvg = `<circle cx="32" cy="32" r="11" fill="${C.sun}"/><g stroke="${C.sun}" stroke-width="3.5" stroke-linecap="round"><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M15 49l5-5M44 20l5-5"/></g>`;
  const moonSvg = `<path d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z" fill="${C.moon}"/>`;
  const cloudPath = (fill, dy = 0) => `<path transform="translate(0 ${dy})" d="M20 50h26a11 11 0 0 0 1-22 15 15 0 0 0-28-3 12 12 0 0 0 1 25z" fill="${fill}"/>`;
  const smallSun = `<g transform="translate(-6 -8) scale(.75)">${sunSvg}</g>`;
  const smallMoon = `<g transform="translate(-4 -6) scale(.75)">${moonSvg}</g>`;
  const drops = (n) => {
    const xs = n === 2 ? [26, 38] : [22, 32, 42];
    return xs.map((x) => `<path d="M${x} 52l-3 8" stroke="${C.rain}" stroke-width="3.5" stroke-linecap="round"/>`).join("");
  };

  function iconSvg(kind, isDay) {
    const body = (() => {
      switch (kind) {
        case "clear": return isDay ? sunSvg : moonSvg;
        case "partly": return (isDay ? smallSun : smallMoon) + cloudPath(C.cloud, 4);
        case "cloudy": return cloudPath(C.cloudDark, -6) + cloudPath(C.cloud, 2);
        case "fog": return cloudPath(C.cloud, -8) + `<g stroke="${C.cloudDark}" stroke-width="3.5" stroke-linecap="round"><path d="M14 50h36M18 57h28"/></g>`;
        case "drizzle": return cloudPath(C.cloud, -8) + drops(2);
        case "rain": return cloudPath(C.cloudDark, -8) + drops(3);
        case "snow": return cloudPath(C.cloud, -8) + `<g fill="${C.snow}"><circle cx="22" cy="54" r="3"/><circle cx="32" cy="59" r="3"/><circle cx="42" cy="54" r="3"/></g>`;
        case "storm": return cloudPath(C.cloudDark, -8) + `<path d="M34 42l-8 12h7l-4 10 11-14h-7l4-8z" fill="${C.bolt}"/>`;
        default: return cloudPath(C.cloud, 0);
      }
    })();
    return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true">${body}</svg>`;
  }

  // ---------- Helpers ----------
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ place: state.place, unit: state.unit })); } catch (e) { /* ignore */ }
  }

  // Open-Meteo returns local wall-clock times ("2026-09-28T14:00") when timezone=auto.
  // Parse them as-is so display never shifts to the viewer's own time zone.
  function parseLocal(iso) {
    const [d, t = "00:00"] = iso.split("T");
    const [y, m, day] = d.split("-").map(Number);
    const [h, min] = t.split(":").map(Number);
    return { y, m, day, h, min, dow: new Date(Date.UTC(y, m - 1, day)).getUTCDay() };
  }
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtHour(iso) {
    const { h } = parseLocal(iso);
    return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
  }
  function fmtClock(iso) {
    const { h, min } = parseLocal(iso);
    return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  }
  function fmtDate(iso) {
    const p = parseLocal(iso);
    return `${DOW[p.dow]}, ${MON[p.m - 1]} ${p.day}`;
  }
  const round = (n) => (n == null || isNaN(n) ? "--" : Math.round(n));

  function compass(deg) {
    if (deg == null) return "";
    return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
  }
  function uvLabel(uv) {
    if (uv == null) return "--";
    const v = Math.round(uv);
    const level = uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme";
    return `${v} · ${level}`;
  }
  function placeLabel(p) {
    return [p.name, p.region].filter(Boolean).join(", ");
  }
  function setStatus(msg, kind) {
    els.status.textContent = msg || "";
    els.status.className = "status" + (kind ? " " + kind : "");
  }

  // ---------- Fetching ----------
  async function fetchForecast(place, unit) {
    const params = new URLSearchParams({
      latitude: place.lat,
      longitude: place.lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
      hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max",
      temperature_unit: unit,
      wind_speed_unit: unit === "fahrenheit" ? "mph" : "kmh",
      precipitation_unit: unit === "fahrenheit" ? "inch" : "mm",
      timezone: "auto",
      forecast_days: "7",
    });
    const res = await fetch(`${FORECAST_URL}?${params}`);
    if (!res.ok) throw new Error(`Forecast request failed (${res.status})`);
    return res.json();
  }

  async function geocode(query) {
    const params = new URLSearchParams({ name: query, count: "6", language: "en", format: "json" });
    const res = await fetch(`${GEOCODE_URL}?${params}`);
    if (!res.ok) throw new Error(`Search failed (${res.status})`);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      name: r.name,
      region: [r.admin1, r.country_code === "US" ? null : r.country].filter(Boolean).join(", "),
      lat: r.latitude,
      lon: r.longitude,
    }));
  }

  async function load() {
    const id = ++state.requestId;
    document.body.classList.add("loading");
    setStatus("");
    els.placeName.textContent = placeLabel(state.place);
    renderCampusChips();
    try {
      const data = await fetchForecast(state.place, state.unit);
      if (id !== state.requestId) return; // a newer request superseded this one
      render(data);
      save();
    } catch (err) {
      if (id !== state.requestId) return;
      console.error(err);
      setStatus("Couldn't load the weather right now. Check your connection and try again.");
      els.currentDesc.textContent = "Unavailable";
    } finally {
      if (id === state.requestId) document.body.classList.remove("loading");
    }
  }

  // ---------- Rendering ----------
  function render(data) {
    const cur = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const speedUnit = state.unit === "fahrenheit" ? "mph" : "km/h";
    const [desc, kind] = describe(cur.weather_code);

    const campus = state.place.campus && CAMPUSES.find((c) => c.name === state.place.campus);
    els.placeName.textContent = campus ? campus.label : placeLabel(state.place);
    els.placeTime.textContent = `${fmtDate(cur.time)} · ${fmtClock(cur.time)} local time`;
    els.currentIcon.innerHTML = iconSvg(kind, cur.is_day === 1);
    els.currentTemp.textContent = round(cur.temperature_2m);
    els.currentDesc.textContent = desc;
    els.feelsLike.textContent = round(cur.apparent_temperature);
    els.todayHi.textContent = round(daily.temperature_2m_max[0]);
    els.todayLo.textContent = round(daily.temperature_2m_min[0]);
    els.humidity.textContent = `${round(cur.relative_humidity_2m)}%`;
    els.wind.textContent = `${round(cur.wind_speed_10m)} ${speedUnit} ${compass(cur.wind_direction_10m)}`.trim();
    els.gusts.textContent = `${round(cur.wind_gusts_10m)} ${speedUnit}`;
    els.uv.textContent = uvLabel(daily.uv_index_max[0]);
    els.rain.textContent = daily.precipitation_probability_max[0] == null ? "--" : `${daily.precipitation_probability_max[0]}%`;
    els.sun.textContent = `${fmtClock(daily.sunrise[0])} / ${fmtClock(daily.sunset[0])}`;

    renderHourly(hourly, cur.time);
    renderDaily(daily);
  }

  function renderHourly(hourly, nowIso) {
    const nowHour = nowIso.slice(0, 13); // "YYYY-MM-DDTHH"
    let start = hourly.time.findIndex((t) => t.slice(0, 13) >= nowHour);
    if (start < 0) start = 0;
    const frag = document.createDocumentFragment();
    for (let i = start; i < Math.min(start + 24, hourly.time.length); i++) {
      const [desc, kind] = describe(hourly.weather_code[i]);
      const pop = hourly.precipitation_probability[i];
      const div = document.createElement("div");
      div.className = "hour" + (i === start ? " now" : "");
      div.title = desc;
      div.innerHTML =
        `<span class="time">${i === start ? "Now" : fmtHour(hourly.time[i])}</span>` +
        iconSvg(kind, hourly.is_day[i] === 1) +
        `<span class="t">${round(hourly.temperature_2m[i])}°</span>` +
        `<span class="pop">${pop ? pop + "%" : ""}</span>`;
      frag.appendChild(div);
    }
    els.hourly.replaceChildren(frag);
    els.hourly.scrollLeft = 0;
  }

  function renderDaily(daily) {
    const lows = daily.temperature_2m_min;
    const highs = daily.temperature_2m_max;
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const span = Math.max(1, max - min);
    const frag = document.createDocumentFragment();
    daily.time.forEach((t, i) => {
      const [desc, kind] = describe(daily.weather_code[i]);
      const p = parseLocal(t);
      const left = ((lows[i] - min) / span) * 100;
      const width = Math.max(4, ((highs[i] - lows[i]) / span) * 100);
      const pop = daily.precipitation_probability_max[i];
      const li = document.createElement("li");
      li.className = "day";
      li.innerHTML =
        `<span class="name">${i === 0 ? "Today" : DOW[p.dow]}<small>${MON[p.m - 1]} ${p.day}</small></span>` +
        `<span title="${desc}">${iconSvg(kind, true)}</span>` +
        `<span class="range"><span class="lo">${round(lows[i])}°</span>` +
        `<span class="bar"><span></span></span>` +
        `<span class="hi">${round(highs[i])}°</span></span>` +
        `<span class="pop">${pop ? pop + "%" : ""}</span>`;
      // Set via CSSOM rather than a style attribute so the Netlify CSP allows it.
      const fill = li.querySelector(".bar span");
      fill.style.left = `${left}%`;
      fill.style.width = `${Math.min(width, 100 - left)}%`;
      li.setAttribute("aria-label", `${fmtDate(t)}: ${desc}, high ${round(highs[i])}, low ${round(lows[i])}` + (pop ? `, ${pop}% chance of rain` : ""));
      frag.appendChild(li);
    });
    els.daily.replaceChildren(frag);
  }

  function renderCampusChips() {
    const frag = document.createDocumentFragment();
    CAMPUSES.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state.place.campus === c.name ? " active" : "");
      b.textContent = c.name;
      b.setAttribute("aria-pressed", state.place.campus === c.name ? "true" : "false");
      b.addEventListener("click", () => selectPlace({ name: c.name, region: c.region, lat: c.lat, lon: c.lon, campus: c.name }));
      frag.appendChild(b);
    });
    els.campusList.replaceChildren(frag);
  }

  function selectPlace(place) {
    state.place = place;
    hideResults();
    els.input.value = "";
    load();
  }

  // ---------- Search ----------
  let results = [];
  let activeIndex = -1;
  let searchTimer = null;
  let searchSeq = 0;

  function hideResults() {
    els.results.hidden = true;
    els.results.replaceChildren();
    results = [];
    activeIndex = -1;
  }

  function showResults(list) {
    results = list;
    activeIndex = -1;
    const frag = document.createDocumentFragment();
    if (!list.length) {
      const li = document.createElement("li");
      li.textContent = "No matching places found.";
      li.setAttribute("aria-disabled", "true");
      frag.appendChild(li);
    }
    list.forEach((r, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = `result-${i}`;
      const name = document.createElement("div");
      name.textContent = r.name;
      const sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = r.region;
      li.append(name, sub);
      li.addEventListener("mousedown", (e) => { e.preventDefault(); selectPlace(r); });
      frag.appendChild(li);
    });
    els.results.replaceChildren(frag);
    els.results.hidden = false;
  }

  async function runSearch(query) {
    const q = query.trim();
    if (q.length < 2) { hideResults(); return; }
    const seq = ++searchSeq;
    try {
      const list = await geocode(q);
      if (seq === searchSeq) showResults(list);
    } catch (err) {
      console.error(err);
      if (seq === searchSeq) setStatus("City search is unavailable right now.");
    }
  }

  function highlight(i) {
    const items = els.results.querySelectorAll('[role="option"]');
    items.forEach((el, idx) => el.setAttribute("aria-selected", idx === i ? "true" : "false"));
    activeIndex = i;
    if (items[i]) items[i].scrollIntoView({ block: "nearest" });
  }

  els.input.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(els.input.value), 300);
  });
  els.input.addEventListener("keydown", (e) => {
    if (els.results.hidden || !results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); highlight((activeIndex + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); highlight((activeIndex - 1 + results.length) % results.length); }
    else if (e.key === "Escape") hideResults();
  });
  els.input.addEventListener("blur", () => setTimeout(hideResults, 150));
  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) { selectPlace(results[activeIndex]); return; }
    const q = els.input.value.trim();
    if (!q) return;
    clearTimeout(searchTimer);
    try {
      const list = await geocode(q);
      if (list.length) selectPlace(list[0]);
      else setStatus(`No place called “${q}” was found.`, "info");
    } catch (err) {
      console.error(err);
      setStatus("City search is unavailable right now.");
    }
  });

  // ---------- Geolocation ----------
  els.locate.addEventListener("click", () => {
    if (!navigator.geolocation) { setStatus("Your browser doesn't support location.", "info"); return; }
    setStatus("Finding your location…", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => selectPlace({ name: "My location", region: "", lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4) }),
      () => setStatus("Location access was denied. Showing the last selected place.", "info"),
      { timeout: 10000, maximumAge: 600000 }
    );
  });

  // ---------- Units ----------
  const unitButtons = document.querySelectorAll(".unit-toggle button");
  function syncUnitButtons() {
    unitButtons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.unit === state.unit ? "true" : "false"));
  }
  unitButtons.forEach((b) =>
    b.addEventListener("click", () => {
      if (state.unit === b.dataset.unit) return;
      state.unit = b.dataset.unit;
      syncUnitButtons();
      load();
    })
  );

  // ---------- Logo fallback ----------
  // The official owl logo is fetched at Netlify build time; fall back to the bundled mark if it's missing.
  const logo = $("brand-logo");
  const useFallbackLogo = () => { if (!logo.src.endsWith("fau-mark.svg")) logo.src = "assets/fau-mark.svg"; };
  logo.addEventListener("error", useFallbackLogo);
  if (logo.complete && logo.naturalWidth === 0) useFallbackLogo();

  // ---------- Boot ----------
  syncUnitButtons();
  load();
  // Refresh every 15 minutes while the tab is open.
  setInterval(() => { if (!document.hidden) load(); }, 15 * 60 * 1000);
})();
