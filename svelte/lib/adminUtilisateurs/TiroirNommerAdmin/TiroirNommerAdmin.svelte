<script lang="ts">
  import { untrack } from 'svelte';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import { siretsOuIlEstAdmin, statsDesEntites } from './tiroirNommerAdmin';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import type { UtilisateurAdministre } from '../adminUtilisateurs.types';

  interface Props {
    utilisateur: UtilisateurAdministre;
    toutesEntites: Array<EntiteSupervisee>;
  }

  let { utilisateur, toutesEntites }: Props = $props();

  export const titre: string = untrack(() =>
    utilisateur.estAdmin
      ? `Gérer le droit admin de ${utilisateur.prenomNom}`
      : `Nommer ${utilisateur.prenomNom} en tant qu'admin`
  );

  export const sousTitre: string = untrack(() =>
    utilisateur.estAdmin
      ? `Cochez les entités sur lesquelles ${utilisateur.prenomNom} doit être Admin. Décochez celles à retirer.`
      : `Sélectionnez les entités de votre périmètre que vous souhaitez déléguer. ${utilisateur.prenomNom} deviendra Admin de tous les services rattachés à ces entités.`
  );

  export const taille = 'large';

  let etape: 'SELECTION' | 'RECAPITULATIF' = $state('SELECTION');

  let siretsSelectionnes: Array<string> = $state(
    untrack(() => siretsOuIlEstAdmin(utilisateur.id, toutesEntites))
  );
  let stats = $derived.by(() =>
    statsDesEntites(toutesEntites, siretsSelectionnes)
  );
</script>

<ContenuTiroir>
  <dsfr-stepper
    title={etape === 'SELECTION' ? 'Sélection des entités' : 'Récapitulatif'}
    nextStep={etape === 'SELECTION' ? 'Récapitulatif' : undefined}
    currentStep={etape === 'SELECTION' ? 1 : 2}
    stepCount={2}
  ></dsfr-stepper>

  {#if etape === 'SELECTION'}
    <dsfr-callout
      has-title
      title={`${utilisateur.prenomNom} sera admin de ${siretsSelectionnes.length} entité(s))`}
      text={`soit ${stats.nombreServices} service(s) rattaché(s) et ${stats.nombreUtilisateurs} utilisateur(s) concerné(s)`}
      accent="blue-ecume"
    ></dsfr-callout>

    <dsfr-table
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'siret', label: 'SIRET' },
        { key: 'nombreServices', label: 'Services rattachés' },
      ]}
      rows={toutesEntites}
      row-key="siret"
      selectable
      select-all
      selected-row-keys={JSON.stringify(siretsSelectionnes)}
      onselectionchanged={(e: CustomEvent<{ keys: Array<string> }>) =>
        (siretsSelectionnes = e.detail.keys)}
    ></dsfr-table>
  {/if}
</ContenuTiroir>

<ActionsTiroir>
  {#if etape === 'SELECTION'}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      onclick={tiroirStore.ferme}
      kind="tertiary-no-outline"
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Récapitulatif"
      onclick={() => {
        etape = 'RECAPITULATIF';
      }}
      kind="primary"
      hasIcon
      icon-place="right"
      icon="arrow-right-line"
    ></dsfr-button>
  {/if}
  {#if etape === 'RECAPITULATIF'}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Précédent"
      onclick={() => (etape = 'SELECTION')}
      kind="tertiary-no-outline"
      hasIcon
      icon="arrow-left-line"
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Enregistrer les modifications"
      onclick={() => {
        etape = 'RECAPITULATIF';
      }}
      kind="primary"
      hasIcon
      icon="check-line"
    ></dsfr-button>
  {/if}
</ActionsTiroir>

<style lang="scss">
  h1 {
    text-align: center;
  }
</style>
