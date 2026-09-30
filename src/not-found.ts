/**
 * 404 page: name the address the visitor asked for. Plain text only (docs/security.md),
 * clipped so a long path can't stretch the report. Without JS the report reads "This address."
 */
const MAX = 48;

const slot = document.getElementById('nf-path');
const path = window.location.pathname + window.location.search;

if (slot && path !== '/404.html') {
  slot.textContent = path.length > MAX ? `${path.slice(0, MAX - 1)}…` : path;
}
