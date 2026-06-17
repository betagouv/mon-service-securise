<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import {
    messageRecapitulatif,
    messageSucces,
    resumeDesModifications,
    siretsOuIlEstAdmin,
    statsDesEntites,
  } from './tiroirNommerAdmin';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import type {
    ServiceAdministre,
    UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import { SvelteSet } from 'svelte/reactivity';
  import { singulierPluriel } from '../../outils/string';
  import BadgeAdmin from '../BadgeAdmin.svelte';
  import { api } from '../adminUtilisateurs.api';
  import { toasterStore } from '../../ui/stores/toaster.store';

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
      ? `Cochez les entités sur lesquelles ${utilisateur.prenomNom} doit être admin. Décochez celles à retirer.`
      : `Sélectionnez les entités de votre périmètre que vous souhaitez déléguer. ${utilisateur.prenomNom} deviendra admin de tous les services rattachés à ces entités.`
  );

  export const taille = 'large';

  let etape: 'SELECTION' | 'RECAPITULATIF' = $state('SELECTION');

  let siretsSelectionnesInitialement = untrack(() =>
    siretsOuIlEstAdmin(utilisateur.id, toutesEntites)
  );
  let siretsSelectionnes = new SvelteSet<string>(
    siretsSelectionnesInitialement
  );
  let stats = $derived.by(() =>
    statsDesEntites(toutesEntites, [...siretsSelectionnes])
  );

  let nombreTotalEntites = $derived(toutesEntites.length);

  let toutEstSelectionne = $derived(
    siretsSelectionnes.size === nombreTotalEntites
  );

  let recapitulatif = $derived(
    resumeDesModifications(siretsSelectionnesInitialement, [
      ...siretsSelectionnes,
    ])
  );

  let aDesModifications = $derived(
    recapitulatif.nouvelles.length !== 0 || recapitulatif.retirees.length !== 0
  );

  const basculeTouteSelection = () => {
    if (toutEstSelectionne) {
      siretsSelectionnes.clear();
      siretsSeulProprietaire.forEach((s) => siretsSelectionnes.add(s));
    } else
      for (const entite of toutesEntites) {
        siretsSelectionnes.add(entite.siret);
      }
  };

  const enEntite = (siret: string): EntiteSupervisee => {
    return toutesEntites.find((e) => e.siret === siret)!;
  };

  let toutesEntitesModifiees = $derived([
    ...recapitulatif.nouvelles.map(enEntite),
    ...recapitulatif.conservees.map(enEntite),
    ...recapitulatif.retirees.map(enEntite),
  ]);

  const enregistreModifications = async () => {
    await api.enregistreNouveauPerimetreAdmin(utilisateur.id, [
      ...recapitulatif.nouvelles,
      ...recapitulatif.conservees,
    ]);
    if (
      recapitulatif.nouvelles.length > 0 ||
      recapitulatif.conservees.length > 0
    ) {
      toasterStore.succes(
        'Administrateur modifié',
        messageSucces(recapitulatif, utilisateur)
      );
    } else {
      toasterStore.succes(
        'Administrateur supprimé',
        `${utilisateur.prenomNom} n'est plus administrateur`
      );
    }
    document.dispatchEvent(
      new CustomEvent('utilisateurs-administres-modifies')
    );
    tiroirStore.ferme();
  };

  let tousServices: ServiceAdministre[] = $state([]);
  onMount(async () => {
    const tous = await api.tousServices();
    const siretsDuPerimetre = new Set(toutesEntites.map((e) => e.siret));
    tousServices = tous.filter((s) =>
      siretsDuPerimetre.has(s.siretOrganisationResponsable)
    );
  });

  let siretsSeulProprietaire: Set<string> = $derived(
    new Set(
      tousServices
        .filter((s) =>
          siretsSelectionnesInitialement.includes(
            s.siretOrganisationResponsable
          )
        )
        .filter((s) => {
          const autorisation = utilisateur.autorisations.find(
            (a) => a.idService === s.id
          );
          const utilisateurEstProprietaire =
            autorisation?.role === 'PROPRIETAIRE' ||
            autorisation?.role === 'ADMIN';
          const autreProprietaireExiste = s.contributeurs
            .filter((c) => !c.estAdmin)
            .some((c) => c.estProprietaire && c.id !== utilisateur.id);
          return !autreProprietaireExiste && utilisateurEstProprietaire;
        })
        .map((s) => s.siretOrganisationResponsable)
    )
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
    {#if siretsSelectionnes.size === 0}
      <dsfr-callout
        has-title
        title="{utilisateur.prenomNom} {aDesModifications
          ? 'ne sera plus admin'
          : "n'est pas admin actuellement"}"
        accent="blue-cumulus"
      ></dsfr-callout>
    {:else}
      <dsfr-callout
        has-title
        title="{utilisateur.prenomNom} {aDesModifications
          ? 'sera admin'
          : 'est admin'} de {siretsSelectionnes.size} {singulierPluriel(
          'entité',
          'entités',
          siretsSelectionnes.size
        )}"
        text="soit {stats.nombreServices} {singulierPluriel(
          'service rattaché',
          'services rattachés',
          stats.nombreServices
        )} et {stats.nombreUtilisateurs} {singulierPluriel(
          'utilisateur concerné',
          'utilisateurs concernés',
          stats.nombreUtilisateurs
        )}"
        accent="blue-ecume"
      ></dsfr-callout>
    {/if}

    <div>
      <div class="barre-actions">
        <span class="sous-texte">
          {#if siretsSelectionnes.size > 0}
            {siretsSelectionnes.size}
            {singulierPluriel(
              'entité sélectionnée',
              'entités sélectionnées',
              siretsSelectionnes.size
            )}
          {:else}
            {nombreTotalEntites}
            {singulierPluriel(
              'entité au total',
              'entités au total',
              nombreTotalEntites
            )}
          {/if}
        </span>
        <div>
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            label={toutEstSelectionne
              ? 'Tout désélectionner'
              : 'Tout sélectionner'}
            onclick={() => basculeTouteSelection()}
            kind="tertiary-no-outline"
            size="sm"
          ></dsfr-button>
        </div>
      </div>
      <dsfr-table
        columns={[
          { key: 'nom', label: 'Nom' },
          { key: 'siret', label: 'SIRET' },
          { key: 'nombreServices', label: 'Services rattachés' },
          { key: 'statutActuel', label: 'Statut actuel' },
        ]}
        rows={toutesEntites}
        row-key="siret"
        selectable
        rich
        select-all
        selected-row-keys={JSON.stringify([...siretsSelectionnes])}
        onselectionchanged={(e: CustomEvent<{ keys: Array<string> }>) => {
          siretsSelectionnes.clear();
          e.detail.keys.forEach((key) => {
            siretsSelectionnes.add(key);
          });
        }}
        disabled-row-keys={JSON.stringify([...siretsSeulProprietaire])}
      >
        {#each toutesEntites as entite, i (entite.siret)}
          <div slot="cell:statutActuel:{i}" class="statut-actuel">
            {#if siretsSelectionnesInitialement.includes(entite.siret)}
              <BadgeAdmin />
            {:else}
              <span>-</span>
            {/if}
          </div>
        {/each}
      </dsfr-table>
    </div>
  {:else}
    <dsfr-callout
      has-title
      title="Récapitulatif"
      text={messageRecapitulatif(recapitulatif, utilisateur)}
      accent="blue-ecume"
    ></dsfr-callout>
    <dsfr-table
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'siret', label: 'SIRET' },
        { key: 'nombreServices', label: 'Services rattachés' },
        { key: 'action', label: 'Action' },
      ]}
      rows={toutesEntitesModifiees}
      row-key="siret"
      rich
    >
      {#each toutesEntitesModifiees as entite, i (entite.siret)}
        <div slot="cell:nom:{i}">
          {#if recapitulatif.retirees.includes(entite.siret)}
            <span><s>{entite.nom}</s></span>
          {:else}
            <span>{entite.nom}</span>
          {/if}
        </div>
        <div slot="cell:action:{i}">
          {#if recapitulatif.nouvelles.includes(entite.siret)}
            <dsfr-badge
              label="Nouvel admin"
              type="accent"
              accent="green-emeraude"
              size="sm"
            ></dsfr-badge>
          {:else if recapitulatif.conservees.includes(entite.siret)}
            <dsfr-badge label="Admin conservé" size="sm"></dsfr-badge>
          {:else}
            <dsfr-badge
              label="Admin retiré"
              type="accent"
              accent="pink-tuile"
              size="sm"
            ></dsfr-badge>
          {/if}
        </div>
      {/each}
    </dsfr-table>
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
      disabled={!aDesModifications}
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
        enregistreModifications();
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
  .barre-actions {
    padding-bottom: 24px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

  .sous-texte {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #666666;
    white-space: nowrap;
  }

  dsfr-table {
    margin-top: calc(-16px - 1rem);
  }

  dsfr-stepper {
    margin-bottom: -2rem;
  }

  dsfr-callout {
    margin-bottom: -1.5rem;
  }
</style>
