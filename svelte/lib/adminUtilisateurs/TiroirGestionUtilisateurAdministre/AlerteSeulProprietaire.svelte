<script lang="ts">
  import { singulierPluriel } from '../../outils/string';
  import type { ServiceAdministre } from '../adminUtilisateurs.types';

  interface Props {
    servicesSeulProprietaire: ServiceAdministre[];
    modeAttribution?: boolean;
  }

  let { servicesSeulProprietaire, modeAttribution = false }: Props = $props();
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
        )}.
        {#if !modeAttribution}
          Après cette action, seul les administrateurs du périmètre auront accès {singulierPluriel(
            'au service',
            'aux services',
            servicesSeulProprietaire.length
          )}. <b>Cette action est irréversible.</b>{/if}
      </span>
    </div>
  </dsfr-alert>
{/if}

<style lang="scss">
  dsfr-alert {
    margin-bottom: 24px;

    .alerte {
      padding-bottom: 0.75rem;
      display: block;
    }
  }
</style>
