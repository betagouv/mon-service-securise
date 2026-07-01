const TRANCHES = [
  { min: 0, max: 1, debut: '#A226B8', fin: '#8926C9' },
  { min: 1, max: 2, debut: '#513AC8', fin: '#8C26C7' },
  { min: 2, max: 3, debut: '#326FC0', fin: '#4D3DC5' },
  { min: 3, max: 4, debut: '#54B8F6', fin: '#3479C9' },
  { min: 4, max: 5, debut: '#18EAC4', fin: '#445CDE' },
  { min: 5, max: 6, debut: '#F2CA5A', fin: '#DBAF2C' },
];

const formatte = (n: number) =>
  new Intl.NumberFormat('fr', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);

const cheminCirculaire = (cx: number, cy: number, r: number) =>
  `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;

const cheminDemiCercle = (cx: number, cy: number, r: number) =>
  `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0`;

const SEMI_CERCLE =
  'M8.62501 75C3.86155 75 -0.0512932 71.1255 0.495216 66.3935C2.38075 50.0676' +
  ' 9.59301 34.7226 21.1405 22.8065C34.6992 8.81505 53.1705 0.648978 72.6442 0.0369958C' +
  '92.1179 -0.574987 111.065 6.41514 125.476 19.5277C137.749 30.6952 145.91 45.557' +
  ' 148.817 61.7323C149.66 66.4206 145.998 70.5332 141.244 70.8323C136.49 71.1314' +
  ' 132.458 67.4945 131.455 62.8378C128.935 51.1394 122.822 40.4355 113.866 32.2863C' +
  '102.77 22.1897 88.1808 16.8073 73.186 17.2785C58.1913 17.7497 43.9684 24.0376' +
  ' 33.5282 34.811C25.1017 43.5065 19.6733 54.5731 17.8927 66.4067C17.1839 71.1171' +
  ' 13.3885 75 8.62501 75Z';

const SEGMENTS_JAUGE = `
  <path d="M4.00001 75C1.79087 75 -0.0111169 73.2078 0.106635 71.0018C0.720681 59.4977 3.97735 48.2882 9.62312 38.2459C10.7057 36.3202 13.1875 35.7726 15.0527 36.9563L22.8628 41.9127C24.728 43.0964 25.2671 45.5622 24.2153 47.5049C20.2875 54.7597 17.9594 62.773 17.3885 71.0031C17.2356 73.2069 15.4591 75 13.25 75L4.00001 75Z" fill="#DBECF1"/>
  <path d="M132.44 33.2672C134.227 31.9687 136.739 32.3595 137.94 34.2134C144.205 43.8813 148.159 54.8642 149.495 66.3071C149.751 68.5014 148.065 70.4032 145.86 70.5419L136.628 71.1227C134.423 71.2614 132.538 69.5834 132.247 67.3935C131.16 59.2156 128.334 51.3642 123.958 44.3703C122.786 42.4975 123.17 40.0028 124.957 38.7043L132.44 33.2672Z" fill="#DBECF1"/>
  <path d="M17.5598 33.2672C15.7726 31.9687 15.3681 29.4597 16.7601 27.7442C24.0188 18.7981 33.2423 11.6436 43.7125 6.83771C45.7203 5.91614 48.0499 6.93186 48.8632 8.98586L52.2683 17.5863C53.0816 19.6403 52.0684 21.952 50.0756 22.9055C42.6336 26.466 36.04 31.5805 30.7406 37.9032C29.3215 39.5963 26.8304 40.0028 25.0432 38.7043L17.5598 33.2672Z" fill="#DBECF1"/>
  <path d="M53.0598 7.47498C52.3771 5.37397 53.5247 3.10636 55.6592 2.53666C66.79 -0.434318 78.4573 -0.800971 89.7527 1.46522C91.9187 1.89979 93.2064 4.09086 92.657 6.23059L90.3566 15.19C89.8072 17.3297 87.6287 18.6044 85.4561 18.2044C77.3426 16.7107 69.002 16.9728 60.9983 18.973C58.8551 19.5087 56.6009 18.3733 55.9182 16.2723L53.0598 7.47498Z" fill="#DBECF1"/>
  <path d="M96.9402 7.47499C97.6229 5.37397 99.8842 4.21398 101.946 5.00766C112.697 9.14665 122.352 15.7078 130.158 24.1805C131.655 25.8052 131.409 28.3347 129.706 29.7429L122.579 35.6391C120.877 37.0472 118.365 36.798 116.843 35.1974C111.157 29.2199 104.255 24.5295 96.6042 21.4433C94.5555 20.6168 93.3992 18.3733 94.0818 16.2723L96.9402 7.47499Z" fill="#DBECF1"/>`;

const FLECHE = `
  <path d="M18.2998 66.996C17.8228 66.4304 18.0248 65.5651 18.7029 65.2692L32.4491 59.2711C33.3844 58.863 34.3263 59.8311 33.8927 60.7548L31.2967 66.2846C30.5058 67.9692 30.0781 69.8014 30.0412 71.662L29.9203 77.7697C29.9001 78.7899 28.6268 79.2409 27.9689 78.4608L18.2998 66.996Z" fill="#2F3A43"/>
  <path d="M17.5393 67.6376C16.6337 66.5638 17.0173 64.9208 18.3048 64.359L32.051 58.3609C33.8267 57.586 35.6151 59.4243 34.7918 61.178L32.1958 66.7078C31.4642 68.2663 31.0684 69.9612 31.0343 71.6825L30.9134 77.7901C30.875 79.7271 28.4575 80.5834 27.2085 79.1024L17.5393 67.6376ZM19.0998 66.181C19.0311 66.2109 19.0106 66.2987 19.0589 66.356L28.7281 77.8208C28.7551 77.8529 28.7733 77.8581 28.7822 77.8602C28.7972 77.8639 28.822 77.8646 28.8512 77.8542C28.8805 77.8439 28.8993 77.8277 28.9087 77.8154C28.9142 77.8082 28.9251 77.7927 28.9259 77.7508L29.0469 71.6431C29.0865 69.6431 29.5462 67.6738 30.3963 65.863L32.9923 60.3332C33.0101 60.2953 33.0073 60.2766 33.0055 60.2676C33.0025 60.2525 32.9928 60.2296 32.9712 60.2074C32.9496 60.1852 32.927 60.1748 32.9119 60.1715C32.9031 60.1695 32.8844 60.1661 32.846 60.1828L19.0998 66.181Z" fill="white"/>`;

export function svgIndiceCyber(total: number, noteMax: number): string {
  const idx = TRANCHES.findIndex(({ min, max }) => total >= min && total < max);
  const { debut, fin } = TRANCHES[Math.max(0, idx)] ?? TRANCHES.at(-1)!;

  const rotation = (total / noteMax) * (164 - -13) + -13;
  const progression = (total / noteMax) * 176;

  return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gf" x1="80.0222" y1="29" x2="80.0222" y2="131.044" gradientUnits="userSpaceOnUse">
      <stop stop-color="${debut}"/><stop offset="1" stop-color="${fin}"/>
    </linearGradient>
    <linearGradient id="gp" x1="60.1532" y1="152.01" x2="98.9761" y2="7.12157" gradientUnits="userSpaceOnUse">
      <stop stop-color="${debut}"/><stop offset="1" stop-color="${fin}"/>
    </linearGradient>
    <mask id="mj" maskUnits="userSpaceOnUse" x="0" y="0" width="149" height="75">
      <path d="${SEMI_CERCLE}" fill="white"/>
    </mask>
    <mask id="mp" maskUnits="userSpaceOnUse" x="0" y="0" width="149" height="75">
      <path d="${SEMI_CERCLE}" fill="white"/>
    </mask>
  </defs>
  <circle cx="80" cy="80" r="79" fill="white" stroke="#CECECE" stroke-width="2"/>
  <g mask="url(#mj)" transform="translate(5, 5)">${SEGMENTS_JAUGE}
  </g>
  <circle cx="80" cy="80" r="52.5" fill="url(#gf)"/>
  <text x="105" y="98" fill="white" font-size="24" opacity="0.8">${noteMax}</text>
  <line opacity="0.8" x1="97" y1="100" x2="105" y2="70" stroke="white"/>
  <text x="40" y="90" fill="white" font-size="35" font-weight="bold">${formatte(total)}</text>
  <path id="courbe" d="${cheminCirculaire(80, 80, 72)}"/>
  <text fill="#2f3a43" font-size="18" letter-spacing="3" font-weight="bold">
    <textPath href="#courbe" startOffset="30">INDICE CYBER</textPath>
  </text>
  <g mask="url(#mp)">
    <path d="${cheminDemiCercle(80, 80, 67)}" stroke="url(#gp)" stroke-width="18" transform="rotate(${progression})" transform-origin="80 80"/>
  </g>
  <g transform="rotate(${rotation})" transform-origin="80 80">${FLECHE}
  </g>
</svg>`;
}

