<script lang="ts">
  import type { Entite } from './types';

  interface Props {
    entite: Entite;
  }

  let { entite }: Props = $props();
</script>

{entite.nom ?? entite.siret}
