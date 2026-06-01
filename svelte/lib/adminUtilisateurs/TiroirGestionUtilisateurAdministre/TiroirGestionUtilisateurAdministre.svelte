<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { onMount, untrack } from 'svelte';
  import {
    api,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.api';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import TitreOngletDSFR from '../../ui/TitreOngletDSFR.svelte';
  import TableauEntitesSelectionnables from './TableauEntitesSelectionnables.svelte';

  interface Props {
    utilisateur: UtilisateurAdministre;
    toutesEntites: Array<EntiteSupervisee>;
  }

  let { utilisateur, toutesEntites }: Props = $props();

  let tousServices: ServiceAdministre[] = $state([]);
  let servicesDeUtilisateur: ServiceAdministre[] = $state([]);
  onMount(async () => {
    const tous = await api.tousServices();
    const siretsDuPerimetre = new Set(toutesEntites.map((e) => e.siret));
    tousServices = tous.filter((s) =>
      siretsDuPerimetre.has(s.siretOrganisationResponsable)
    );
    servicesDeUtilisateur = await api.servicesDeUtilisateur(utilisateur.id);
  });

  export const titre: string = `Gérer les accès de ${untrack(() => utilisateur.prenomNom)}`;
  export const sousTitre: string =
    'Gérez les accès de cet utilisateur : vous pouvez le retirer des entités et services actuels, en ajouter de nouveaux, ou lui attribuer automatiquement tous les futurs services de votre périmètre.';
  export const taille = 'large';

  let idsServicesActuels = $derived(
    new Set(servicesDeUtilisateur.map((s) => s.id))
  );
  let servicesActuels = $derived(servicesDeUtilisateur);
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
  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
    tableauActuels.reinitialise();
    tableauDisponibles.reinitialise();
  };

  let tableauActuels: TableauEntitesSelectionnables;
  let tableauDisponibles: TableauEntitesSelectionnables;

  const onAjouteRole = (idServicesSelectionnes: string[]) => {
    console.log(idServicesSelectionnes);
  };

  const onRetireAcces = (idServicesSelectionnes: string[]) => {
    console.log(idServicesSelectionnes);
  };
</script>

<ContenuTiroir>
  <dsfr-callout
    title="{utilisateur.prenomNom} a accès à {Object.keys(
      servicesActuelsParEntite
    )
      .length}/{toutesEntites.length} entités · {servicesDeUtilisateur.length}/{tousServices.length} services"
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
      <div class="titre-tableau">
        <h4>Entités et services auxquels {utilisateur.prenomNom} a accès</h4>
        <span
          >Modifier son rôle ou retirer son accès sur un ou plusieurs services.</span
        >
      </div>
      <TableauEntitesSelectionnables
        {toutesEntites}
        servicesParEntite={servicesActuelsParEntite}
        bind:this={tableauActuels}
        {onAjouteRole}
        {onRetireAcces}
      />
    </div>

    <div slot="tab-2">
      <TitreOngletDSFR
        active={idTabActive === 1}
        libelle={configurationsTabs[1].label}
        libellePastille={`${servicesDisponibles.length} service${servicesDisponibles.length > 1 ? 's' : ''}`}
      />
    </div>
    <div slot="panel-2" class="conteneur-onglet">
      <div class="titre-tableau">
        <h4>Ajouter {utilisateur.prenomNom} à d'autres services</h4>
        <span
          >Sélectionnez les entités et services de votre périmètre auxquels {utilisateur.prenomNom}
          n'a pas encore accès. Vous devez attribuer un rôle.</span
        >
      </div>
      <TableauEntitesSelectionnables
        {toutesEntites}
        servicesParEntite={servicesDisponiblesParEntite}
        bind:this={tableauDisponibles}
        {onAjouteRole}
        {onRetireAcces}
      />
    </div>
  </dsfr-tabs>
</ContenuTiroir>
<ActionsTiroir></ActionsTiroir>

<style lang="scss">
  .titre-tableau {
    display: flex;
    flex-direction: column;
    gap: 8px;

    h4 {
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0;
    }

    span {
      color: #666666;
      max-width: 620px;
      font-size: 0.875rem;
      line-height: 1.5rem;
      margin-bottom: 24px;
    }
  }
</style>
