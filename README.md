# Owl Weather — ISM 4421

An FAU-branded weather app that defaults to the **Boca Raton campus**. Weather and city search come from the free [Open-Meteo](https://open-meteo.com/) APIs, which need no account or API key.

## Features
- Current conditions: temperature, feels-like, humidity, wind and gusts, UV index, rain chance, sunrise and sunset
- Hourly forecast for the next 24 hours and a 7-day forecast
- City search (Open-Meteo geocoding) with keyboard navigation
- One-click buttons for every FAU campus: Boca Raton, Jupiter, Davie, Fort Lauderdale, Dania Beach (SeaTech), Harbor Branch
- "My location" button (browser geolocation)
- °F / °C toggle. The last place and unit you picked are remembered.
- Four color themes: System (follows your device's light/dark setting), Light, White, and Dark. Your choice is remembered.
- A personal welcome for Dr. Lee with a quick weather summary and tips (umbrella, heat, UV, storms)
- FAU Blue (#003366) and FAU Red (#CC0000) theme with the FAU owl logo; works on phones

## Project layout
```
public/            # the site Netlify publishes
  index.html
  styles.css
  app.js
  assets/fau-mark.svg   # fallback logo
scripts/fetch-fau-logo.sh  # downloads the official FAU owl logo at build time
netlify.toml       # build settings plus security and cache headers
```
It's plain HTML, CSS and JavaScript. There's no framework and no `npm install`.

## Deploy to Netlify

### Option A: connect the GitHub repo (recommended)
1. In Netlify, choose **Add new site → Import an existing project → GitHub** and pick `fenago/ISM4421`.
2. Netlify reads `netlify.toml` on its own: the publish directory is `public` and the build command is `sh scripts/fetch-fau-logo.sh`. Leave the form fields as they are.
3. Click **Deploy**. Every push to the branch you chose redeploys the site.

### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
sh scripts/fetch-fau-logo.sh     # pulls the official FAU logo into public/assets
netlify deploy --prod --dir=public
```

### Option C: drag and drop
Run `sh scripts/fetch-fau-logo.sh` once, then drag the `public/` folder onto https://app.netlify.com/drop.

## About the FAU logo
The build step downloads FAU's official owl-head logo from `https://www.fau.edu/images/homepage/owlhead-logo.png` into `public/assets/fau-owl.png`. If that download fails, the page shows the bundled `fau-mark.svg` instead, so a deploy never breaks. To use a different official asset, save it as `public/assets/fau-owl.png`. Use of FAU marks falls under FAU's brand guidelines.

## Run locally
```bash
sh scripts/fetch-fau-logo.sh   # optional
cd public && python3 -m http.server 8080
# open http://localhost:8080
```

## Data attribution
Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0. The free tier is for non-commercial use.
