<script lang="ts">
  import type { Entite } from './types';

  interface Props {
    entite: Entite;
  }

  let { entite }: Props = $props();
  console.log(entite);
</script>

{entite.departement ? `(${entite.departement}) ` : ''}{entite.nom ??
  entite.siret}
