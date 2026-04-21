<script lang="ts">
  import { untrack } from 'svelte';
  import type { IdCategorie } from '../../../tableauDesMesures/tableauDesMesures.d';
  import type { DonneesIndiceCyber } from './indiceCyber.types';

  interface Props {
    noteMax: number;
    indicesCyber: DonneesIndiceCyber;
    categories: Record<IdCategorie, string>;
  }

  const {
    indicesCyber: indicesCyberAvecTotal,
    noteMax,
    categories,
  }: Props = $props();

  let { total: _, ...indicesCyber } = untrack(() => indicesCyberAvecTotal);

  const TAILLE = 150;
  const CENTRE: [number, number] = [TAILLE / 2, TAILLE / 2];
  const RAYON_MAX = (0.95 * TAILLE) / 2;
  const ZOOM_X = -40;
  const ZOOM_Y = -10;
  const DECALLAGE_TEXTE = 5;
  const ANGLE_ORIGINE = -Math.PI / 2;

  const nbPoints = untrack(() => Object.keys(indicesCyber).length);
  const nbEchelle = untrack(() => noteMax);
  const incrementEchelle = RAYON_MAX / nbEchelle;

  const polaireVersCartesien = (
    r: number,
    theta: number,
    i: number
  ): [number, number] => [
    r * Math.cos(i * theta + ANGLE_ORIGINE) + CENTRE[0],
    r * Math.sin(i * theta + ANGLE_ORIGINE) + CENTRE[1],
  ];

  const generePoints = (radius: number, n: number): [number, number][] => {
    const theta = (2 * Math.PI) / n;
    return Array.from({ length: n }, (_, i) =>
      polaireVersCartesien(radius, theta, i)
    );
  };

  const generePointsValeur = (
    indices: number[],
    max: number
  ): [number, number][] => {
    const theta = (2 * Math.PI) / indices.length;
    return indices.map((indice, idx) =>
      polaireVersCartesien((indice / max) * RAYON_MAX, theta, idx)
    );
  };

  const tableauVersPointsPolygone = (array: [number, number][]): string =>
    array.map((c) => c.join(' ')).join(' ');

  const angleVersPointAncrage = (angle: number): 'middle' | 'end' | 'start' => {
    if (angle > 320 || angle < 40 || (angle > 140 && angle < 220))
      return 'middle';
    if (angle > 140) return 'end';
    return 'start';
  };

  const format = Intl.NumberFormat('fr', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format;

  const rayons = Array.from(
    { length: nbEchelle + 1 },
    (_, i) => i * incrementEchelle
  );
  const pointsIndiceCyber = $derived(
    generePointsValeur(Object.values(indicesCyber), noteMax)
  );
  const pointsToile = $derived(generePoints(RAYON_MAX, nbPoints));
  const pointsLabels = $derived(
    generePoints(RAYON_MAX + DECALLAGE_TEXTE, nbPoints)
  );
  const idCible = Math.floor(Math.random() * 1_000_000);

  const categoriesDeIndiceCyber = (index: number) =>
    Object.keys(indicesCyber)[index] as keyof typeof indicesCyber;
</script>

<svg
  class="radar-indice-cyber"
  width={TAILLE}
  height={TAILLE}
  viewBox="{ZOOM_X} {ZOOM_Y} {TAILLE + Math.abs(ZOOM_X * 2)} {TAILLE +
    Math.abs(ZOOM_Y * 2)}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient
      id="gradient-lineaire-anssi-{idCible}"
      x1={TAILLE / 2}
      y1="0"
      x2={TAILLE / 2}
      y2={TAILLE}
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#54B8F6" />
      <stop offset="1" stop-color="#3479C9" />
    </linearGradient>

    <linearGradient
      id="gradient-lineaire-point-{idCible}"
      gradientTransform="rotate(90)"
    >
      <stop offset="0%" stop-color="#54B8F6" />
      <stop offset="100%" stop-color="#3479C9" />
    </linearGradient>
  </defs>

  {#each pointsToile as point, index (index)}
    <line
      x1={CENTRE[0]}
      y1={CENTRE[1]}
      x2={point[0]}
      y2={point[1]}
      stroke="#D9D9D9"
      stroke-width="0.5"
    />
  {/each}

  {#each pointsLabels as point, index (index)}
    {@const angle = index * (360 / nbPoints)}
    {@const pointAncrage = angleVersPointAncrage(angle)}
    {@const decallageY = angle > 90 && angle < 270 ? 6 : 0}
    {@const label = categories[Object.keys(indicesCyber)[index]]}
    <text x={point[0]} y={point[1]} dy={decallageY} text-anchor={pointAncrage}>
      {label}
    </text>
  {/each}

  {#each rayons as radius, index (index)}
    <polygon
      stroke="#D9D9D9"
      points={tableauVersPointsPolygone(generePoints(radius, nbPoints))}
      stroke-width="0.5"
    />
    {#if index !== 0}
      <text class="echelle" x={CENTRE[0]} y={CENTRE[1] - radius} dx={2} dy={2}>
        {index}
      </text>
    {/if}
  {/each}

  <polygon
    stroke="url(#gradient-lineaire-anssi-{idCible})"
    stroke-width="1.5"
    stroke-linejoin="round"
    points={tableauVersPointsPolygone(pointsIndiceCyber)}
  />

  {#each pointsIndiceCyber as point, index (index)}
    {@const valeur = format(indicesCyber[categoriesDeIndiceCyber(index)])}
    {@const [x, y] = point}
    <g class="zone-hover-point-radar">
      <g class="fond-zone-hover">
        <rect
          x={x - 5}
          y={y - 6}
          fill="white"
          width={22}
          height={12}
          rx={6}
          ry={10}
        />
        <text x={x + 4} y={y + 2} fill="#2F3A43" font-weight="bold"
          >{valeur}</text
        >
      </g>
      <circle cx={x} cy={y} r={4} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={2}
        fill="url(#gradient-lineaire-point-{idCible})"
      />
    </g>
  {/each}
</svg>

<style lang="scss">
  .radar-indice-cyber {
    width: 100%;
    height: 260px;

    text {
      fill: #667892;
      font-size: 0.6em;

      &.echelle {
        font-size: 0.5em;
        fill: black;
      }
    }
  }

  .zone-hover-point-radar {
    opacity: 0;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    text {
      font-size: 0.5em;
    }

    .fond-zone-hover {
      filter: drop-shadow(0 0 2px rgba(26, 68, 139, 0.2));
    }
  }
</style>
