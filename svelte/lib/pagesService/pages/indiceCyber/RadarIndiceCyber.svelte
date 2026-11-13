<script lang="ts">
  import { untrack } from 'svelte';
  import type { IdCategorie } from '../../../tableauDesMesures/tableauDesMesures.d';
  import type { DonneesIndiceCyber } from './indiceCyber.types';
  import {
    creeRadar,
    enAttributPoints,
  } from '../../../../../src/geometrie/radar';

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
  const ZOOM_X = -40;
  const ZOOM_Y = -10;
  const DECALLAGE_TEXTE = 5;
  const DECALLAGE_Y_LIBELLE_SOUS_LE_CENTRE = 6;

  const radar = untrack(() =>
    creeRadar({
      taille: TAILLE,
      nombreAxes: Object.keys(indicesCyber).length,
      noteMax,
      ecartDesLibelles: DECALLAGE_TEXTE,
    })
  );
  const [xCentre, yCentre] = radar.centre;

  const format = Intl.NumberFormat('fr', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format;

  const pointsIndiceCyber = $derived(
    radar.pointsDesNotes(Object.values(indicesCyber))
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

  {#each radar.axes as point, index (index)}
    <line
      x1={xCentre}
      y1={yCentre}
      x2={point[0]}
      y2={point[1]}
      stroke="#D9D9D9"
      stroke-width="0.5"
    />
  {/each}

  {#each radar.libelles as { point, alignement, sousLeCentre }, index (index)}
    {@const decallageY = sousLeCentre ? DECALLAGE_Y_LIBELLE_SOUS_LE_CENTRE : 0}
    {@const label = categories[categoriesDeIndiceCyber(index)]}
    <text x={point[0]} y={point[1]} dy={decallageY} text-anchor={alignement}>
      {label}
    </text>
  {/each}

  {#each radar.graduations as { note, rayon, polygone } (note)}
    <polygon
      stroke="#D9D9D9"
      points={enAttributPoints(polygone)}
      stroke-width="0.5"
    />
    {#if note !== 0}
      <text class="echelle" x={xCentre} y={yCentre - rayon} dx={2} dy={2}>
        {note}
      </text>
    {/if}
  {/each}

  <polygon
    stroke="url(#gradient-lineaire-anssi-{idCible})"
    stroke-width="1.5"
    stroke-linejoin="round"
    points={enAttributPoints(pointsIndiceCyber)}
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
