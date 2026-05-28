<script lang="ts">
  import type { Referentiel } from './types.d';

  interface Props {
    referentiel: Referentiel;
  }

  let { referentiel }: Props = $props();
</script>

<dsfr-tag label={referentiel} size="sm"></dsfr-tag>
