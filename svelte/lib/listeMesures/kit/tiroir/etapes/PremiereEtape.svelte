<script lang="ts">
  import SelectionStatut from '../../../../ui/SelectionStatut.svelte';
  import type { ReferentielStatut } from '../../../../ui/types';
  import ChampDeSaisie from '../../../../ui/ChampDeSaisie.svelte';

  export let statuts: ReferentielStatut;
  export let statutSelectionne: keyof ReferentielStatut | '' = '';
  export let precision: string = '';
</script>

<span class="explications">
  Adaptez le statut et/ou la précision de cette mesure selon vos besoins, puis
  appliquez-les simultanément aux services de votre choix.
</span>
<div>
  <SelectionStatut
    id="configuration-mesure"
    bind:statut={statutSelectionne}
    referentielStatuts={statuts}
    label="Statut de la mesure"
    labelChoixVide="Ne pas modifier le statut"
  />
  {#if statutSelectionne === ''}
    <span class="sans-modification-statut"
      >Le statut de cette mesure ne sera pas modifié</span
    >
  {/if}
</div>
<div>
  <ChampDeSaisie
    bind:contenu={precision}
    label="Précision sur la mesure"
    aideSaisie="Apportez des précisions sur la mesure, ses modalités de mise en oeuvre, etc."
  />
</div>

<style lang="scss">
  .explications {
    color: #3a3a3a;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
    max-width: 500px;
  }

  :global(label[for='statut-configuration-mesure']) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px !important;
  }

  :global(label[for='statut-configuration-mesure'] select) {
    margin-top: 0 !important;
  }

  .sans-modification-statut {
    color: #3a3a3a;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
  }
</style>