export function svgIndiceCyberPersonnalise(
  total: number,
  noteMax: number
): string {
  const taille = 160;
  const nbTraits = 52;
  const radius = 0.85 * (taille / 2);
  const avancement = Math.floor((total / noteMax) * nbTraits);

  const traits = Array.from({ length: avancement }, (_, i) => {
    const angle = (i / nbTraits) * 2 * Math.PI - Math.PI / 2;
    const x = radius * Math.cos(angle) + taille / 2;
    const y = radius * Math.sin(angle) + taille / 2;
    const angleTrait = ((angle + Math.PI / 2) * 180) / Math.PI;
    const t = avancement > 1 ? i / (avancement - 1) : 0;
    const r = Math.round(84 + (8 - 84) * t);
    const g = Math.round(184 + (65 - 184) * t);
    const b = Math.round(246 + (106 - 246) * t);
    return `<g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${angleTrait.toFixed(2)})"><rect x="0" y="0" width="3" height="12" fill="rgb(${r},${g},${b})"/></g>`;
  }).join('');

  return `<svg viewBox="0 0 ${taille} ${taille}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${taille / 2}" cy="${taille / 2}" r="${taille / 2 - 1}" fill="white"/>
  ${traits}
  <text x="35" y="90" fill="#0079D0" font-size="35" font-weight="bold">${formatte(total)}</text>
  <line x1="97" y1="100" x2="105" y2="70" stroke="#0C5C98" stroke-width="2" opacity="0.8"/>
  <text x="105" y="98" fill="#0C5C98" font-size="24" opacity="0.8">${noteMax}</text>
</svg>`;
}
