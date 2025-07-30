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

  export const titre: string = 'Configurer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  export let categories: ListeMesuresProps['categories'];
  export let modeleMesure: ModeleMesureSpecifique;
  export let referentielTypesService: ReferentielTypesService;
  let idsServicesSelectionnes: string[] = [];

  let ongletActif: 'info' | 'servicesAssocies' = 'servicesAssocies';
  let etapeActive: 1 | 2 | 3 = 1;

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
      etapeActive = 3;
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
      { id: 'servicesAssocies', label: 'Services associés' },
    ]}
    bind:ongletActif
  />
  {#if ongletActif === 'info'}
    <InformationsModeleMesureSpecifique
      {categories}
      bind:donneesModeleMesure={donneesModeleMesureEdite}
    />
  {:else if ongletActif === 'servicesAssocies'}
    <ServicesAssociesModeleMesureSpecifique
      {modeleMesure}
      {referentielTypesService}
      bind:etapeActive
      bind:idsServicesSelectionnes
    />
  {/if}
</ContenuTiroir>
<ActionsTiroir>
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
