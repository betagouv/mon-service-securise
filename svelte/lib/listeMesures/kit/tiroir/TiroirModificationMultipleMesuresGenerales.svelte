<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import DescriptionCompleteMesure from '../DescriptionCompleteMesure.svelte';
  import type {
    ModeleMesureGenerale,
    ReferentielStatut,
  } from '../../../ui/types';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import Bouton from '../../../ui/Bouton.svelte';
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import { enregistreModificationMesureSurServicesMultiples } from '../../listeMesures.api';
  import { servicesAvecMesuresAssociees } from '../../stores/servicesAvecMesuresAssociees.store';
  import { modaleRapportStore } from '../../stores/modaleRapport.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import EtapesModificationMultipleStatutPrecision from './etapes/EtapesModificationMultipleStatutPrecision.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  export let modeleMesureGenerale: ModeleMesureGenerale;
  export let statuts: ReferentielStatut;

  let statutSelectionne: StatutMesure | '' = '';
  let precision: string = '';
  let idsServicesSelectionnes: string[] = [];

  let etapeCourante = 1;
  let enCoursEnvoi = false;

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

  const appliqueModifications = async () => {
    enCoursEnvoi = true;
    try {
      await enregistreModificationMesureSurServicesMultiples({
        idMesure: modeleMesureGenerale.id,
        statut: statutSelectionne,
        modalites: precision,
        idsServices: idsServicesSelectionnes,
      });
      tiroirStore.ferme();
      servicesAvecMesuresAssociees.rafraichis();
      modaleRapportStore.affiche({
        champsModifies: [
          ...(statutSelectionne && ['statut']),
          ...(precision && ['modalites']),
        ] as ('statut' | 'modalites')[],
        idServicesModifies: idsServicesSelectionnes,
        modeleMesureGenerale,
      });
    } catch (e) {
      tiroirStore.ferme();
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
    }
  };

  const etapeSuivante = async () => {
    if (etapeCourante < 3) etapeCourante++;
    else await appliqueModifications();
  };
</script>

<ContenuTiroir>
  {#if etapeCourante === 1}
    <div>
      <DescriptionCompleteMesure modeleDeMesure={modeleMesureGenerale} />
      <hr />
    </div>
  {/if}
  <EtapesModificationMultipleStatutPrecision
    {statuts}
    modeleMesure={modeleMesureGenerale}
    bind:statutSelectionne
    bind:precision
    bind:etapeCourante
    bind:idsServicesSelectionnes
  />
</ContenuTiroir>
<ActionsTiroir>
  {#if etapeCourante === 1}
    <Bouton
      type="lien"
      titre="Retour à la liste de mesures"
      on:click={() => tiroirStore.ferme()}
    />
  {:else}
    <Bouton type="lien" titre="Précédent" on:click={() => etapeCourante--} />
  {/if}
  <Bouton
    titre={etapeCourante < 3 ? 'Suivant' : 'Appliquer les modifications'}
    type="primaire"
    actif={boutonSuivantActif}
    {enCoursEnvoi}
    on:click={etapeSuivante}
  />
</ActionsTiroir>
