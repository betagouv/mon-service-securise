<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { services } from './stores/services.store';
  import Lien from '../ui/Lien.svelte';
</script>

<div class="conteneur-filtres">
  <BarreDeRecherche bind:recherche={$rechercheTextuelle} />
  {#if $services.length > 0}
    <Lien
      classe="nouveau-service"
      titre="Ajouter un service"
      type="bouton-primaire"
      icone="plus"
      href="/service/creation"
    />
  {/if}
</div>

<style>
  .conteneur-filtres {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
