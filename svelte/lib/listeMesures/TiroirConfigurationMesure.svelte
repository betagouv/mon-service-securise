<script lang="ts">
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';
  import type { MesureReferentiel, ReferentielStatut } from '../ui/types';
  import EtapierTiroir from './EtapierTiroir.svelte';
  import SelectionStatut from '../ui/SelectionStatut.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import Lien from '../ui/Lien.svelte';
  import ActionsTiroir from '../ui/tiroirs/ActionsTiroir.svelte';
  import Bouton from '../ui/Bouton.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;

  let statutSelectionne: keyof ReferentielStatut | '' = '';
  let precision: string = '';
</script>

<ContenuTiroir>
  <div>
    <DescriptionCompleteMesure {mesure} />
    <hr />
  </div>
  <EtapierTiroir etapeCourante={1} />
  <hr />
  <span class="explications"
    >Adaptez le statut et/ou la précision de cette mesure selon vos besoins,
    puis appliquez-les simultanément aux services de votre choix.</span
  >
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
</ContenuTiroir>
<ActionsTiroir>
  <Bouton
    type="lien"
    titre="Retour à la liste de mesure"
    on:click={() => tiroirStore.ferme()}
  />
  <Bouton
    titre="Suivant"
    type="primaire"
    actif={!!statutSelectionne || !!precision}
  />
</ActionsTiroir>

<style lang="scss">
  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }

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
