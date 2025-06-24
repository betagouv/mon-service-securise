<script lang="ts">
  import SelectionStatut from '../../../../ui/SelectionStatut.svelte';
  import type { ReferentielStatut } from '../../../../ui/types';

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
  <label>
    Précision sur la mesure
    <textarea
      bind:value={precision}
      rows="3"
      placeholder="Apportez des précisions sur la mesure, ses modalités de mise en oeuvre, etc."
    />
  </label>
</div>

<style lang="scss">
  .explications {
    color: #3a3a3a;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
  }

  :global(label[for='statut-configuration-mesure']) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  .sans-modification-statut {
    color: #3a3a3a;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
  }

  textarea {
    width: 100%;
    border: none;
    border-radius: 4px 4px 0 0;
    border-bottom: 2px solid #3a3a3a;
    background: #eee;
    color: #3a3a3a;
    font-family: Marianne;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 8px 16px;
    box-sizing: border-box;
    margin-top: 8px;
  }
</style>
