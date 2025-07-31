<script lang="ts">
  import type { ListeMesuresProps } from '../../listeMesures.d';
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../../ui/Onglets.svelte';
  import InformationsModeleMesureSpecifique from '../InformationsModeleMesureSpecifique.svelte';
  import type {
    ModeleMesureSpecifique,
    ReferentielTypesService,
  } from '../../../ui/types.d';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import {
    associeServicesModeleMesureSpecifique,
    sauvegardeModeleMesureSpecifique,
  } from '../../listeMesures.api';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import { modelesMesureSpecifique } from '../../stores/modelesMesureSpecifique.store';
  import ServicesAssociesModeleMesureSpecifique from '../ServicesAssociesModeleMesureSpecifique.svelte';
  import { servicesAvecMesuresAssociees } from '../../stores/servicesAvecMesuresAssociees.store';
  import Avertissement from '../../../ui/Avertissement.svelte';
  import Lien from '../../../ui/Lien.svelte';

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  export let categories: ListeMesuresProps['categories'];
  export let modeleMesure: ModeleMesureSpecifique;
  export let referentielTypesService: ReferentielTypesService;
  let idsServicesSelectionnes: string[] = [];

  let ongletActif: 'info' | 'servicesAssocies' = 'servicesAssocies';
  let etapeActive: 1 | 2 = 1;

  let donneesModeleMesureEdite = structuredClone(modeleMesure);

  $: formulaireValide =
    !!donneesModeleMesureEdite.description &&
    !!donneesModeleMesureEdite.categorie;

  let enCoursDenvoi = false;

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
      etapeActive = 1;
      idsServicesSelectionnes = [];
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
    } catch (e) {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };
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
    ]}
    bind:ongletActif
    sansBordureEnBas={true}
  />
  {#if ongletActif === 'info'}
    <InformationsModeleMesureSpecifique
      {categories}
      bind:donneesModeleMesure={donneesModeleMesureEdite}
    />
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
        bind:etapeActive
        bind:idsServicesSelectionnes
      />
    {/if}
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  {#if ongletActif === 'info'}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Enregistrer les modifications"
      variante="primaire"
      taille="md"
      icone="save-line"
      position-icone="gauche"
      on:click={async () => await sauvegardeInformations()}
      actif={formulaireValide && !enCoursDenvoi}
    />
  {:else if ongletActif === 'servicesAssocies'}
    {#if etapeActive === 1}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        position-icone="gauche"
        on:click={() => (etapeActive = 2)}
        actif={idsServicesSelectionnes.length > 0}
      />
    {:else if etapeActive === 2}
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
