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
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import TroisiemeEtape from './etapes/TroisiemeEtape.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;

  let statutSelectionne: StatutMesure | '' = '';
  let precision: string = '';
  let idsServicesSelectionnes: string[] = [];

  let etapeCourante = 1;

  $: modificationPrecisionUniquement = !statutSelectionne && !!precision;

  let boutonSuivantActif = false;
  $: {
    switch (etapeCourante) {
      case 1:
        boutonSuivantActif = !!statutSelectionne || !!precision;
        break;
      case 2:
        boutonSuivantActif = idsServicesSelectionnes.length > 0;
        break;
      case 3:
        boutonSuivantActif = true;
        break;
    }
  }
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
    <SecondeEtape
      {statuts}
      {mesure}
      {modificationPrecisionUniquement}
      bind:idsServicesSelectionnes
    />
  {:else if etapeCourante === 3}
    <TroisiemeEtape
      {mesure}
      {precision}
      {statuts}
      {statutSelectionne}
      {idsServicesSelectionnes}
    />
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
    actif={boutonSuivantActif}
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
