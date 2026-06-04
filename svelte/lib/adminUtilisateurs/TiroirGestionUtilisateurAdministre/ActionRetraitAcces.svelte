<script lang="ts">
  import {
    labelsRole,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import { singulierPluriel } from '../../outils/string';
  import AlerteSeulProprietaire from './AlerteSeulProprietaire.svelte';
  import IndicateurSeulProprietaire from './IndicateurSeulProprietaire.svelte';

  interface Props {
    servicesSelectionnes: ServiceAdministre[];
    utilisateurAdministre: UtilisateurAdministre;
    servicesSeulProprietaire: ServiceAdministre[];
  }

  let {
    servicesSelectionnes,
    utilisateurAdministre,
    servicesSeulProprietaire,
  }: Props = $props();
</script>

<AlerteSeulProprietaire {servicesSeulProprietaire} />

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
    { key: 'role', label: 'Rôle actuel' },
  ]}
  rich
  rows={servicesSelectionnes}
  multiline
>
  {#each servicesSelectionnes as service, i (service.id)}
    {@const roleActuel = utilisateurAdministre.autorisations.find(
      (a) => a.idService === service.id
    )!.role}
    {@const seulProprietaire = servicesSeulProprietaire
      .map((s) => s.id)
      .includes(service.id)}
    <div slot="cell:entiteService:{i}" class="entite-service">
      <span><b>{service.organisationResponsable}</b></span>
      <span>{service.nomService}</span>
    </div>
    <div slot="cell:role:{i}">
      {#if seulProprietaire}
        <IndicateurSeulProprietaire />
      {:else}
        <span>{labelsRole[roleActuel]}</span>
      {/if}
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
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
</style>
