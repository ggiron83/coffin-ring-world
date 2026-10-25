(function () {
  const pages = WORLD.pages;
  const prompts = window.WORLD_PROMPTS || {};
  const byId = Object.fromEntries(pages.map(p => [p.id, p]));
  const regions = pages.filter(p => p.group === '지역');
  const docs = pages.filter(p => p.group !== '지역');
  const content = document.getElementById('content');
  const tabs = document.getElementById('tabs');

  let galleryIndex = 0;
  let stopWheel = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function md(s) {
    return window.marked ? marked.parse(s.trim()) : '<pre>' + esc(s.trim()) + '</pre>';
  }
  function num(i) { return String(i + 1).padStart(2, '0'); }

  function sections(p) {
    return p.md.split(/^## /m).slice(1).map(chunk => {
      const nl = chunk.indexOf('\n');
      return { title: chunk.slice(0, nl).trim(), body: chunk.slice(nl + 1).trim() };
    });
  }
  function section(p, title) {
    const s = sections(p).find(x => x.title.startsWith(title));
    return s ? s.body : '';
  }
  function plain(s) {
    return s.replace(/\*\*|`|^[-*] |^> /gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  }
  function img(p, cls) {
    return `<div class="${cls} tone-${p.tone || 'gray'}" data-fallback="${esc(p.title)}">` +
      `<img src="${esc(p.image)}" alt="${esc(p.title)}" draggable="false" onerror="this.parentNode.textContent=this.parentNode.dataset.fallback"></div>`;
  }

  /* ---------- gallery: rotating arc of region cards ---------- */

  function gallery() {
    content.innerHTML = `<section class="gallery">
      <div class="g-info" id="gInfo"></div>
      <div class="stage" id="stage" tabindex="0" aria-label="지역 갤러리. 좌우로 끌거나 화살표 키로 돌립니다">
        ${regions.map((p, i) => `<div class="arc-card" data-i="${i}">
            <div class="arc-label"><b>${esc(p.title)}</b><span>${esc(p.subtitle.split(' · ')[0])}</span></div>
            ${img(p, 'arc-img')}
            <div class="arc-num">${num(i)}</div>
          </div>`).join('')}
      </div>
      <div class="chips">${regions.map((p, i) =>
        `<button class="chip" data-i="${i}"><span>${num(i)}</span>${esc(p.title)}</button>`).join('')}</div>
      <p class="hint">드래그 · 스크롤 · ← → 로 돌리고, 가운데 카드를 누르면 열립니다</p>
    </section>`;

    const stage = document.getElementById('stage');
    const cards = [...stage.querySelectorAll('.arc-card')];
    const chips = [...content.querySelectorAll('.chip')];
    const info = document.getElementById('gInfo');
    const N = regions.length;
    const STEP = 15;
    let cur = galleryIndex, target = galleryIndex, shown = -1, raf = 0, alive = true;

    const wrap = d => ((d % N) + N + N / 2) % N - N / 2;
    const active = () => ((Math.round(cur) % N) + N) % N;

    function layout() {
      const mobile = stage.clientWidth < 640;
      const R = mobile ? 600 : 860;
      cards.forEach((c, i) => {
        const d = wrap(i - cur);
        c.style.transformOrigin = `50% calc(100% + ${R}px)`;
        c.style.transform = `translateX(-50%) rotate(${d * STEP}deg)`;
        c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        c.style.opacity = Math.abs(d) > 3.4 ? '0' : '1';
        c.classList.toggle('is-active', Math.abs(d) < 0.5);
      });
      const a = active();
      if (a !== shown) { shown = a; showInfo(a); }
    }

    function showInfo(i) {
      const p = regions[i];
      galleryIndex = i;
      const concept = plain(section(p, '한 줄 컨셉'));
      const crisis = plain(section(p, '메인 아크 위기')).split('\n')[0];
      info.innerHTML = `<div class="g-num">NO.${num(i)} <span>/ ${num(N - 1)}</span></div>
        <h1 class="g-title">${esc(p.title)}</h1>
        <p class="g-sub">${esc(p.subtitle)}</p>
        <p class="g-concept">${esc(concept)}</p>
        ${crisis ? `<p class="g-crisis"><em>메인 위기</em>${esc(crisis)}</p>` : ''}
        <div class="tags">${(p.refs || []).map(r => `<span class="tag">${esc(r)}</span>`).join('')}</div>
        <a class="btn" href="#${p.id}">자세히 보기 →</a>`;
      chips.forEach((c, k) => c.classList.toggle('on', k === i));
    }

    function tick() {
      if (!alive) return;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.001) cur = target;
      layout();
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    }
    function go(t) { target = t; if (!raf) raf = requestAnimationFrame(tick); }
    function goTo(i) { go(target + wrap(i - target)); }

    let down = null;
    stage.addEventListener('pointerdown', e => {
      down = { x: e.clientX, cur, moved: false };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) down.moved = true;
      if (down.moved) { cur = target = down.cur - dx / (stage.clientWidth < 640 ? 165 : 210); layout(); }
    });
    stage.addEventListener('pointerup', e => {
      if (!down) return;
      const wasDrag = down.moved;
      down = null;
      if (wasDrag) { go(Math.round(cur)); return; }
      const el = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('arc-card'));
      if (!el) return;
      const i = +el.dataset.i;
      if (i === active()) location.hash = regions[i].id; else goTo(i);
    });
    let wheelLock = 0;
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock < 220) return;
      wheelLock = now;
      go(Math.round(target) + Math.sign(e.deltaY || e.deltaX));
    }, { passive: false });
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') go(Math.round(target) + 1);
      else if (e.key === 'ArrowLeft') go(Math.round(target) - 1);
      else if (e.key === 'Enter') location.hash = regions[active()].id;
    });
    chips.forEach(c => c.onclick = () => goTo(+c.dataset.i));
    window.addEventListener('resize', layout);

    layout();
    stopWheel = () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', layout); };
  }

  /* ---------- region detail ---------- */

  function detail(p) {
    const i = regions.indexOf(p);
    const scenes = (WORLD.gallery && WORLD.gallery[p.id]) || [];
    const secs = sections(p).filter(s => !s.title.startsWith('한 줄 컨셉'));
    const prompt = prompts[p.id];
    if (prompt) secs.push({ title: '이미지 프롬프트', prompt: (prompt + ' ' + (prompts.STYLE || '')).trim(), negative: prompts.NEGATIVE });
    const prev = regions[(i - 1 + regions.length) % regions.length];
    const next = regions[(i + 1) % regions.length];
    const fact = (label, body) => body ? `<div class="fact"><div class="fact-k">${label}</div><div class="fact-v md">${md(body)}</div></div>` : '';

    content.innerHTML = `<article class="detail">
      <div class="d-hero">
        <div class="d-stage">
          <div class="d-backdrop" style="background-image:url('${esc(p.image)}')"></div>
          <button class="d-zoom" aria-label="대표 이미지 크게 보기">${img(p, 'd-img')}<span class="d-zoom-hint">⤢ 크게 보기</span></button>
        </div>
        <a class="close" href="#" aria-label="갤러리로">×</a>
        <div class="d-caption">
          <div class="g-num">NO.${num(i)}</div>
          <h1>${esc(p.title)}</h1>
          <p>${esc(p.subtitle)}</p>
        </div>
      </div>
      ${scenes.length ? `<section class="scenes">${scenes.map(([src, cap]) =>
        `<figure class="scene"><button class="scene-btn" data-src="${esc(src)}" data-cap="${esc(cap)}"><img src="${esc(src)}" alt="${esc(cap)}" loading="lazy"></button><figcaption>${esc(cap)}</figcaption></figure>`).join('')}</section>` : ''}
      <div class="d-body">
        <aside class="facts">
          ${fact('한 줄 컨셉', section(p, '한 줄 컨셉'))}
          ${fact('메인 위기', section(p, '메인 아크 위기'))}
          ${fact('전생의 흔적', section(p, '전생의 흔적'))}
          <div class="fact"><div class="fact-k">참고</div><div class="tags">${(p.refs || []).map(r => `<span class="tag">${esc(r)}</span>`).join('')}</div></div>
          <div class="pager">
            <a href="#${prev.id}">← ${esc(prev.title)}</a>
            <a href="#${next.id}">${esc(next.title)} →</a>
          </div>
        </aside>
        <section class="d-main">
          <div class="seg" role="tablist">${secs.map((s, k) =>
            `<button role="tab" data-k="${k}" class="${k === 0 ? 'on' : ''}">${esc(s.title)}</button>`).join('')}</div>
          <div class="seg-panel" id="segPanel"></div>
        </section>
      </div>
    </article>`;

    const panel = document.getElementById('segPanel');
    const btns = [...content.querySelectorAll('.seg button')];
    function show(k) {
      const s = secs[k];
      btns.forEach((b, j) => b.classList.toggle('on', j === k));
      if (s.prompt) {
        panel.innerHTML = `<p class="muted">NovelAI V5 Full · 1216×832 · Steps 28 · Guidance 5 (Opus 기준 0 Anlas). 결과를 <code>${esc(p.image)}</code> 로 저장하면 갤러리와 이 페이지에 표시됩니다. 자세한 방법은 <a href="#images">이미지 작업</a> 문서에 있습니다.</p>
          <div class="prompt-text" id="promptText">${esc(s.prompt)}</div>
          <button class="btn" id="copyBtn">프롬프트 복사</button>
          ${s.negative ? `<p class="muted" style="margin-top:16px">Undesired Content</p><div class="prompt-text">${esc(s.negative)}</div>` : ''}`;
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.onclick = () => navigator.clipboard.writeText(s.prompt).then(
          () => { copyBtn.textContent = '복사됨'; setTimeout(() => copyBtn.textContent = '프롬프트 복사', 1500); },
          () => { copyBtn.textContent = '복사 실패 · 직접 선택해 주세요'; });
      } else {
        panel.innerHTML = `<div class="md">${md(s.body)}</div>`;
      }
    }
    btns.forEach(b => b.onclick = () => show(+b.dataset.k));
    show(0);
    content.querySelectorAll('.scene-btn').forEach(b => b.onclick = () => openLightbox(b.dataset.src, b.dataset.cap));
    content.querySelector('.d-zoom').onclick = () => openLightbox(p.image, `${p.title} · ${p.subtitle}`);
    galleryIndex = i;
  }

  function openLightbox(src, cap) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `<figure><img src="${esc(src)}" alt="${esc(cap)}"><figcaption>${esc(cap)}</figcaption></figure><button class="close" aria-label="닫기">×</button>`;
    const close = () => { box.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    box.onclick = close;
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
  }

  /* ---------- docs, map ---------- */

  function docsIndex() {
    const groups = [...new Set(docs.map(d => d.group))];
    content.innerHTML = `<section class="page">
      <h1 class="page-title">설정 문서</h1>
      ${groups.map(g => `<h2 class="group-title">${esc(g)}</h2>
        <div class="doc-grid">${docs.filter(d => d.group === g).map(d =>
          `<a class="doc-card" href="#${d.id}"><b>${esc(d.title)}</b><span>${esc(d.subtitle)}</span></a>`).join('')}</div>`).join('')}
    </section>`;
  }

  function doc(p) {
    content.innerHTML = `<article class="page">
      <a class="back" href="#docs">← 설정 문서</a>
      <h1 class="page-title">${esc(p.title)}</h1>
      <p class="muted">${esc(p.subtitle)}</p>
      <div class="md">${md(p.md)}</div>
    </article>`;
  }

  function map() {
    content.innerHTML = `<section class="page page-wide">
      <h1 class="page-title">관륜 대륙</h1>
      <p class="muted">위 = 북. 지역을 누르면 해당 문서로 이동합니다. 지형 · 기후 · 국경의 근거는 <a href="#geography">지리와 기후</a> 문서에 있습니다. 철새 선단은 대륙을 순환하는 유랑 세력이라 표시하지 않습니다.</p>
      ${WORLD.mapSvg || ''}
    </section>`;
  }

  /* ---------- routing ---------- */

  function route() {
    if (stopWheel) { stopWheel(); stopWheel = null; }
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const p = byId[id];
    let tab = 'gallery';
    if (!id) gallery();
    else if (id === 'map') { map(); tab = 'map'; }
    else if (id === 'docs') { docsIndex(); tab = 'docs'; }
    else if (p && p.group === '지역') detail(p);
    else if (p) { doc(p); tab = 'docs'; }
    else gallery();
    tabs.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    document.body.dataset.view = !id ? 'gallery' : (p && p.group === '지역' ? 'detail' : 'page');
    document.title = p ? `${p.title} · 관륜 세계관` : '관륜 세계관';
    window.scrollTo(0, 0);
    const stage = document.getElementById('stage');
    if (stage) stage.focus({ preventScroll: true });
  }

  document.getElementById('themeBtn').onclick = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  };
  try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  window.addEventListener('hashchange', route);
  route();
})();
