<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
</script>

<div class="conteneur-filtres">
  <BarreDeRecherche bind:recherche={$rechercheTextuelle} />
</div>
