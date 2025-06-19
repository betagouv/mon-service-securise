<script lang="ts">
  import { CategorieMesure } from './types.d';

  export let categorie: CategorieMesure;
  const labelsCategories: Record<CategorieMesure, string> = {
    [CategorieMesure.DEFENSE]: 'Défense',
    [CategorieMesure.GOUVERNANCE]: 'Gouvernance',
    [CategorieMesure.PROTECTION]: 'Protection',
    [CategorieMesure.RESILIENCE]: 'Résilience',
  };
</script>

<span class="categorie">{labelsCategories[categorie]}</span>

<style>
  .categorie {
    width: fit-content;
    background: #f1f5f9;
    color: #667892;
    padding: 1px 8px 3px 8px;
    font-size: 0.9em;
    font-weight: 500;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
