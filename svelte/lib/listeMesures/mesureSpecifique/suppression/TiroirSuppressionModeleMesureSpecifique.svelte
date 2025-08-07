<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import BoutonsRadio from '../../../ui/BoutonsRadio.svelte';
  import Toast from '../../../ui/Toast.svelte';
  import SeparateurHorizontal from '../../../ui/SeparateurHorizontal.svelte';
  import TableauServicesAssocies from '../../servicesAssocies/TableauServicesAssocies.svelte';
  import type {
    ModeleMesureSpecifique,
    ReferentielStatut,
  } from '../../../ui/types';
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import {
    supprimeCompletementModeleMesureSpecifique,
    supprimeModeleMesureSpecifiqueEtDetacheMesureAssociees,
  } from '../../listeMesures.api';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import { modelesMesureSpecifique } from '../modelesMesureSpecifique.store';
  import TableauSelectionServices from '../../kit/TableauSelectionServices.svelte';
  import type { ServiceAssocie } from '../../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';

  export const titre: string = 'Supprimer la mesure';
  export const sousTitre: string =
    'Choisissez où cette mesure doit être supprimée : partout, partiellement ou uniquement de la liste centralisée.';
  export const taille = 'large';

  enum ModeDeSuppression {
    COMPLET = 'COMPLET',
    UNIQUEMENT_MODELE = 'UNIQUEMENT_MODELE',
    UNIQUEMENT_SERVICES_CHOISIS = 'UNIQUEMENT_SERVICES_CHOISIS',
  }

  export let modeleMesure: ModeleMesureSpecifique;
  export let statuts: ReferentielStatut;

  let idsServicesSelectionnes: string[] = [];
  let modeSuppressionSelectionne: ModeDeSuppression = ModeDeSuppression.COMPLET;
  let enCoursEnvoi = false;

  const predicationDesactivation = (donnee: ServiceAssocie) =>
    !donnee.peutEtreModifie;

  $: servicesAvecMesure = modeleMesure
    ? $servicesAvecMesuresAssociees
        .filter((s) => modeleMesure.idsServicesAssocies.includes(s.id))
        .map(({ mesuresAssociees, mesuresSpecifiques, ...autresDonnees }) => ({
          ...autresDonnees,
          mesuresSpecifiques,
          mesure: mesuresSpecifiques.find(
            (m) => m.idModele === modeleMesure.id
          )!,
        }))
    : [];

  const supprime = async () => {
    enCoursEnvoi = true;

    try {
      if (modeSuppressionSelectionne === ModeDeSuppression.COMPLET) {
        await supprimeCompletementModeleMesureSpecifique(modeleMesure.id);
      } else if (
        modeSuppressionSelectionne === ModeDeSuppression.UNIQUEMENT_MODELE
      ) {
        await supprimeModeleMesureSpecifiqueEtDetacheMesureAssociees(
          modeleMesure.id
        );
      }
      toasterStore.succes(
        `Mesure supprimée avec succès !`,
        `Vous avez supprimé la mesure ${modeleMesure.description}.`
      );
      tiroirStore.ferme();
      await servicesAvecMesuresAssociees.rafraichis();
      await modelesMesureSpecifique.rafraichis();
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
</script>

<ContenuTiroir>
  <div class="marge-24">
    {#if modeleMesure.idsServicesAssocies.length === 0}
      <h4>
        Êtes-vous sûr de vouloir supprimer la mesure «&nbsp;{modeleMesure.description}&nbsp;»
        ?
      </h4>
      <Toast
        avecOmbre={false}
        titre="Cette action est irréversible"
        avecAnimation={false}
        niveau="info"
        contenu="La mesure sera définitivement supprimée de la liste centralisée."
      />
    {:else}
      <h4>
        Où souhaitez vous supprimer la mesure «&nbsp;{modeleMesure.description}&nbsp;»
        ?
      </h4>
      <div class="conteneur-boutons-radio">
        <BoutonsRadio
          bind:valeurSelectionnee={modeSuppressionSelectionne}
          options={[
            {
              titre: 'Supprimer complètement la mesure',
              sousTitre:
                'La mesure sera définitivement supprimée de la liste centralisée ainsi que de tous les services où elle est utilisée.',
              valeur: ModeDeSuppression.COMPLET,
            },
            {
              titre: 'Supprimer uniquement de la liste centralisée',
              sousTitre:
                'La mesure sera retirée de la liste centralisée, mais restera disponible dans les services où elle est déjà utilisée.',
              valeur: ModeDeSuppression.UNIQUEMENT_MODELE,
            },
            {
              titre: 'Supprimer uniquement de certains services',
              sousTitre:
                'Vous pouvez choisir de retirer cette mesure de certains services spécifiques, tout en la conservant dans la liste centralisée et dans les autres services.',
              valeur: ModeDeSuppression.UNIQUEMENT_SERVICES_CHOISIS,
            },
          ]}
        />
      </div>
      {#if modeSuppressionSelectionne === ModeDeSuppression.COMPLET}
        <Toast
          avecOmbre={false}
          titre="Cette action est irréversible"
          avecAnimation={false}
          niveau="alerte"
          contenu="Cette action impactera tous les services associés à cette mesure."
        />
        <SeparateurHorizontal />
        <TableauServicesAssocies
          servicesAssocies={servicesAvecMesure}
          referentielStatuts={statuts}
        />
      {:else if modeSuppressionSelectionne === ModeDeSuppression.UNIQUEMENT_MODELE}
        <div class="conteneur-toast">
          <Toast
            avecOmbre={false}
            titre="Cette action est irréversible"
            avecAnimation={false}
            niveau="alerte"
            contenu="Les services actuels continueront d’utiliser cette mesure, mais elle ne pourra plus être ajoutée à de nouveaux services."
          />
        </div>
      {:else if modeSuppressionSelectionne === ModeDeSuppression.UNIQUEMENT_SERVICES_CHOISIS}
        <SeparateurHorizontal />
        <TableauSelectionServices
          {statuts}
          bind:idsServicesSelectionnes
          services={servicesAvecMesure}
          {predicationDesactivation}
        />
      {/if}
    {/if}
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    titre="Valider la suppression"
    variante="primaire"
    taille="md"
    icone="delete-line"
    position-icone="gauche"
    on:click={supprime}
    actif={!enCoursEnvoi}
  />
</ActionsTiroir>

<style lang="scss">
  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
    max-width: 550px;
  }

  .conteneur-boutons-radio,
  .conteneur-toast {
    max-width: 660px;
  }

  .marge-24 {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
