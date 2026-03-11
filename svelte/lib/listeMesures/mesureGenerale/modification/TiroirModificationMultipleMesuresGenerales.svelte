<script module lang="ts">
  import type {
    PersonnalisationMesure,
    ServiceAvecMesuresAssociees,
  } from '../../listeMesures.d';

  export type ServiceAssocie = Omit<
    ServiceAvecMesuresAssociees,
    'mesuresAssociees'
  > & {
    mesure: PersonnalisationMesure;
  };
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import DescriptionCompleteMesure from '../../kit/DescriptionCompleteMesure.svelte';
  import type {
    ModeleMesureGenerale,
    ReferentielStatut,
  } from '../../../ui/types';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import Bouton from '../../../ui/Bouton.svelte';
  import { enregistreModificationMesureGeneraleSurServicesMultiples } from '../../listeMesures.api';
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';
  import { modaleRapportStore } from '../../modificationStatutPrecision/rapport/modaleRapport.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import EtapesModificationMultipleStatutPrecision, {
    type DonneesModificationAAppliquer,
  } from '../../modificationStatutPrecision/etapes/EtapesModificationMultipleStatutPrecision.svelte';
  import { mesuresAvecServicesAssociesStore } from '../../servicesAssocies/mesuresAvecServicesAssocies.store';
  import SeparateurHorizontal from '../../../ui/SeparateurHorizontal.svelte';
  import PorteursSinguliersMesure from '../../kit/PorteursSinguliersMesure.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  interface Props {
    modeleMesureGenerale: ModeleMesureGenerale;
    statuts: ReferentielStatut;
  }

  let { modeleMesureGenerale, statuts }: Props = $props();

  let etapeCourante = $state(1);
  let enCoursEnvoi = $state(false);

  let boutonSuivantActif = $state(false);

  let servicesAssocies: ServiceAssocie[] = $derived(
    (modeleMesureGenerale &&
      $servicesAvecMesuresAssociees
        .filter((s) => {
          return $mesuresAvecServicesAssociesStore[
            modeleMesureGenerale.id
          ].includes(s?.id);
        })
        .map(({ mesuresAssociees, ...autresDonnees }) => ({
          mesure: mesuresAssociees[modeleMesureGenerale.id],
          ...autresDonnees,
        }))) ||
      []
  );

  const appliqueModifications = async (
    e: CustomEvent<DonneesModificationAAppliquer>
  ) => {
    enCoursEnvoi = true;
    try {
      const { idsServices, modalites, statut } = e.detail;
      await enregistreModificationMesureGeneraleSurServicesMultiples({
        idMesure: modeleMesureGenerale.id,
        statut,
        modalites,
        idsServices,
        version: modeleMesureGenerale.versionReferentiel,
      });
      tiroirStore.ferme();
      await servicesAvecMesuresAssociees.rafraichis();
      modaleRapportStore.affiche({
        champsModifies: [
          ...(statut && ['statut']),
          ...(modalites && ['modalites']),
        ] as ('statut' | 'modalites')[],
        idServicesModifies: idsServices,
        modeleMesureGenerale,
      });
    } catch {
      tiroirStore.ferme();
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
    }
  };

  let elementEtapesModification:
    | EtapesModificationMultipleStatutPrecision
    | undefined = $state();
</script>

<ContenuTiroir>
  {#if etapeCourante === 1}
    <div>
      <DescriptionCompleteMesure modeleDeMesure={modeleMesureGenerale} />
      {#if modeleMesureGenerale.porteursSinguliers}
        <PorteursSinguliersMesure
          porteursSinguliers={modeleMesureGenerale.porteursSinguliers}
        />
      {/if}
      <SeparateurHorizontal />
    </div>
  {/if}
  <EtapesModificationMultipleStatutPrecision
    bind:this={elementEtapesModification}
    bind:etapeCourante
    bind:boutonSuivantActif
    {statuts}
    {servicesAssocies}
    on:modification-a-appliquer={appliqueModifications}
  />
</ContenuTiroir>
<ActionsTiroir>
  {#if etapeCourante === 1}
    <Bouton
      type="lien"
      titre="Retour à la liste de mesures"
      onclick={() => tiroirStore.ferme()}
    />
  {:else}
    <Bouton
      type="lien"
      titre="Précédent"
      onclick={() => elementEtapesModification?.etapePrecedente()}
    />
  {/if}
  <Bouton
    titre={etapeCourante < 3 ? 'Suivant' : 'Appliquer les modifications'}
    type="primaire"
    actif={boutonSuivantActif}
    {enCoursEnvoi}
    onclick={() => elementEtapesModification?.etapeSuivante()}
  />
</ActionsTiroir>
