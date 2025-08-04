<script context="module" lang="ts">
  export type ServiceAssocie = Omit<
    ServiceAvecMesuresAssociees,
    'mesuresAssociees'
  > & {
    mesure: PersonnalisationMesure;
  };
</script>

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
  import { enregistreModificationMesureGeneraleSurServicesMultiples } from '../../listeMesures.api';
  import { servicesAvecMesuresAssociees } from '../../stores/servicesAvecMesuresAssociees.store';
  import { modaleRapportStore } from '../../stores/modaleRapport.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import EtapesModificationMultipleStatutPrecision, {
    type DonneesModificationAAppliquer,
  } from './etapes/EtapesModificationMultipleStatutPrecision.svelte';
  import { mesuresAvecServicesAssociesStore } from '../../stores/mesuresAvecServicesAssocies.store';
  import type {
    PersonnalisationMesure,
    ServiceAvecMesuresAssociees,
  } from '../../listeMesures.d';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  export let modeleMesureGenerale: ModeleMesureGenerale;
  export let statuts: ReferentielStatut;

  let etapeCourante = 1;
  let enCoursEnvoi = false;

  let boutonSuivantActif = false;

  let servicesAssocies: ServiceAssocie[] = [];
  $: servicesAssocies =
    modeleMesureGenerale &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[
          modeleMesureGenerale.id
        ].includes(s?.id);
      })
      .map(({ mesuresAssociees, ...autresDonnees }) => ({
        mesure: mesuresAssociees[modeleMesureGenerale.id],
        ...autresDonnees,
      }));

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
      });
      tiroirStore.ferme();
      servicesAvecMesuresAssociees.rafraichis();
      modaleRapportStore.affiche({
        champsModifies: [
          ...(statut && ['statut']),
          ...(modalites && ['modalites']),
        ] as ('statut' | 'modalites')[],
        idServicesModifies: idsServices,
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

  let elementEtapesModification: EtapesModificationMultipleStatutPrecision;
</script>

<ContenuTiroir>
  {#if etapeCourante === 1}
    <div>
      <DescriptionCompleteMesure modeleDeMesure={modeleMesureGenerale} />
      <hr />
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
      on:click={() => tiroirStore.ferme()}
    />
  {:else}
    <Bouton
      type="lien"
      titre="Précédent"
      on:click={() => elementEtapesModification.etapePrecedente()}
    />
  {/if}
  <Bouton
    titre={etapeCourante < 3 ? 'Suivant' : 'Appliquer les modifications'}
    type="primaire"
    actif={boutonSuivantActif}
    {enCoursEnvoi}
    on:click={() => elementEtapesModification.etapeSuivante()}
  />
</ActionsTiroir>

<style lang="scss">
  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }
</style>
