<script lang="ts">
  import { CategorieMesure } from './types.d';

  interface Props {
    categorie: CategorieMesure;
  }

  let { categorie }: Props = $props();
  const labelsCategories: Record<CategorieMesure, string> = {
    [CategorieMesure.DEFENSE]: 'Défense',
    [CategorieMesure.GOUVERNANCE]: 'Gouvernance',
    [CategorieMesure.PROTECTION]: 'Protection',
    [CategorieMesure.RESILIENCE]: 'Résilience',
  };
</script>

<dsfr-tag label={labelsCategories[categorie]}></dsfr-tag>
