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
  import PorteursSinguliersMesure from '../../kit/PorteursSinguliersMesure.svelte';
  import { untrack } from 'svelte';
  import EnteteTiroir from './EnteteTiroir.svelte';

  interface Props {
    modeleMesureGenerale: ModeleMesureGenerale;
    statuts: ReferentielStatut;
  }

  let { modeleMesureGenerale, statuts }: Props = $props();

  const modeleInitial = untrack(() => modeleMesureGenerale);
  export const titre: string = modeleInitial.description;
  export const composantEntete = EnteteTiroir;
  export const propsComposantEntete = {
    referentiel: modeleInitial.referentiel,
    categorie: modeleInitial.categorie,
    thematique: modeleInitial.thematique,
    identifiantNumerique: modeleInitial.identifiantNumerique,
  };
  export const taille = 'large';

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
    donnees: DonneesModificationAAppliquer
  ) => {
    enCoursEnvoi = true;
    try {
      const { idsServices, modalites, statut } = donnees;
      await enregistreModificationMesureGeneraleSurServicesMultiples({
        idMesure: modeleMesureGenerale.id,
        statut,
        modalites,
        idsServices,
        version: modeleMesureGenerale.versionReferentiel,
      });
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
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
      tiroirStore.ferme();
    }
  };

  let elementEtapesModification:
    | EtapesModificationMultipleStatutPrecision
    | undefined = $state();

  let tabActive = $state(0);
  const configurationsTabs = [
    { id: 'configuration-mesure', label: 'Configurer la mesure' },
    { id: 'informations-mesure', label: 'Informations sur la mesure' },
  ];
</script>

<ContenuTiroir>
  <dsfr-tabs
    tabs={configurationsTabs}
    active-tab-index={tabActive}
    ontabchanged={(e: CustomEvent<{ index: number }>) => {
      tabActive = e.detail.index;
    }}
  >
    <div slot="panel-1" class="conteneur-onglet">
      <EtapesModificationMultipleStatutPrecision
        bind:this={elementEtapesModification}
        bind:etapeCourante
        bind:boutonSuivantActif
        {statuts}
        {servicesAssocies}
        onModificationAAppliquer={appliqueModifications}
      />
    </div>
    <div slot="panel-2" class="conteneur-onglet">
      <div>
        <DescriptionCompleteMesure modeleDeMesure={modeleMesureGenerale} />
        {#if modeleMesureGenerale.porteursSinguliers}
          <PorteursSinguliersMesure
            porteursSinguliers={modeleMesureGenerale.porteursSinguliers}
          />
        {/if}
      </div>
    </div>
  </dsfr-tabs>
</ContenuTiroir>
<ActionsTiroir>
  {#if etapeCourante === 1 || tabActive === 1}
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
  {#if tabActive === 0}
    <Bouton
      titre={etapeCourante < 3 ? 'Suivant' : 'Appliquer les modifications'}
      type="primaire"
      actif={boutonSuivantActif}
      {enCoursEnvoi}
      onclick={() => elementEtapesModification?.etapeSuivante()}
    />
  {/if}
</ActionsTiroir>

<style lang="scss">
  .conteneur-onglet {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
