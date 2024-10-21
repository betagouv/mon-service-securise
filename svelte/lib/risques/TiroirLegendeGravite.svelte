<script lang="ts">
  import type { ReferentielGravites } from './risques.d';

  export let ouvert = true;
  export let referentielGravites: ReferentielGravites;

  const fermeTiroir = () => {
    ouvert = false;
  };
</script>

<div class="tiroir" class:ouvert>
  <div class="entete-tiroir">
    <div>
      <h2 class="titre-tiroir-legende">Comprendre les 5 niveaux de gravité</h2>
    </div>
    <button class="fermeture" on:click={fermeTiroir}>✕</button>
  </div>
  <div class="contenu-legende-gravite">
    <h3>Découvrez les 5 niveaux définis par l'ANSSI.</h3>
    {#each Array(5) as _, index (index)}
      {@const [id, niveauGravite] = Object.entries(referentielGravites).filter(
        ([id, niveau]) => niveau.position === 4 - index
      )[0]}
      <div>
        <h4>
          <span class={`badge-niveau niveau-gravite ${id}`}
            >{niveauGravite.position}</span
          >
          {niveauGravite.description}
        </h4>
        <span>
          {niveauGravite.descriptionLongue}
        </span>
      </div>
    {/each}
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

  .badge-niveau {
    margin-right: 8px;
    display: inline-block;
    color: white;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .niveau-gravite.nonConcerne {
    background: var(--liseres-fonce);
  }

  .niveau-gravite.minime {
    background: var(--bleu-mise-en-avant);
  }

  .niveau-gravite.significatif {
    background: var(--bleu-survol);
  }

  .niveau-gravite.grave {
    background: var(--bleu-anssi);
  }

  .niveau-gravite.critique {
    background: black;
  }

  h4 {
    margin: 0 0 8px;
  }

  h3 {
    margin: 0;
    line-height: 1.375rem;
    font-size: 1rem;
  }

  .ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    background: #f1f5f9;
    text-align: left;
    padding: 32px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .fermeture {
    font-weight: bold;
    background: none;
    width: 2em;
    height: 2em;
    cursor: pointer;
    border: none;
  }

  .titre-tiroir-legende {
    font-size: 1.625rem;
    margin: 0;
  }

  .contenu-legende-gravite {
    text-align: left;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
  }
</style>
