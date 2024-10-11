<script lang="ts">
  import CartoucheReferentiel from './CartoucheReferentiel.svelte';
  import { Referentiel } from './types.d';
  import CartoucheIdentifiantRisque from './CartoucheIdentifiantRisque.svelte';

  export let ouvert = true;
</script>

<div class="tiroir" class:ouvert>
  <div class="entete-tiroir">
    <div>
      <h3>Risque</h3>
      <h2 class="titre-tiroir">Titre du tiroir</h2>
      <div class="badges">
        <CartoucheIdentifiantRisque identifiant="Risque 1 (R1)" />
        <CartoucheReferentiel referentiel={Referentiel.ANSSI} />
      </div>
    </div>
    <button class="fermeture" on:click={() => (ouvert = false)}>✕</button>
  </div>
</div>

<style>
  .tiroir {
    height: 100%;
    min-width: 650px;
    max-width: 650px;
    position: fixed;
    left: 100vw;
    top: 0;
    overflow-y: scroll;
    transition: transform 0.2s ease-in-out;
    box-shadow: -10px 0 34px 0 #00000026;
    background: #fff;
    visibility: hidden;
    z-index: 20;
    display: flex;
    flex-direction: column;
  }

  .ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    background: #dbeeff;
    text-align: left;
    padding: 32px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .titre-tiroir {
    font-size: 1.625rem;
    margin: 0;
    padding-top: 7px;
  }

  .fermeture {
    font-weight: bold;
    background: none;
    width: 2em;
    height: 2em;
    cursor: pointer;
    border: none;
  }

  h3 {
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.375rem;
    color: var(--gris-fonce);
    margin: 0;
  }

  .badges {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
</style>
