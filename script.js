/* ===========================
   LEGO Clock — digit patterns + render
   ===========================
   Cell letters:
     B = base green
     L = light-green highlight
     S = dark-green shadow
     g = gray border
     d = dark gray border
     . = empty (transparent)
*/

/* All digits drawn on a 7-wide x 9-tall bounding box.
   Strategy: think of digits as chunky pixel art.
   - B  = main green block
   - L  = light-green highlight
   - g  = gray border (placed adjacent to green that meets background)
   - '.' = empty (blue sky shows through) */
/* Clean digits: 1-cell-thick green stroke + 1-cell gray border outside.
   No internal gray cells (interior is '.' = blue sky shows through). */
/* Digits drawn cell-by-cell.
   Each digit: green strokes (B) + light highlight (L) at upper-left of body
   + dark shadow (S) at lower-right of body + gray border (g) around all greens. */
const DIGITS = {
  '0': [
    '.gggg.',
    'gBLBBg',
    'gB..Bg',
    'gB..Bg',
    'gB..Bg',
    'gB..Bg',
    'gBBBSg',
    '.gggg.',
  ],
  '1': [
    '..gg..',
    '.gLBg.',
    'gBBBg.',
    '..gBg.',
    '..gBg.',
    '..gBg.',
    'gBBBSg',
    'gggggg',
  ],
  '2': [
    '.gggg.',
    'gBLBBg',
    '...gBg',
    '...gBg',
    '..gBg.',
    '.gBg..',
    'gBBBSg',
    'gggggg',
  ],
  '3': [
    '.gggg.',
    'gBLBBg',
    '...gBg',
    '.gBBBg',
    '...gBg',
    '...gBg',
    'gBBBSg',
    '.gggg.',
  ],
  '4': [
    '....gg',
    '...gBg',
    '..gBBg',
    '.gB.Bg',
    'gBLBBg',
    'gBBBBg',
    'gggBSg',
    '...ggg',
  ],
  '5': [
    'gggggg',
    'gBLBBg',
    'gB....',
    'gBBBBg',
    '.gggBg',
    '....Bg',
    'gBBBSg',
    '.gggg.',
  ],
  '6': [
    '..ggg.',
    '.gBLg.',
    'gBBg..',
    'gBBBBg',
    'gB..Bg',
    'gB..Bg',
    'gBBBSg',
    '.gggg.',
  ],
  '7': [
    'gggggg',
    'gBLBBg',
    '...gBg',
    '..gBg.',
    '..gBg.',
    '.gBg..',
    '.gBg..',
    '.ggg..',
  ],
  '8': [
    '.gggg.',
    'gBLBBg',
    'gB..Bg',
    '.gBBg.',
    'gBLBBg',
    'gB..Bg',
    'gBBBSg',
    '.gggg.',
  ],
  '9': [
    '.gggg.',
    'gBLBBg',
    'gB..Bg',
    'gBBBBg',
    '.gggBg',
    '....Bg',
    'gBBBSg',
    '.gggg.',
  ],
};

const COLON = [
  '..',
  '..',
  'gg',
  'gg',
  '..',
  '..',
  'gg',
  'gg',
  '..',
];

// Cloud: 3 rows tall x 5 cols wide (horizontal puffy shape)
// Row widths effectively [3, 5, 3] when counting non-empty cells.
// Dark cells: row1 col1 and row1 col2 (middle row, "2번째 칸" = 2nd cell from left).
const CLOUD = [
  // c0   c1    c2    c3    c4
  ['.',  'w',  'w',  'w',  '.' ],  // top  — 3 cells
  ['w',  'ws', 'ws', 'w',  'w' ],  // mid  — 5 cells with 2 dark
  ['.',  'w',  'w',  'w',  '.' ],  // bot  — 3 cells
];

/* LEGO art floats — white theme only */
const LEGO_ART = {
  creativeA: [
    '.KK.KKK.KKK..K..KKK.K.K.K.KKK',
    'K...K.K.K...K.K..K..K.K.K.K..',
    'K...KKK.KK..KKK..K..K.K.K.KK.',
    'K...KK..K...K.K..K..K..K..K..',
    '.KK.K.K.KKK.K.K..K..K..K..KKK',
  ],
};

const CHAR_CLASS = {
  'B': 'g', 'L': 'gl', 'S': 'gs',
  'g': 'gy', 'd': 'gyd',
  'w': 'w', 'W': 'ws',
  'K': 'k',
};

