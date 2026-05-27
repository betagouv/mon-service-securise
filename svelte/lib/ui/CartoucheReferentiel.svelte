<script lang="ts">
  import type { Referentiel } from './types.d';

  interface Props {
    referentiel: Referentiel;
  }

  let { referentiel }: Props = $props();
</script>

<dsfr-badge
  label={referentiel}
  type="accent"
  accent={referentiel === 'Mesures ajoutées' ? 'blue-ecume' : 'blue-cumulus'}
  size="sm"
></dsfr-badge>
