<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { ListeMesuresProps } from '../../listeMesures.d';
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../../ui/Onglets.svelte';
  import InformationsModeleMesureSpecifique from '../InformationsModeleMesureSpecifique.svelte';
  import type {
    ModeleMesureSpecifique,
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../../ui/types.d';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import ServicesAssociesModeleMesureSpecifique from '../ServicesAssociesModeleMesureSpecifique.svelte';
  import {
    associeServicesModeleMesureSpecifique,
    enregistreModificationMesuresSpecifiquesSurServicesMultiples,
    sauvegardeModeleMesureSpecifique,
  } from '../../listeMesures.api';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import { modelesMesureSpecifique } from '../../../ui/stores/modelesMesureSpecifique.store';
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';
  import Avertissement from '../../../ui/Avertissement.svelte';
  import Lien from '../../../ui/Lien.svelte';
  import Bouton from '../../../ui/Bouton.svelte';
  import EtapesModificationMultipleStatutPrecision, {
    type DonneesModificationAAppliquer,
  } from '../../modificationStatutPrecision/etapes/EtapesModificationMultipleStatutPrecision.svelte';
  import type { ServiceAssocie } from '../../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import { modaleRapportStore } from '../../modificationStatutPrecision/rapport/modaleRapport.store';
  import ConfirmationModificationModeleMesureSpecifique from '../modification/ConfirmationModificationModeleMesureSpecifique.svelte';
  import TiroirSuppressionModeleMesureSpecifique from '../suppression/TiroirSuppressionModeleMesureSpecifique.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  let idsServicesSelectionnes: string[] = $state([]);

  let etapeStatutEtPrecision: 1 | 2 | 3 = $state(1);
  let etapeServicesAssocies: 1 | 2 = $state(1);
  let etapeInformations: 1 | 2 = $state(1);

  const metEnAvantMesureApresModification = () => {
    modaleRapportStore.metEnAvantMesureApresModification(modeleMesure.id);
  };

  const appliqueModifications = async (
    e: CustomEvent<DonneesModificationAAppliquer>
  ) => {
    enCoursDenvoi = true;
    try {
      const { idsServices, modalites, statut } = e.detail;
      await enregistreModificationMesuresSpecifiquesSurServicesMultiples({
        idModele: modeleMesure.id,
        statut,
        modalites,
        idsServices,
      });
      tiroirStore.ferme();
      await servicesAvecMesuresAssociees.rafraichis();
      const pluriel = idsServices.length > 1 ? 's' : '';
      toasterStore.succes(
        `Mesure${pluriel} modifiée${pluriel} avec succès !`,
        `Vous avez modifié la mesure ${modeleMesure.description} sur ${idsServices.length} service${pluriel}.`
      );
      metEnAvantMesureApresModification();
    } catch {
      tiroirStore.ferme();
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };

  interface Props {
    statuts: ReferentielStatut;
    categories: ListeMesuresProps['categories'];
    modeleMesure: ModeleMesureSpecifique;
    referentielTypesService: ReferentielTypesService;
    ongletActif?: 'info' | 'servicesAssocies' | 'statut-precision';
  }

  let {
    statuts,
    categories,
    modeleMesure = $bindable(),
    referentielTypesService,
    ongletActif = $bindable('servicesAssocies'),
  }: Props = $props();

  let donneesModeleMesureEdite = $state(structuredClone(modeleMesure));
  let mesureAEteEditee = $derived(
    modeleMesure.description !== donneesModeleMesureEdite.description ||
      modeleMesure.descriptionLongue !==
        donneesModeleMesureEdite.descriptionLongue ||
      modeleMesure.categorie !== donneesModeleMesureEdite.categorie
  );

  let formulaireValide = $derived(
    !!donneesModeleMesureEdite.description &&
      !!donneesModeleMesureEdite.categorie
  );

  let servicesAssocies: ServiceAssocie[] = $state([]);
  run(() => {
    servicesAssocies =
      modeleMesure &&
      $servicesAvecMesuresAssociees
        .filter((s) => modeleMesure.idsServicesAssocies.includes(s.id))
        .map((s) => {
          const mesureSpecifique = s!.mesuresSpecifiques.find(
            (ms) => ms.idModele === modeleMesure.id
          );
          return {
            ...s,
            mesure: {
              statut: mesureSpecifique?.statut,
              modalites: mesureSpecifique?.modalites,
            },
          };
        });
  });

  let enCoursDenvoi = $state(false);

  let boutonSuivantActif = $state(false);

  const associeServices = async () => {
    enCoursDenvoi = true;
    try {
      await associeServicesModeleMesureSpecifique(
        donneesModeleMesureEdite.id,
        idsServicesSelectionnes
      );
      await servicesAvecMesuresAssociees.rafraichis();
      await modelesMesureSpecifique.rafraichis();
      modeleMesure = $modelesMesureSpecifique.find(
        (m) => m.id === modeleMesure.id
      )!;
      toasterStore.succes(
        'Succès',
        `${
          idsServicesSelectionnes.length === 1
            ? 'Le service a été associé'
            : 'Les services ont été associés'
        } à la mesure`
      );
      etapeServicesAssocies = 1;
      idsServicesSelectionnes = [];
      metEnAvantMesureApresModification();
    } catch {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };

  const sauvegardeInformations = async () => {
    enCoursDenvoi = true;
    try {
      await sauvegardeModeleMesureSpecifique(donneesModeleMesureEdite);
      await modelesMesureSpecifique.rafraichis();
      tiroirStore.ferme();
      toasterStore.succes(
        'Succès',
        'Les informations de la mesure ont été mises à jour'
      );
      metEnAvantMesureApresModification();
    } catch {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };

  run(() => {
    if (ongletActif) {
      etapeServicesAssocies = 1;
      etapeStatutEtPrecision = 1;
      etapeInformations = 1;
    }
  });

  let elementEtapesModification:
    | EtapesModificationMultipleStatutPrecision
    | undefined = $state();
</script>

<ContenuTiroir>
  <Onglets
    onglets={[
      { id: 'info', label: 'Informations' },
      {
        id: 'servicesAssocies',
        label: 'Services associés',
        badge: modeleMesure.idsServicesAssocies.length,
      },
      { id: 'statut-precision', label: 'Statut et précision' },
    ]}
    bind:ongletActif
    sansBordureEnBas={true}
  />
  {#if ongletActif === 'info'}
    {#if etapeInformations === 1}
      <InformationsModeleMesureSpecifique
        {categories}
        bind:donneesModeleMesure={donneesModeleMesureEdite}
      />
    {:else}
      <ConfirmationModificationModeleMesureSpecifique
        {modeleMesure}
        {referentielTypesService}
      />
    {/if}
  {:else if ongletActif === 'servicesAssocies'}
    {#if $servicesAvecMesuresAssociees.length === 0}
      <Avertissement niveau="info">
        <div class="info-pas-de-service">
          <p>
            Vous devez d’abord ajouter un/des service(s) afin de les associer à
            cette mesure depuis le tableau de bord.
          </p>
          <div class="retour-tableau-de-bord">
            <Lien
              type="bouton-secondaire"
              href="/tableauDeBord"
              titre="Retourner au tableau de bord"
            />
          </div>
        </div>
      </Avertissement>
    {:else}
      <ServicesAssociesModeleMesureSpecifique
        {modeleMesure}
        {referentielTypesService}
        bind:etapeActive={etapeServicesAssocies}
        bind:idsServicesSelectionnes
      />
    {/if}
  {:else if ongletActif === 'statut-precision'}
    {#if modeleMesure.idsServicesAssocies.length === 0}
      <Avertissement niveau="info">
        <div class="info-pas-de-service">
          <p>
            Vous devez d’abord associer des services pour modifier le statut et/
            ou la précision.
          </p>
          <div class="retour-onglet-services">
            <Bouton
              onclick={() => (ongletActif = 'servicesAssocies')}
              type="secondaire"
              titre="Associer des services"
            />
          </div>
        </div>
      </Avertissement>
    {:else}
      <EtapesModificationMultipleStatutPrecision
        bind:this={elementEtapesModification}
        bind:etapeCourante={etapeStatutEtPrecision}
        bind:boutonSuivantActif
        {statuts}
        {servicesAssocies}
        on:modification-a-appliquer={appliqueModifications}
      />
    {/if}
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  {#if ongletActif === 'servicesAssocies'}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      variante="tertiaire-sans-bordure"
      taille="md"
      titre="Annuler"
      onclick={() => tiroirStore.ferme()}
    ></lab-anssi-bouton>
  {/if}
  {#if ongletActif === 'info'}
    {#if etapeInformations === 1}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        variante="tertiaire-sans-bordure"
        taille="md"
        titre="Supprimer la mesure"
        icone="delete-line"
        position-icone="gauche"
        onclick={() =>
          tiroirStore.afficheContenu(TiroirSuppressionModeleMesureSpecifique, {
            statuts,
            modeleMesure,
          })}
      ></lab-anssi-bouton>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        position-icone="gauche"
        onclick={async () => {
          if (servicesAssocies.length === 0) {
            await sauvegardeInformations();
          } else {
            etapeInformations = 2;
          }
        }}
        actif={formulaireValide && mesureAEteEditee}
      ></lab-anssi-bouton>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        variante="tertiaire-sans-bordure"
        taille="md"
        titre="Annuler"
        onclick={() => tiroirStore.ferme()}
      ></lab-anssi-bouton>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Valider les modifications"
        variante="primaire"
        taille="md"
        onclick={async () => await sauvegardeInformations()}
        actif={!enCoursDenvoi}
      ></lab-anssi-bouton>
    {/if}
  {:else if ongletActif === 'statut-precision'}
    {#if etapeStatutEtPrecision === 1}
      <Bouton type="lien" titre="Annuler" onclick={() => tiroirStore.ferme()} />
    {:else}
      <Bouton
        type="lien"
        titre="Précédent"
        onclick={() => elementEtapesModification?.etapePrecedente()}
      />
    {/if}
    <Bouton
      titre={etapeStatutEtPrecision < 3
        ? 'Suivant'
        : 'Appliquer les modifications'}
      type="primaire"
      actif={boutonSuivantActif}
      enCoursEnvoi={enCoursDenvoi}
      onclick={() => elementEtapesModification?.etapeSuivante()}
    />
  {:else if ongletActif === 'servicesAssocies'}
    {#if etapeServicesAssocies === 1}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        position-icone="gauche"
        onclick={() => (etapeServicesAssocies = 2)}
        actif={idsServicesSelectionnes.length > 0}
      ></lab-anssi-bouton>
    {:else if etapeServicesAssocies === 2}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Valider les modifications"
        variante="primaire"
        taille="md"
        onclick={async () => await associeServices()}
        actif={!enCoursDenvoi}
      ></lab-anssi-bouton>
    {/if}
  {/if}
</ActionsTiroir>

<style lang="scss">
  .info-pas-de-service {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 4px 0;
    max-width: 550px;

    p {
      margin: 0;
    }
  }
</style>
