<script lang="ts">
  import MatriceRisquesV2 from './MatriceRisquesV2.svelte';
</script>

<div class="conteneur">
  <div class="entete">
    <h2>Cartographie des risques usuels</h2>
  </div>
  <div class="conteneur-matrice">
    <MatriceRisquesV2 />
  </div>
</div>

<style lang="scss">
  .conteneur {
    box-shadow: 0 2px 6px 0 rgba(0, 0, 18, 0.16);
    display: flex;
    flex-direction: column;

    h2 {
      width: fit-content;
      margin: 0;
      color: #161616;
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 700;
      line-height: 1.75rem;
    }

    .entete {
      padding: 1rem;
    }

    .conteneur-matrice {
      padding: 1rem;
      display: flex;
      justify-content: center;
    }
  }
</style>
