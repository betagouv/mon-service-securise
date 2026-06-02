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
    rolesAssignables,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import { singulierPluriel } from '../../outils/string';
  import TitreContenuOnglet from './TitreContenuOnglet.svelte';

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
  let etapeActuelle: 'LISTE' | 'ACTION' = $state('LISTE');
  let idServicesSelectionnes: string[] = $state([]);
  let roleSelectionne: Role = $state('ECRITURE');

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
    tableauActuels?.reinitialise();
    tableauDisponibles?.reinitialise();
    idServicesSelectionnes = [];
    etapeActuelle = 'LISTE';
    roleSelectionne = 'ECRITURE';
  };

  let tableauActuels: TableauEntitesSelectionnables;
  let tableauDisponibles: TableauEntitesSelectionnables;

  const onAjouteRole = (idServices: string[]) => {
    etapeActuelle = 'ACTION';
    idServicesSelectionnes = idServices;
  };

  const onRetireAcces = (idServices: string[]) => {
    etapeActuelle = 'ACTION';
    idServicesSelectionnes = idServices;
  };

  const metAJourRole = (e: CustomEvent<Role>) => {
    roleSelectionne = e.detail;
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
      {:else}
        <TitreContenuOnglet
          titre="Attribuer un rôle commun"
          description="Choisissez un rôle : il sera appliqué aux services sélectionnés."
        />
        <dsfr-select
          label="Rôle attribué à tous les services sélectionnés"
          options={Object.entries(rolesAssignables).map(([role, libelle]) => ({
            label: libelle,
            value: role,
          }))}
          onvaluechanged={metAJourRole}
          required
          value={roleSelectionne}
        ></dsfr-select>
        <hr />
        <h5>
          {idServicesSelectionnes.length}
          {singulierPluriel(
            'service concerné',
            'services concernés',
            idServicesSelectionnes.length
          )}
        </h5>
        <dsfr-table
          columns={[
            { key: 'entiteService', label: 'Entité / service' },
            { key: 'role', label: 'Rôle après application' },
          ]}
          rich
          rows={idServicesSelectionnes}
          multiline
        >
          {#each idServicesSelectionnes as idService, i (idService)}
            {@const service = tousServices.find(
              (service) => service.id === idService
            )}
            {#if service}
              {@const roleAvantChangement = utilisateur.autorisations.find(
                (a) => a.idService === idService
              )!.role}
              <div slot="cell:entiteService:{i}" class="entite-service">
                <span><b>{service.organisationResponsable}</b></span>
                <span>{service.nomService}</span>
              </div>
              <div slot="cell:role:{i}" class="role">
                <span class="ancien-role"
                  >{labelsRole[roleAvantChangement]}</span
                >
                <span>→</span>
                <span class="nouveau-role">{labelsRole[roleSelectionne!]}</span>
              </div>
            {/if}
          {/each}
        </dsfr-table>
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
      <TableauEntitesSelectionnables
        {toutesEntites}
        servicesParEntite={servicesDisponiblesParEntite}
        bind:this={tableauDisponibles}
        {onAjouteRole}
        messageSiVide="Cet utilisateur a déjà accès à tous les services du périmètre"
      />
    </div>
  </dsfr-tabs>
</ContenuTiroir>
<ActionsTiroir></ActionsTiroir>

<style lang="scss">
  hr {
    width: 100%;
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: 24px 0;
  }

  h5 {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
    margin: 0 0 -1rem;
  }

  .entite-service {
    display: flex;
    flex-direction: column;
  }

  .role {
    display: flex;
    gap: 8px;

    .ancien-role {
      text-decoration: line-through;
      color: #929292;
    }

    .nouveau-role {
      color: var(--bleu-mise-en-avant);
      font-weight: bold;
    }
  }
</style>
