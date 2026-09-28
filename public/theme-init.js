/* Applies the saved theme before the page paints, so there's no flash of the wrong colors.
   Loaded synchronously in <head>; app.js handles changes after load. */
(function () {
  var pref = "system";
  try { pref = localStorage.getItem("owl-weather:theme") || "system"; } catch (e) { /* ignore */ }
  if (["system", "light", "white", "dark"].indexOf(pref) < 0) pref = "system";
  var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var root = document.documentElement;
  root.setAttribute("data-theme-pref", pref);
  root.setAttribute("data-theme", pref === "system" ? (dark ? "dark" : "light") : pref);
})();
