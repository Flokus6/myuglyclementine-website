/* ============================================================
   VARIABLE FONT: randomize wdth per letter
   ============================================================ */
function randomizeVF(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map(char =>
    char === ' '
      ? ' '
      : `<span class="vf-char" aria-hidden="true" style="font-variation-settings:'wdth' ${Math.random() * 100}">${char}</span>`
  ).join('');
}

document.querySelectorAll('.section-heading, .subpage-wrap h1').forEach(randomizeVF);


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
   Columns: Tag | Datum | Stadt | Venue | Ticket URL | Sold Out
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
    const soldOut   = (cols[5] || '').trim().toLowerCase() === 'x';

    // Reformat from DD.MM.YYYY → MM/DD
    const dateParts = datum.match(/(\d{1,2})\.(\d{1,2})/);
    const dateFormatted = dateParts
      ? `${dateParts[1].padStart(2,'0')}/${dateParts[2].padStart(2,'0')}`
      : datum;

    const ticketBtn = soldOut
      ? `<span class="tour-sold-out">Sold Out</span>`
      : ticketURL
        ? `<a href="${ticketURL}" class="tour-ticket" target="_blank" rel="noopener" aria-label="Tickets für ${city}, öffnet in neuem Tab">Tickets</a>`
        : `<span class="tour-ticket-placeholder"></span>`;

    return `
      <div class="tour-row${soldOut ? ' sold-out' : ''}">
        <span class="tour-date"><sup class="tour-weekday">${weekday}</sup><span class="tour-date-numbers">${dateFormatted}</span></span>
        <div class="tour-info">
          <span class="tour-city">${city}${venue ? `, <span class="tour-venue">${venue}</span>` : ''}</span>
        </div>
        ${ticketBtn}
      </div>`;
  }).join('');

  list.innerHTML = html;
  list.querySelectorAll('.tour-date-numbers').forEach(randomizeVF);
}

function loadTourDates() {
  const list = document.getElementById('tour-list');

  window.google = window.google || {};
  window.google.visualization = window.google.visualization || {};
  window.google.visualization.Query = window.google.visualization.Query || {};
  window.google.visualization.Query.setResponse = function(data) {
    try {
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
