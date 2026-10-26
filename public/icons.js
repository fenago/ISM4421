/* Owl Weather icons: the subset of Lucide (v0.460.0, ISC license, https://lucide.dev) the UI uses.
   Icons are built with createElementNS from this static data, so no HTML is ever parsed. */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const ICONS = {
    "search": [["circle",{"cx":"11","cy":"11","r":"8"}],["path",{"d":"m21 21-4.3-4.3"}]],
    "locate-fixed": [["line",{"x1":"2","x2":"5","y1":"12","y2":"12"}],["line",{"x1":"19","x2":"22","y1":"12","y2":"12"}],["line",{"x1":"12","x2":"12","y1":"2","y2":"5"}],["line",{"x1":"12","x2":"12","y1":"19","y2":"22"}],["circle",{"cx":"12","cy":"12","r":"7"}],["circle",{"cx":"12","cy":"12","r":"3"}]],
    "monitor": [["rect",{"width":"20","height":"14","x":"2","y":"3","rx":"2"}],["line",{"x1":"8","x2":"16","y1":"21","y2":"21"}],["line",{"x1":"12","x2":"12","y1":"17","y2":"21"}]],
    "sun": [["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 2v2"}],["path",{"d":"M12 20v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"m17.66 17.66 1.41 1.41"}],["path",{"d":"M2 12h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"m6.34 17.66-1.41 1.41"}],["path",{"d":"m19.07 4.93-1.41 1.41"}]],
    "moon": [["path",{"d":"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}]],
    "calendar": [["path",{"d":"M8 2v4"}],["path",{"d":"M16 2v4"}],["rect",{"width":"18","height":"18","x":"3","y":"4","rx":"2"}],["path",{"d":"M3 10h18"}]],
    "clock": [["circle",{"cx":"12","cy":"12","r":"10"}],["polyline",{"points":"12 6 12 12 16 14"}]],
    "droplets": [["path",{"d":"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"}],["path",{"d":"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"}]],
    "wind": [["path",{"d":"M12.8 19.6A2 2 0 1 0 14 16H2"}],["path",{"d":"M17.5 8a2.5 2.5 0 1 1 2 4H2"}],["path",{"d":"M9.8 4.4A2 2 0 1 1 11 8H2"}]],
    "tornado": [["path",{"d":"M21 4H3"}],["path",{"d":"M18 8H6"}],["path",{"d":"M19 12H9"}],["path",{"d":"M16 16h-6"}],["path",{"d":"M11 20H9"}]],
    "sun-dim": [["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 4h.01"}],["path",{"d":"M20 12h.01"}],["path",{"d":"M12 20h.01"}],["path",{"d":"M4 12h.01"}],["path",{"d":"M17.657 6.343h.01"}],["path",{"d":"M17.657 17.657h.01"}],["path",{"d":"M6.343 17.657h.01"}],["path",{"d":"M6.343 6.343h.01"}]],
    "umbrella": [["path",{"d":"M22 12a10.06 10.06 1 0 0-20 0Z"}],["path",{"d":"M12 12v8a2 2 0 0 0 4 0"}],["path",{"d":"M12 2v1"}]],
    "sunrise": [["path",{"d":"M12 2v8"}],["path",{"d":"m4.93 10.93 1.41 1.41"}],["path",{"d":"M2 18h2"}],["path",{"d":"M20 18h2"}],["path",{"d":"m19.07 10.93-1.41 1.41"}],["path",{"d":"M22 22H2"}],["path",{"d":"m8 6 4-4 4 4"}],["path",{"d":"M16 18a4 4 0 0 0-8 0"}]],
    "sunset": [["path",{"d":"M12 10V2"}],["path",{"d":"m4.93 10.93 1.41 1.41"}],["path",{"d":"M2 18h2"}],["path",{"d":"M20 18h2"}],["path",{"d":"m19.07 10.93-1.41 1.41"}],["path",{"d":"M22 22H2"}],["path",{"d":"m16 6-4 4-4-4"}],["path",{"d":"M16 18a4 4 0 0 0-8 0"}]],
    "cloud-sun": [["path",{"d":"M12 2v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"M20 12h2"}],["path",{"d":"m19.07 4.93-1.41 1.41"}],["path",{"d":"M15.947 12.65a4 4 0 0 0-5.925-4.128"}],["path",{"d":"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"}]],
    "cloud-moon": [["path",{"d":"M10.188 8.5A6 6 0 0 1 16 4a1 1 0 0 0 6 6 6 6 0 0 1-3 5.197"}],["path",{"d":"M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6Z"}]],
    "cloud": [["path",{"d":"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"}]],
    "cloud-fog": [["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"M16 17H7"}],["path",{"d":"M17 21H9"}]],
    "cloud-drizzle": [["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"M8 19v1"}],["path",{"d":"M8 14v1"}],["path",{"d":"M16 19v1"}],["path",{"d":"M16 14v1"}],["path",{"d":"M12 21v1"}],["path",{"d":"M12 16v1"}]],
    "cloud-rain": [["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"M16 14v6"}],["path",{"d":"M8 14v6"}],["path",{"d":"M12 16v6"}]],
    "cloud-snow": [["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"M8 15h.01"}],["path",{"d":"M8 19h.01"}],["path",{"d":"M12 17h.01"}],["path",{"d":"M12 21h.01"}],["path",{"d":"M16 15h.01"}],["path",{"d":"M16 19h.01"}]],
    "cloud-lightning": [["path",{"d":"M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"}],["path",{"d":"m13 12-3 5h4l-3 5"}]]
  };

  // Returns an <svg> for a known icon name; unknown names fall back to "cloud".
  function icon(name, className) {
    const svg = document.createElementNS(NS, "svg");
    const attrs = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.6",
      "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" };
    for (const k in attrs) svg.setAttribute(k, attrs[k]);
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    for (const [tag, a] of ICONS[name] || ICONS.cloud) {
      const child = document.createElementNS(NS, tag);
      for (const k in a) child.setAttribute(k, a[k]);
      svg.appendChild(child);
    }
    return svg;
  }

  window.OwlIcons = Object.freeze({ icon });
})();
