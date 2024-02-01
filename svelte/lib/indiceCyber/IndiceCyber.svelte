<script lang="ts">
  import MasqueJauge from './svg/MasqueJauge.svelte';
  import Fleche from './svg/Fleche.svelte';
  import { recupereIndiceCyber } from './indiceCyber.api';

  export let indiceCyber: number;

  export let noteMax: number;
  export let idService: string;

  $: indiceCyberFormatte = Intl.NumberFormat('fr', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(indiceCyber);

  const tranchesIndiceCyber = [
    { min: 0, max: 1, gradientDebut: '#A226B8', gradientFin: '#8926C9' },
    { min: 1, max: 2, gradientDebut: '#513AC8', gradientFin: '#8C26C7' },
    { min: 2, max: 3, gradientDebut: '#326FC0', gradientFin: '#4D3DC5' },
    { min: 3, max: 4, gradientDebut: '#54B8F6', gradientFin: '#3479C9' },
    { min: 4, max: 5, gradientDebut: '#18EAC4', gradientFin: '#445CDE' },
    { min: 5, max: 6, gradientDebut: '#F2CA5A', gradientFin: '#DBAF2C' },
  ];
  $: idxInterval = tranchesIndiceCyber.findIndex(
    ({ min, max }) => indiceCyber >= min && indiceCyber < max
  );
  $: gradientDebut = tranchesIndiceCyber[idxInterval].gradientDebut;
  $: gradientFin = tranchesIndiceCyber[idxInterval].gradientFin;

  const [rotationFlecheMin, rotationFlecheMax] = [-13, 164];
  const [progressionJaugeMin, progressionJaugeMax] = [0, 176];
  const DUREE_ANIMATION = '0.3s';

  const cheminCirculaire = (cx: number, cy: number, r: number) =>
    `M ${cx - r}, ${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${
      r * 2
    },0`;
  const cheminDemiCercle = (cx: number, cy: number, r: number) =>
    `M ${cx - r}, ${cy} a ${r},${r} 0 1,0 ${r * 2},0`;
  $: rotationFleche =
    (indiceCyber / noteMax) * (rotationFlecheMax - rotationFlecheMin) +
    rotationFlecheMin;
  $: progressionJauge =
    (indiceCyber / noteMax) * (progressionJaugeMax - progressionJaugeMin) +
    progressionJaugeMin;

  let animationJauge: SVGAnimateTransformElement;
  let animationFleche: SVGAnimateTransformElement;

  const metAJourIndiceCyber = async () => {
    indiceCyber = await recupereIndiceCyber(idService);
    animationJauge?.beginElement();
    animationFleche?.beginElement();
  };
</script>

<svelte:body on:mesure-modifiee={metAJourIndiceCyber} />
<svg
  id="score-indice-cyber"
  viewBox="0 0 160 160"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  filter="drop-shadow(0px 4.6857147216796875px 23.428573608398438px rgba(26, 68, 139, 0.2))"
>
  <g>
    <circle
      cx="80"
      cy="80"
      r="79"
      fill="white"
      stroke="#CECECE"
      stroke-width="2"
    />
    <circle cx="80" cy="80" r="52.5" fill="url(#gradient_fond)" />
    <text
      class="note-max"
      x="105"
      y="98"
      fill="white"
      font-size="1.5em"
      opacity="0.8"
    >
      {noteMax}
    </text>
    <line opacity="0.8" x1="97" y1="100" x2="105" y2="70" stroke="white" />
    <text
      class="indice-cyber"
      x="40"
      y="90"
      fill="white"
      font-size="2.2em"
      font-weight="bold"
    >
      {indiceCyberFormatte}
    </text>
    <path id="courbe-texte-indice-cyber" d={cheminCirculaire(80, 80, 72)} />
    <text
      fill="#2f3a43"
      font-size="1em"
      letter-spacing="3px"
      font-weight="bold"
    >
      <textPath href="#courbe-texte-indice-cyber" startOffset="28">
        INDICE CYBER
      </textPath>
    </text>
    <MasqueJauge />
    <mask id="masque_progression" maskUnits="userSpaceOnUse">
      <MasqueJauge />
    </mask>
    <g mask="url(#masque_progression)">
      <path
        d={cheminDemiCercle(80, 80, 67)}
        stroke="url(#gradient_progression)"
        stroke-width="18"
        transform-origin="80 80"
      >
        <animateTransform
          bind:this={animationJauge}
          attributeName="transform"
          type="rotate"
          from={progressionJaugeMin}
          to={progressionJauge}
          dur={DUREE_ANIMATION}
          fill="freeze"
        />
      </path>
    </g>
    <g transform-origin="80 80">
      <animateTransform
        bind:this={animationFleche}
        attributeName="transform"
        type="rotate"
        from={rotationFlecheMin}
        to={rotationFleche}
        dur={DUREE_ANIMATION}
        fill="freeze"
      />
      <Fleche />
    </g>
  </g>
  <defs>
    <linearGradient
      id="gradient_fond"
      x1="80.0222"
      y1="29"
      x2="80.0222"
      y2="131.044"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stop-color={gradientDebut} />
      <stop offset="1" stop-color={gradientFin} />
    </linearGradient>
    <linearGradient
      id="gradient_progression"
      x1="60.1532"
      y1="152.01"
      x2="98.9761"
      y2="7.12157"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stop-color={gradientDebut} />
      <stop offset="1" stop-color={gradientFin} />
    </linearGradient>
  </defs>
</svg>
