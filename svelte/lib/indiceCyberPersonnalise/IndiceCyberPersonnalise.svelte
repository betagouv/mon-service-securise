<script lang="ts">
  export let indiceCyberPersonnalise: number;
  export let noteMax: number;

  $: indiceCyberFormatte = Intl.NumberFormat('fr', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(indiceCyberPersonnalise);

  const taille = 160;
  const nbTraits = 52;
  const largeurRectangle = 3;
  const hauteurRectangle = 12;
  const radius = 0.85 * (taille / 2);

  const avancement = Math.floor((indiceCyberPersonnalise / noteMax) * nbTraits);
</script>

<svg
  id="score-indice-cyber-personnalise"
  viewBox="0 0 {taille} {taille}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  filter="drop-shadow(0px 4.6857147216796875px 23.428573608398438px rgba(26, 68, 139, 0.2))"
>
  <circle cx={taille / 2} cy={taille / 2} r={taille / 2 - 1} fill="white" />
  <text
    x="35"
    y="90"
    fill="#0079D0"
    font-size="2.2em"
    font-weight="bold"
    class="indice-cyber-personnalise"
  >
    {indiceCyberFormatte}
  </text>
  <line
    x1="97"
    y1="100"
    x2="105"
    y2="70"
    stroke="#0C5C98"
    stroke-width="2"
    opacity="0.8"
  />
  <text x="105" y="98" fill="#0C5C98" font-size="1.5em" opacity="0.8">
    {noteMax}
  </text>
  <foreignObject x="0" y="0" width={taille} height={taille} mask="url(#masque)">
    <div class="gradient" xmlns="http://www.w3.org/1999/xhtml"></div>
  </foreignObject>
  <mask id="masque">
    {#each new Array(avancement).fill(0) as _, i}
      {@const angle = (i / nbTraits) * 2 * Math.PI - Math.PI / 2}
      {@const x = radius * Math.cos(angle) + taille / 2}
      {@const y = radius * Math.sin(angle) + taille / 2}
      {@const angleTrait = ((angle + Math.PI / 2) * 180) / Math.PI}
      <g
        transform="translate({x}, {y}) rotate({angleTrait})"
        filter="url(#ombre)"
      >
        <rect
          x="0"
          y="0"
          width={largeurRectangle}
          height={hauteurRectangle}
          filter="url(#ombre)"
          fill="white"
        />
      </g>
    {/each}
  </mask>
</svg>

<style>
  svg {
    width: 100%;
  }

  .gradient {
    width: 100%;
    height: 100%;
    background-image: conic-gradient(
      from 122.78deg at 50% 50%,
      #54b8f6 -141.68deg,
      #08416a 103.92deg,
      #54b8f6 141.72deg,
      #54b8f6 218.32deg,
      #08416a 463.92deg
    );
    transform: rotate(90deg);
  }
</style>
