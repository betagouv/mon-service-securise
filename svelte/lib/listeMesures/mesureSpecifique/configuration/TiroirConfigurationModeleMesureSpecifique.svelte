<script lang="ts">
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
  import { modelesMesureSpecifique } from '../modelesMesureSpecifique.store';
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

  export let statuts: ReferentielStatut;
  export let categories: ListeMesuresProps['categories'];
  export let modeleMesure: ModeleMesureSpecifique;
  export let referentielTypesService: ReferentielTypesService;
  let idsServicesSelectionnes: string[] = [];

  let etapeStatutEtPrecision: 1 | 2 | 3 = 1;
  let etapeServicesAssocies: 1 | 2 = 1;
  let etapeInformations: 1 | 2 = 1;

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
      servicesAvecMesuresAssociees.rafraichis();
      const pluriel = idsServices.length > 1 ? 's' : '';
      toasterStore.succes(
        `Mesure${pluriel} modifiée${pluriel} avec succès !`,
        `Vous avez modifié la mesure ${modeleMesure.description} sur ${idsServices.length} service${pluriel}.`
      );
      metEnAvantMesureApresModification();
    } catch (e) {
      tiroirStore.ferme();
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };

  export let ongletActif: 'info' | 'servicesAssocies' | 'statut-precision' =
    'servicesAssocies';

  let donneesModeleMesureEdite = structuredClone(modeleMesure);
  $: mesureAEteEditee =
    modeleMesure.description !== donneesModeleMesureEdite.description ||
    modeleMesure.descriptionLongue !==
      donneesModeleMesureEdite.descriptionLongue ||
    modeleMesure.categorie !== donneesModeleMesureEdite.categorie;

  $: formulaireValide =
    !!donneesModeleMesureEdite.description &&
    !!donneesModeleMesureEdite.categorie;

  let servicesAssocies: ServiceAssocie[] = [];
  $: servicesAssocies =
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
            modalites: mesureSpecifique?.modalite,
          },
        };
      });

  let enCoursDenvoi = false;

  let boutonSuivantActif = false;

  const associeServices = async () => {
    enCoursDenvoi = true;
    try {
      await associeServicesModeleMesureSpecifique(
        donneesModeleMesureEdite.id,
        idsServicesSelectionnes
      );
      servicesAvecMesuresAssociees.rafraichis();
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
    } catch (e) {
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
    } catch (e) {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };

  $: {
    if (ongletActif) {
      etapeServicesAssocies = 1;
      etapeStatutEtPrecision = 1;
      etapeInformations = 1;
    }
  }

  let elementEtapesModification: EtapesModificationMultipleStatutPrecision;
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
              on:click={() => (ongletActif = 'servicesAssocies')}
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
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      variante="tertiaire-sans-bordure"
      taille="md"
      titre="Annuler"
      on:click={() => tiroirStore.ferme()}
    />
  {/if}
  {#if ongletActif === 'info'}
    {#if etapeInformations === 1}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        variante="tertiaire-sans-bordure"
        taille="md"
        titre="Supprimer la mesure"
        icone="delete-line"
        position-icone="gauche"
        on:click={() =>
          tiroirStore.afficheContenu(
            TiroirSuppressionModeleMesureSpecifique,
            {}
          )}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        position-icone="gauche"
        on:click={() => (etapeInformations = 2)}
        actif={formulaireValide && mesureAEteEditee}
      />
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        variante="tertiaire-sans-bordure"
        taille="md"
        titre="Annuler"
        on:click={() => tiroirStore.ferme()}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Valider les modifications"
        variante="primaire"
        taille="md"
        on:click={async () => await sauvegardeInformations()}
        actif={!enCoursDenvoi}
      />
    {/if}
  {:else if ongletActif === 'statut-precision'}
    {#if etapeStatutEtPrecision === 1}
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
      titre={etapeStatutEtPrecision < 3
        ? 'Suivant'
        : 'Appliquer les modifications'}
      type="primaire"
      actif={boutonSuivantActif}
      enCoursEnvoi={enCoursDenvoi}
      on:click={() => elementEtapesModification.etapeSuivante()}
    />
  {:else if ongletActif === 'servicesAssocies'}
    {#if etapeServicesAssocies === 1}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        position-icone="gauche"
        on:click={() => (etapeServicesAssocies = 2)}
        actif={idsServicesSelectionnes.length > 0}
      />
    {:else if etapeServicesAssocies === 2}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Valider les modifications"
        variante="primaire"
        taille="md"
        on:click={async () => await associeServices()}
        actif={!enCoursDenvoi}
      />
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
