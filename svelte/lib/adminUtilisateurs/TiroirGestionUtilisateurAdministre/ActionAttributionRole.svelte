<script lang="ts">
  import {
    labelsRole,
    type Role,
    rolesAssignables,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import { singulierPluriel } from '../../outils/string';
  import AlerteSeulProprietaire from './AlerteSeulProprietaire.svelte';
  import IndicateurSeulProprietaire from './IndicateurSeulProprietaire.svelte';

  interface Props {
    servicesSelectionnes: ServiceAdministre[];
    utilisateurAdministre: UtilisateurAdministre;
    roleSelectionne: Role;
    servicesSeulProprietaire: ServiceAdministre[];
  }

  let {
    servicesSelectionnes,
    utilisateurAdministre,
    roleSelectionne = $bindable(),
    servicesSeulProprietaire,
  }: Props = $props();

  const metAJourRole = (e: CustomEvent<Role>) => {
    roleSelectionne = e.detail;
  };

  let doitAfficherAlerteSeuleProprietaire = $derived(
    roleSelectionne !== 'PROPRIETAIRE' && servicesSeulProprietaire.length > 0
  );
</script>

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
{#if doitAfficherAlerteSeuleProprietaire}
  <AlerteSeulProprietaire {servicesSeulProprietaire} modeAttribution />
{/if}
<h5>
  {servicesSelectionnes.length}
  {singulierPluriel(
    'service concerné',
    'services concernés',
    servicesSelectionnes.length
  )}
</h5>
<dsfr-table
  columns={[
    { key: 'entiteService', label: 'Entité / service' },
    { key: 'role', label: 'Rôle après application' },
  ]}
  rich
  rows={servicesSelectionnes}
  multiline
>
  {#each servicesSelectionnes as service, i (service.id)}
    {@const roleAvantChangement = utilisateurAdministre.autorisations.find(
      (a) => a.idService === service.id
    )?.role}
    <div slot="cell:entiteService:{i}" class="entite-service">
      <span><b>{service.organisationResponsable}</b></span>
      <span>{service.nomService}</span>
    </div>
    <div slot="cell:role:{i}" class="role">
      {#if roleAvantChangement}
        <span class="ancien-role">{labelsRole[roleAvantChangement]}</span>
        <span>→</span>
      {/if}
      <span class="nouveau-role">{labelsRole[roleSelectionne!]}</span>
      {#if doitAfficherAlerteSeuleProprietaire}
        <div class="indicateur">
          <IndicateurSeulProprietaire />
        </div>
      {/if}
    </div>
  {/each}
</dsfr-table>

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
    column-gap: 8px;
    flex-wrap: wrap;

    .ancien-role {
      text-decoration: line-through;
      color: #666666;
    }

    .nouveau-role {
      color: var(--bleu-mise-en-avant);
      font-weight: bold;
    }

    .indicateur {
      flex-basis: 100%;
    }
  }
</style>
