<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import DescriptionCompleteMesure from '../DescriptionCompleteMesure.svelte';
  import type { MesureReferentiel, ReferentielStatut } from '../../../ui/types';
  import EtapierTiroir from './EtapierTiroir.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import Bouton from '../../../ui/Bouton.svelte';
  import PremiereEtape from './etapes/PremiereEtape.svelte';
  import SecondeEtape from './etapes/SecondeEtape.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;

  let statutSelectionne: keyof ReferentielStatut | '' = '';
  let precision: string = '';

  let etapeCourante = 1;

  $: modificationPrecisionUniquement = !statutSelectionne && !!precision;
</script>

<ContenuTiroir>
  {#if etapeCourante === 1}
    <div>
      <DescriptionCompleteMesure {mesure} />
      <hr />
    </div>
  {/if}
  <EtapierTiroir {etapeCourante} />
  <hr />
  {#if etapeCourante === 1}
    <PremiereEtape {statuts} bind:statutSelectionne bind:precision />
  {:else if etapeCourante === 2}
    <SecondeEtape {statuts} {mesure} {modificationPrecisionUniquement} />
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  {#if etapeCourante === 1}
    <Bouton
      type="lien"
      titre="Retour à la liste de mesure"
      on:click={() => tiroirStore.ferme()}
    />
  {:else}
    <Bouton type="lien" titre="Précédent" on:click={() => etapeCourante--} />
  {/if}
  <Bouton
    titre="Suivant"
    type="primaire"
    actif={!!statutSelectionne || !!precision}
    on:click={() => etapeCourante++}
  />
</ActionsTiroir>

<style lang="scss">
  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }
</style>
