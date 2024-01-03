<script lang="ts">
  export let progression: number;

  const taille = 100;
  const tailleCercle = taille * 0.85;
  const perimetreCercle = 2 * Math.PI * (tailleCercle / 2);
</script>

<div class="conteneur-jauge-progression">
  <div class="cartouche-progression-mesures">des mesures renseignées</div>
  <svg class="jauge-progression-mesures" viewBox="0 0 {taille} {taille}">
    <circle
      cx={taille / 2}
      cy={taille / 2}
      r={tailleCercle / 2}
      fill="white"
      stroke="#DBEEFF"
      stroke-width="4"
    />
    <circle
      cx={taille / 2}
      cy={taille / 2}
      r={tailleCercle / 2}
      fill="none"
      stroke="#0079D0"
      stroke-width="6"
      stroke-linecap="round"
      transform="rotate(90 {taille / 2} {taille / 2})"
      stroke-dasharray="{(progression * perimetreCercle) /
        100} {perimetreCercle}"
    />
    <text
      x={taille / 2}
      y={taille / 2 + 8}
      text-anchor="middle"
      fill="#0C5C98"
      font-weight="bold"
      font-size="{taille * 0.22}px"
    >
      {progression} %
    </text>
  </svg>
</div>

<style>
  .jauge-progression-mesures {
    width: 4.2em;
    height: 4.2em;
  }

  .conteneur-jauge-progression {
    display: flex;
    flex-direction: row;
    gap: 0;
    align-items: center;
    user-select: none;
  }

  .conteneur-jauge-progression .cartouche-progression-mesures {
    border-radius: 8px;
    background: #f1f5f9;
    padding: 8px 12px 8px 68px;
    color: #08416a;
    font-weight: 500;
    white-space: nowrap;
  }

  .conteneur-jauge-progression .jauge-progression-mesures {
    position: absolute;
    left: 5px;
  }
</style>
