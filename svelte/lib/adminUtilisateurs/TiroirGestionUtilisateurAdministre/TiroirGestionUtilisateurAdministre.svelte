<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { onMount, untrack } from 'svelte';
  import { api } from '../adminUtilisateurs.api';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import TitreOngletDSFR from '../../ui/TitreOngletDSFR.svelte';
  import TableauEntitesSelectionnables from './TableauEntitesSelectionnables.svelte';
  import {
    labelsRole,
    type Role,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import TitreContenuOnglet from './TitreContenuOnglet.svelte';
  import ActionAttributionRole from './ActionAttributionRole.svelte';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { singulierPluriel } from '../../outils/string';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import ActionRetraitAcces from './ActionRetraitAcces.svelte';

  interface Props {
    utilisateur: UtilisateurAdministre;
    toutesEntites: Array<EntiteSupervisee>;
  }

  let { utilisateur, toutesEntites }: Props = $props();

  let tousServices: ServiceAdministre[] = $state([]);
  onMount(async () => {
    const tous = await api.tousServices();
    const siretsDuPerimetre = new Set(toutesEntites.map((e) => e.siret));
    tousServices = tous.filter((s) =>
      siretsDuPerimetre.has(s.siretOrganisationResponsable)
    );
  });

  export const titre: string = `Gérer les accès de ${untrack(() => utilisateur.prenomNom)}`;
  export const sousTitre: string =
    'Gérez les accès de cet utilisateur : vous pouvez le retirer des entités et services actuels, en ajouter de nouveaux, ou lui attribuer automatiquement tous les futurs services de votre périmètre.';
  export const taille = 'large';

  let idsServicesActuels = $derived(
    new Set(utilisateur.autorisations.map((a) => a.idService))
  );
  let servicesActuels = $derived.by(() => {
    const services = tousServices.filter((s) => idsServicesActuels.has(s.id));

    return services.map((s) => ({
      ...s,
      role: utilisateur.autorisations.find((a) => a.idService === s.id)?.role,
    }));
  });
  let servicesActuelsParEntite = $derived(
    Object.groupBy(servicesActuels, (s) => s.siretOrganisationResponsable)
  ) as Record<string, ServiceAdministre[]>;
  let servicesDisponibles = $derived(
    tousServices.filter((s) => !idsServicesActuels.has(s.id))
  );
  let servicesDisponiblesParEntite = $derived(
    Object.groupBy(servicesDisponibles, (s) => s.siretOrganisationResponsable)
  ) as Record<string, ServiceAdministre[]>;

  const configurationsTabs = [
    {
      id: 'actuels',
      label: 'Accès actuels',
    },
    {
      id: 'disponibles',
      label: 'Accès disponibles',
    },
  ];

  let idTabActive: number = $state(0);
  let etapeActuelle: 'LISTE' | 'ACTION_ATTRIBUTION' | 'ACTION_RETRAIT' =
    $state('LISTE');
  let idServicesSelectionnes: string[] = $state([]);

  let servicesSelectionnes: ServiceAdministre[] = $derived(
    tousServices.filter((s) => idServicesSelectionnes.includes(s.id))
  );

  let servicesSeulProprietaire: ServiceAdministre[] = $derived(
    servicesSelectionnes.filter((s) => {
      const utilisateurEstProprietaire =
        utilisateur.autorisations.find((a) => a.idService === s.id)?.role ===
        'PROPRIETAIRE';
      const autreProprietaireExiste = s.contributeurs
        .filter((c) => !c.estAdmin)
        .some((c) => c.estProprietaire && c.id !== utilisateur.id);
      return !autreProprietaireExiste && utilisateurEstProprietaire;
    })
  );

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
    tableauActuels?.reinitialise();
    tableauDisponibles?.reinitialise();
    idServicesSelectionnes = [];
    etapeActuelle = 'LISTE';
  };

  let tableauActuels: TableauEntitesSelectionnables | undefined = $state();
  let tableauDisponibles: TableauEntitesSelectionnables | undefined = $state();

  const onAjouteRole = (idServices: string[]) => {
    etapeActuelle = 'ACTION_ATTRIBUTION';
    idServicesSelectionnes = idServices;
  };

  const onRetireAcces = (idServices: string[]) => {
    etapeActuelle = 'ACTION_RETRAIT';
    idServicesSelectionnes = idServices;
  };

  let roleSelectionne: Role = $state('ECRITURE');
  const appliqueNouveauxRoles = async () => {
    await api.appliqueNouveauxRoles(
      utilisateur.id,
      idServicesSelectionnes,
      roleSelectionne
    );
    toasterStore.succes(
      'Nouveaux rôles attribués',
      `Le rôle "${labelsRole[roleSelectionne]}" a été attribué à ${utilisateur.prenomNom} sur ${idServicesSelectionnes.length} ${singulierPluriel('service', 'services', idServicesSelectionnes.length)}`
    );
    document.dispatchEvent(
      new CustomEvent('utilisateurs-administres-modifies')
    );
    tiroirStore.ferme();
  };

  const retireDesServices = async () => {
    await api.retireDesServices(utilisateur.id, idServicesSelectionnes);
    toasterStore.succes(
      'Accès retirés',
      `${utilisateur.prenomNom} a été retiré de ${idServicesSelectionnes.length} ${singulierPluriel('service', 'services', idServicesSelectionnes.length)}`
    );
    document.dispatchEvent(
      new CustomEvent('utilisateurs-administres-modifies')
    );
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <dsfr-callout
    title="{utilisateur.prenomNom} a accès à {Object.keys(
      servicesActuelsParEntite
    ).length}/{toutesEntites.length} entités · {utilisateur.autorisations
      .length}/{tousServices.length} services"
    accent="blue-cumulus"
    has-title
  ></dsfr-callout>
  <dsfr-tabs
    tabs={configurationsTabs}
    activeTabIndex={idTabActive}
    ontabchanged={gereChangementTab}
  >
    <div slot="tab-1">
      <TitreOngletDSFR
        active={idTabActive === 0}
        libelle={configurationsTabs[0].label}
        libellePastille={`${servicesActuels.length} service${servicesActuels.length > 1 ? 's' : ''}`}
      />
    </div>
    <div slot="panel-1" class="conteneur-onglet">
      {#if etapeActuelle === 'LISTE'}
        <TitreContenuOnglet
          titre="Entités et services auxquels {utilisateur.prenomNom} a accès"
          description="Modifier son rôle ou retirer son accès sur un ou plusieurs services."
        />
        <TableauEntitesSelectionnables
          {toutesEntites}
          servicesParEntite={servicesActuelsParEntite}
          bind:this={tableauActuels}
          {onAjouteRole}
          {onRetireAcces}
          messageSiVide="Cet utilisateur n'a actuellement accès à aucun des services du périmètre"
        />
      {:else if etapeActuelle === 'ACTION_ATTRIBUTION'}
        <TitreContenuOnglet
          titre="Attribuer un rôle commun"
          description="Choisissez un rôle : il sera appliqué aux services sélectionnés."
        />
        <ActionAttributionRole
          utilisateurAdministre={utilisateur}
          {servicesSelectionnes}
          bind:roleSelectionne
        />
      {:else}
        <TitreContenuOnglet
          titre="Êtes-vous sûr de vouloir retirer {utilisateur.prenomNom} de ces services ?"
          description="{utilisateur.prenomNom} perdra immédiatement l'accès aux services listés ci-dessous."
        />
        <ActionRetraitAcces
          utilisateurAdministre={utilisateur}
          {servicesSelectionnes}
          {servicesSeulProprietaire}
        />
      {/if}
    </div>

    <div slot="tab-2">
      <TitreOngletDSFR
        active={idTabActive === 1}
        libelle={configurationsTabs[1].label}
        libellePastille={`${servicesDisponibles.length} service${servicesDisponibles.length > 1 ? 's' : ''}`}
      />
    </div>
    <div slot="panel-2" class="conteneur-onglet">
      <TitreContenuOnglet
        titre="Ajouter {utilisateur.prenomNom} à d'autres services"
        description="Sélectionnez les entités et services de votre périmètre auxquels {utilisateur.prenomNom}
          n'a pas encore accès. Vous devez attribuer un rôle."
      />
      {#if etapeActuelle === 'LISTE'}
        <TableauEntitesSelectionnables
          {toutesEntites}
          servicesParEntite={servicesDisponiblesParEntite}
          bind:this={tableauDisponibles}
          {onAjouteRole}
          messageSiVide="Cet utilisateur a déjà accès à tous les services du périmètre"
        />
      {:else}
        <TitreContenuOnglet
          titre="Attribuer un rôle commun"
          description="Choisissez un rôle : il sera appliqué aux services sélectionnés."
        />
        <ActionAttributionRole
          utilisateurAdministre={utilisateur}
          {servicesSelectionnes}
          bind:roleSelectionne
        />
      {/if}
    </div>
  </dsfr-tabs>
</ContenuTiroir>
{#if etapeActuelle === 'ACTION_ATTRIBUTION'}
  <ActionsTiroir>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Annuler les modifications"
      onclick={() => (etapeActuelle = 'LISTE')}
      kind="tertiary-no-outline"
    ></dsfr-button>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Enregistrer toutes les modifications"
      onclick={() => appliqueNouveauxRoles()}
      kind="primary"
      has-icon
      icon="check-line"
    ></dsfr-button>
  </ActionsTiroir>
{/if}
{#if etapeActuelle === 'ACTION_RETRAIT'}
  <ActionsTiroir>
    {#if idTabActive === 0}
      <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
      <dsfr-button
        label="Annuler les modifications"
        onclick={() => (etapeActuelle = 'LISTE')}
        kind="tertiary-no-outline"
      ></dsfr-button>
      <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
      <dsfr-button
        label="Retirer {singulierPluriel(
          'du service',
          `de ${idServicesSelectionnes.length} services`,
          idServicesSelectionnes.length
        )}"
        onclick={() => retireDesServices()}
        kind="primary"
        has-icon
        icon="delete-bin-line"
      ></dsfr-button>
    {/if}
  </ActionsTiroir>
{/if}
