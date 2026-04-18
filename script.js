/* ============================================================
   NAV: transparent → opaque on scroll
   ============================================================ */
const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ============================================================
   TOUR DATES via Google gviz JSONP
   Google always calls google.visualization.Query.setResponse()
   — so we just define that function ourselves before loading the script.
   Columns: Tag | Datum | Stadt | Venue | Ticket URL (optional)
   ============================================================ */
const SHEET_ID = '10w92WXrxO_rF5IL3W6GWfquZ-lzsuK29BCBCdvMD0nM';

function cellValue(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  return cell.f !== undefined ? String(cell.f) : String(cell.v);
}

function renderTourDates(rows) {
  const list = document.getElementById('tour-list');

  if (!rows.length) {
    list.innerHTML = '<p class="tour-empty">Keine Tourdaten vorhanden.</p>';
    return;
  }

  const html = rows.map(row => {
    const cols      = (row.c || []).map(cellValue);
    const weekday   = cols[0] || '';
    const datum     = cols[1] || '';
    const city      = cols[2] || '';
    const venue     = cols[3] || '';
    const ticketURL = (cols[4] || '').trim();

    const dateLabel = [weekday, datum].filter(Boolean).join('\u2002');

    const ticketBtn = ticketURL
      ? `<a href="${ticketURL}" class="tour-ticket" target="_blank" rel="noopener">Tickets</a>`
      : `<span class="tour-ticket-placeholder"></span>`;

    return `
      <div class="tour-row">
        <span class="tour-date">${dateLabel}</span>
        <div class="tour-info">
          <span class="tour-city">${city}</span>
          ${venue ? `<span class="tour-venue">${venue}</span>` : ''}
        </div>
        ${ticketBtn}
      </div>`;
  }).join('');

  list.innerHTML = html;
}

function loadTourDates() {
  const list = document.getElementById('tour-list');

  // Define the function Google will call when the script loads
  window.google = window.google || {};
  window.google.visualization = window.google.visualization || {};
  window.google.visualization.Query = window.google.visualization.Query || {};
  window.google.visualization.Query.setResponse = function(data) {
    try {
      // Row 0 is the header row ("Tag", "Datum", ...) — skip it
      const rows = (data.table.rows || []).slice(1)
        .filter(r => r.c && cellValue(r.c[0]));
      renderTourDates(rows);
    } catch (e) {
      list.innerHTML = '<p class="tour-error">Tourdaten konnten nicht geladen werden.</p>';
      console.warn('Tour dates parse error:', e);
    }
  };

  const script = document.createElement('script');
  script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  script.onerror = () => {
    list.innerHTML = '<p class="tour-error">Tourdaten konnten nicht geladen werden.</p>';
  };
  document.head.appendChild(script);
}

loadTourDates();


/* ============================================================
   VARIABLE FONT: randomize wdth per letter in section headings
   ============================================================ */
document.querySelectorAll('.section-heading').forEach(heading => {
  heading.innerHTML = [...heading.textContent].map(char =>
    char === ' '
      ? ' '
      : `<span class="vf-char" style="font-variation-settings:'wdth' ${Math.random() * 100}">${char}</span>`
  ).join('');
});