/* LEGO music notes — pure black blocks (no outline). Used on orange theme. */
const ICONS = {
  // B: 큰 4분음표 (긴 스템 + 비스듬한 머리)
  noteB: [
    '...K',
    '...K',
    '...K',
    '...K',
    '...K',
    '..KK',
    '.KKK',
    'KKKK',
    'KKK.',
  ],
  // C: 8분음표 (꼬리 깃발)
  noteC: [
    '..KKK',
    '..KKK',
    '..K.K',
    '..K..',
    '..K..',
    '.KK..',
    'KKK..',
    'KK...',
  ],
  // D: 이중 음표 (beam 한 줄 + 비스듬한 평행사변형 머리 두 개)
  noteD: [
    'KKKKKKKK',
    '.K....K.',
    '.K....K.',
    '.K....K.',
    '.K....K.',
    'KK...KK.',
    'KKK..KKK',
    '.KK...KK',
  ],
};

/** Render a 2D pattern (array of strings) into the given container as .cell divs */
function renderPattern(container, rows) {
  container.innerHTML = '';
  const cols = Math.max(...rows.map(r => r.length));
  container.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
  container.style.gridTemplateRows = `repeat(${rows.length}, var(--cell))`;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r].padEnd(cols, '.');
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      const div = document.createElement('div');
      if (ch === '.') {
        div.style.background = 'transparent';
      } else {
        div.className = 'cell ' + (CHAR_CLASS[ch] || '');
      }
      container.appendChild(div);
    }
  }
}

/** Render the cloud (column-major) — translate to row-major before rendering */
function renderCloud(container) {
  // CLOUD is row-major already: CLOUD[row][col]
  // Build row strings using 'w' and 'W' tokens
  const rows = CLOUD.map(row =>
    row.map(cell => {
      if (cell === '.') return '.';
      if (cell === 'w') return 'w';
      if (cell === 'ws') return 'W'; // dark cloud
      return '.';
    }).join('')
  );
  renderPattern(container, rows);
}

/** Render the full time string into #time */
function renderTime(timeStr) {
  const timeEl = document.getElementById('time');
  timeEl.innerHTML = '';

  for (const ch of timeStr) {
    const wrap = document.createElement('div');
    if (ch === ':') {
      wrap.className = 'colon';
      renderPattern(wrap, COLON);
    } else if (DIGITS[ch]) {
      wrap.className = 'digit';
      renderPattern(wrap, DIGITS[ch]);
    }
    timeEl.appendChild(wrap);
  }
}

/** Format current time as HH:MM:SS (12-hr) + AM/PM + date */
function tick() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = String(h).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  renderTime(`${hh}:${mm}:${ss}`);

  document.getElementById('ampm').textContent = ampm;

  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const da = String(now.getDate()).padStart(2, '0');
  const dow = ['SUN','MON','TUE','WED','THU','FRI','SAT'][now.getDay()];
  document.getElementById('date').innerHTML = `${mo}.${da}&nbsp;&nbsp;${dow}`;
}

/** Render clouds in their fixed positions */
function renderClouds() {
  document.querySelectorAll('.cloud').forEach(el => {
    const art = el.dataset.art;
    if (art && LEGO_ART[art]) renderPattern(el, LEGO_ART[art]);
    else renderCloud(el);
  });
}

/** Render LEGO icon floats based on their data-icon attribute */
function renderIcons() {
  document.querySelectorAll('.icon-float').forEach(el => {
    const key = el.dataset.icon;
    const pattern = ICONS[key];
    if (pattern) renderPattern(el, pattern);
  });
}

/** Wake Lock API — keep screen on while clock is visible */
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {});
    }
  } catch (e) {
    // Wake Lock not supported or denied — silently ignore
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});

/** Color theme picker */
function applyTheme(theme) {
  if (theme === 'green') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  document.querySelectorAll('.color-dot').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.theme === theme)
  );
}

document.querySelectorAll('.color-dot').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    applyTheme(theme);
    try { localStorage.setItem('clockTheme', theme); } catch (e) {}
  });
});

const savedTheme = (() => { try { return localStorage.getItem('clockTheme'); } catch (e) { return null; } })();
if (savedTheme) applyTheme(savedTheme);

/** Init */
renderClouds();
renderIcons();
tick();
setInterval(tick, 1000);
requestWakeLock();
