(function () {
  const pages = WORLD.pages;
  const prompts = window.WORLD_PROMPTS || {};
  const byId = Object.fromEntries(pages.map(p => [p.id, p]));
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  const MAP_REGIONS = [
    { id: 'hrimheim', cx: 170, cy: 120, rx: 110, ry: 55 },
    { id: 'severya', cx: 470, cy: 110, rx: 150, ry: 55 },
    { id: 'silent', cx: 340, cy: 230, rx: 95, ry: 40 },
    { id: 'cheongun', cx: 540, cy: 260, rx: 100, ry: 55 },
    { id: 'zarqa', cx: 350, cy: 340, rx: 110, ry: 45 },
    { id: 'cascara', cx: 135, cy: 330, rx: 95, ry: 50 },
    { id: 'aura', cx: 550, cy: 405, rx: 90, ry: 35 }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function renderMd(md) {
    if (window.marked) return marked.parse(md.trim());
    return '<pre>' + esc(md.trim()) + '</pre>';
  }

  function imageHtml(p, cls) {
    if (!p.image) return '';
    return `<div class="${cls} bg-${p.tone || 'gray'}" data-fallback="${esc(p.title)}">` +
      `<img src="${esc(p.image)}" loading="lazy" alt="${esc(p.title)}" onerror="this.parentNode.textContent=this.parentNode.dataset.fallback">` +
      `</div>`;
  }

  function buildNav(active) {
    const groups = [];
    pages.forEach(p => {
      let g = groups.find(x => x.name === p.group);
      if (!g) groups.push(g = { name: p.group, items: [] });
      g.items.push(p);
    });
    sidebar.innerHTML =
      `<a class="nav-link ${active === '' ? 'active' : ''}" href="#"><span class="dot"></span>지도 · 홈</a>` +
      groups.map(g =>
        `<div class="nav-group">${esc(g.name)}</div>` +
        g.items.map(p =>
          `<a class="nav-link ${p.id === active ? 'active' : ''}" href="#${p.id}">` +
          `<span class="dot" style="background:var(--${p.tone || 'gray'})"></span>${esc(p.title)}</a>`
        ).join('')
      ).join('');
  }

  function mapSvg() {
    const shapes = MAP_REGIONS.map(r => {
      const p = byId[r.id];
      const t = p.tone;
      return `<a href="#${r.id}">` +
        `<ellipse cx="${r.cx}" cy="${r.cy}" rx="${r.rx}" ry="${r.ry}" fill="var(--${t}-bg)" stroke="var(--${t})" stroke-width="1"/>` +
        `<text x="${r.cx}" y="${r.cy - 8}" text-anchor="middle" dominant-baseline="central" fill="var(--${t})" font-size="15" font-weight="500">${esc(p.title)}</text>` +
        `<text x="${r.cx}" y="${r.cy + 14}" text-anchor="middle" dominant-baseline="central" fill="var(--${t})" font-size="12">${esc(p.subtitle.split(' · ')[1] || '')}</text>` +
        `</a>`;
    }).join('');
    return `<svg class="map" viewBox="0 50 680 430" role="img" aria-label="관륜 세계 지도">${shapes}` +
      `<text x="340" y="465" text-anchor="middle" fill="var(--muted)" font-size="12">위 = 북 · 적도로 갈수록 관륜이 머리 위로 · 지역을 누르면 해당 문서로 이동</text></svg>`;
  }

  function home() {
    const regions = pages.filter(p => p.group === '지역');
    return `<div class="page">
      <h1>관륜 세계관</h1>
      <p class="sub">죽은 신의 고리 아래, 국가 단위로 펼쳐지는 대체과학 근미래</p>
      ${mapSvg()}
      <div class="md"><h2>지역</h2></div>
      <div class="grid">${regions.map(p =>
        `<a class="card" href="#${p.id}">${imageHtml(p, 'thumb')}
          <div class="body"><div class="t">${esc(p.title)}</div><div class="s">${esc(p.subtitle)}</div></div></a>`
      ).join('')}</div>
      <div class="md"><h2>설정 문서</h2></div>
      <div class="grid">${pages.filter(p => p.group !== '지역').map(p =>
        `<a class="card" href="#${p.id}"><div class="body"><div class="t">${esc(p.title)}</div><div class="s">${esc(p.subtitle)}</div></div></a>`
      ).join('')}</div>
    </div>`;
  }

  function page(p) {
    const tags = (p.refs || []).map(r => `<span class="tag t-${p.tone || 'gray'}">${esc(r)}</span>`).join('');
    const prompt = prompts[p.id];
    const promptBox = prompt ? `<div class="prompt-box">
        <h3>Gemini 이미지 프롬프트</h3>
        <p>복사해서 Gemini에 붙여 넣고, 결과를 <code>${esc(p.image)}</code> 로 저장하면 이 페이지와 홈에 표시됩니다.</p>
        <div class="prompt-text" id="promptText">${esc(prompt + ' ' + (prompts.STYLE || ''))}</div>
        <button class="btn" id="copyBtn">프롬프트 복사</button>
      </div>` : '';
    return `<article class="page">
      ${imageHtml(p, 'hero')}
      ${tags ? `<div class="tags">${tags}</div>` : ''}
      <h1>${esc(p.title)}</h1>
      <p class="sub">${esc(p.subtitle)}</p>
      <div class="md">${renderMd(p.md)}</div>
      ${promptBox}
    </article>`;
  }

  function route() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const p = byId[id];
    content.innerHTML = p ? page(p) : home();
    buildNav(p ? p.id : '');
    sidebar.classList.remove('open');
    window.scrollTo(0, 0);
    document.title = p ? `${p.title} · 관륜 세계관` : '관륜 세계관';
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.onclick = () => {
      const text = document.getElementById('promptText').textContent;
      navigator.clipboard.writeText(text).then(
        () => { copyBtn.textContent = '복사됨'; setTimeout(() => copyBtn.textContent = '프롬프트 복사', 1500); },
        () => { copyBtn.textContent = '복사 실패 · 직접 선택해 주세요'; }
      );
    };
  }

  document.getElementById('menuBtn').onclick = () => sidebar.classList.toggle('open');
  document.getElementById('themeBtn').onclick = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  };
  try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  window.addEventListener('hashchange', route);
  route();
})();
