window.WORLD = window.WORLD || { pages: [] };

(function () {
  const tri = ([x, y]) => `<path class="mt" d="M${x - 9},${y + 6} L${x},${y - 8} L${x + 9},${y + 6}"/>`;
  const city = (x, y, name, opts = {}) =>
    `<circle cx="${x}" cy="${y}" r="${opts.cap ? 5 : 3.5}" class="${opts.cap ? 'cap' : 'city'}"/>` +
    (opts.star ? `<circle cx="${x}" cy="${y}" r="9" class="star"/>` : '') +
    `<text x="${x + (opts.dx || 8)}" y="${y + (opts.dy || 4)}" class="cl" text-anchor="${opts.anchor || 'start'}">${name}</text>`;
  const region = (id, x, y, name) => `<a href="#${id}"><text x="${x}" y="${y}" class="rl rl-${id}" text-anchor="middle">${name}</text></a>`;

  const mountains = [
    [175, 120], [182, 150], [176, 185], [184, 220], [176, 255], [182, 290], [174, 325],
    [600, 150], [622, 138], [644, 152],
    [790, 320], [812, 345], [795, 372], [818, 398], [800, 428], [822, 452],
    [470, 252], [538, 297], [538, 368], [470, 410], [402, 368], [402, 297],
    [290, 470], [306, 505]
  ];

  WORLD.mapSvg = `<svg class="worldmap" viewBox="0 0 1000 720" role="img" aria-label="관륜 대륙 지도">
  <defs>
    <clipPath id="land"><path d="M120,90 L220,60 L330,80 L430,55 L560,70 L700,50 L820,85 L900,130 L930,220 L890,300 L920,360 L880,430 L830,470 L760,520 L700,560 L620,610 L520,640 L430,620 L360,650 L270,630 L200,600 L150,540 L170,470 L120,420 L90,340 L110,260 L70,215 L100,200 L62,182 L98,165 L70,148 L104,132 L84,112 Z"/></clipPath>
    <pattern id="shade" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" class="hatch"/></pattern>
    <marker id="wind" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" stroke-width="1.5"/></marker>
  </defs>
  <rect width="1000" height="720" class="sea"/>
  <path class="land" d="M120,90 L220,60 L330,80 L430,55 L560,70 L700,50 L820,85 L900,130 L930,220 L890,300 L920,360 L880,430 L830,470 L760,520 L700,560 L620,610 L520,640 L430,620 L360,650 L270,630 L200,600 L150,540 L170,470 L120,420 L90,340 L110,260 L70,215 L100,200 L62,182 L98,165 L70,148 L104,132 L84,112 Z"/>
  <g clip-path="url(#land)">
    <a href="#hrimheim"><polygon class="rf rf-teal" points="0,0 240,0 190,105 175,335 0,360"/></a>
    <a href="#severya"><polygon class="rf rf-blue" points="240,0 1000,0 1000,255 780,285 560,255 360,250 179,270 190,105"/></a>
    <a href="#cheongun"><polygon class="rf rf-coral" points="780,285 1000,255 1000,560 760,540 750,430 770,330"/></a>
    <a href="#zarqa"><polygon class="rf rf-amber" points="300,430 420,410 540,405 650,420 750,430 760,540 700,720 300,720"/></a>
    <a href="#cascara"><polygon class="rf rf-pink" points="0,360 175,335 230,420 300,430 300,720 0,720"/></a>
  </g>
  <rect x="0" y="380" width="1000" height="170" fill="url(#shade)"/>
  <a href="#silent"><circle cx="470" cy="330" r="74" class="crater"/><circle cx="470" cy="330" r="30" class="crater-in"/></a>
  <a href="#aura"><g class="isle">
    <ellipse cx="790" cy="600" rx="26" ry="12"/><ellipse cx="850" cy="626" rx="18" ry="9"/>
    <ellipse cx="832" cy="578" rx="14" ry="7"/><ellipse cx="890" cy="592" rx="12" ry="6"/>
  </g></a>
  <ellipse cx="42" cy="170" rx="11" ry="6" class="land"/>
  <g class="river">
    <path d="M560,245 C555,200 520,160 540,120 S520,80 515,64"/>
    <path d="M700,245 C710,200 690,160 720,120 S735,70 745,63"/>
    <path d="M480,402 C470,450 450,490 475,530 S505,600 515,637"/>
    <path d="M805,385 C840,380 860,395 900,392"/>
    <path d="M300,470 C260,500 230,540 200,598"/>
  </g>
  <path class="pipe" d="M620,160 L725,150 L835,120"/>
  ${mountains.map(tri).join('')}
  <g class="lat">
    <line x1="0" y1="167" x2="1000" y2="167"/><text x="992" y="161" text-anchor="end">60°N</text>
    <line x1="0" y1="422" x2="1000" y2="422"/><text x="992" y="416" text-anchor="end">30°N</text>
    <line x1="0" y1="677" x2="1000" y2="677"/><text x="992" y="671" text-anchor="end">적도</text>
    <text x="992" y="545" text-anchor="end">관륜 그늘띠 (겨울)</text>
  </g>
  <g class="wind">
    <line x1="18" y1="250" x2="62" y2="250" marker-end="url(#wind)"/><text x="18" y="242">편서풍</text>
    <line x1="984" y1="470" x2="944" y2="470" marker-end="url(#wind)"/><text x="984" y="462" text-anchor="end">무역풍</text>
  </g>
  ${city(108, 190, '스칼드비크', { cap: true })}
  ${city(42, 170, '글라즈헤임 섬', { dy: -10, dx: 0, anchor: 'middle' })}
  ${city(620, 160, '야르-스톨', { cap: true, dy: 20, dx: 0, anchor: 'middle' })}
  ${city(725, 150, '페레발', { dy: 20, dx: 0, anchor: 'middle' })}
  ${city(835, 120, '노릴-9 (첫 작품)', { star: true, dy: -12, dx: 0, anchor: 'middle' })}
  ${city(520, 268, '무음촌')}
  ${city(842, 410, '백령봉', { cap: true })}
  ${city(505, 600, '하산', { cap: true, dx: -9, anchor: 'end' })}
  ${city(205, 588, '카스카라', { cap: true, dx: -9, anchor: 'end' })}
  ${region('hrimheim', 128, 290, '흐림헤임')}
  ${region('severya', 420, 190, '세베랴 연방')}
  ${region('silent', 470, 336, '적막대')}
  ${region('cheongun', 870, 318, '청운국')}
  ${region('zarqa', 600, 500, '자르카 칼리프령')}
  ${region('cascara', 215, 520, '카스카라')}
  ${region('aura', 845, 668, '아우라 부유군도')}
  <text x="300" y="350" class="buffer" text-anchor="middle">완충 지대</text>
  <g class="legend" transform="translate(20,615)">
    <rect width="170" height="92" rx="6"/>
    <path class="mt" d="M12,22 L21,8 L30,22"/><text x="40" y="20">산맥</text>
    <line x1="12" y1="38" x2="30" y2="38" class="river-l"/><text x="40" y="42">강</text>
    <line x1="12" y1="58" x2="30" y2="58" class="pipe"/><text x="40" y="62">세베랴 배관</text>
    <circle cx="21" cy="78" r="5" class="cap"/><text x="40" y="82">수도 · 주요 도시</text>
  </g>
</svg>`;
})();
