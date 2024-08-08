<script lang="ts">
  import type {
    Contributeur,
    IdUtilisateur,
  } from '../tableauDesMesures/tableauDesMesures.d';
  import { createEventDispatcher } from 'svelte';

  export let contributeur: Contributeur;
  export let responsables: IdUtilisateur[];

  const dispatch = createEventDispatcher<{
    modificationResponsables: { responsables: IdUtilisateur[] };
  }>();
  const modifieResponsables = () => {
    if (responsables) dispatch('modificationResponsables', { responsables });
  };
</script>

<div class="conteneur-contributeur">
  <div class="conteneur-nom">
    <span class="initiales">
      {#if contributeur.initiales}
        {contributeur.initiales}
      {:else}
        <img src="/statique/assets/images/icone_utilisateur_trait.svg" alt="" />
      {/if}
    </span>
    <span class="nom-contributeur">{contributeur.prenomNom}</span>
  </div>
  <input
    type="checkbox"
    value={contributeur.id}
    class="checkbox-contributeur"
    bind:group={responsables}
    on:change={modifieResponsables}
  />
</div>

<style>
  .conteneur-contributeur {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 9px 0;
    gap: 4px;
  }

  .conteneur-nom {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .initiales {
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fond-bleu-pale);
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    border-radius: 50%;
  }

  .nom-contributeur {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 224px;
  }

  .checkbox-contributeur {
    margin: 0;
  }
</style>
