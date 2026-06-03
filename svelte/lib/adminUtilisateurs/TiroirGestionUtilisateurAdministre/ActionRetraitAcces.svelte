<script lang="ts">
  import {
    labelsRole,
    type ServiceAdministre,
    type UtilisateurAdministre,
  } from '../adminUtilisateurs.types';
  import { singulierPluriel } from '../../outils/string';

  interface Props {
    servicesSelectionnes: ServiceAdministre[];
    utilisateurAdministre: UtilisateurAdministre;
  }

  let { servicesSelectionnes, utilisateurAdministre }: Props = $props();

  let servicesSeulProprietaire: ServiceAdministre[] = $derived(
    servicesSelectionnes.filter((s) => {
      const utilisateurEstProprietaire =
        utilisateurAdministre.autorisations.find((a) => a.idService === s.id)
          ?.role === 'PROPRIETAIRE';
      const autreProprietaireExiste = s.contributeurs
        .filter((c) => !c.estAdmin)
        .some((c) => c.estProprietaire && c.id !== utilisateurAdministre.id);
      return !autreProprietaireExiste && utilisateurEstProprietaire;
    })
  );
</script>

{#if servicesSeulProprietaire.length > 0}
  <dsfr-alert size="sm" type="warning" has-description>
    <div slot="description" class="alerte">
      <span
        >Cet utilisateur est actuellement le <b>seul propriétaire</b> de {servicesSeulProprietaire.length}
        {singulierPluriel(
          'service',
          'services',
          servicesSeulProprietaire.length
        )}. Après cette action, seul les administrateurs du périmètre auront
        accès {singulierPluriel(
          'au service',
          'aux services',
          servicesSeulProprietaire.length
        )}. <b>Cette action est irréversible.</b></span
      >
    </div>
  </dsfr-alert>
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
        <span class="seul-proprietaire">
          <lab-anssi-icone taille="sm" nom="warning-line"></lab-anssi-icone>
          Seul propriétaire de ce service
        </span>
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

  dsfr-alert {
    margin-bottom: 24px;

    .alerte {
      padding-bottom: 0.75rem;
      display: block;
    }
  }

  .seul-proprietaire {
    display: flex;
    gap: 8px;
  }
</style>
