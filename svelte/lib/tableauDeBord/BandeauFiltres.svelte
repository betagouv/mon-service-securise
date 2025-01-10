<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import Lien from '../ui/Lien.svelte';
</script>

<div class="conteneur-filtres">
  <BarreDeRecherche bind:recherche={$rechercheTextuelle} />
  <Lien
    classe="nouveau-service"
    titre="Ajouter un service"
    type="bouton-primaire"
    icone="plus"
    href="/service/creation"
  />
</div>

<style>
  .conteneur-filtres {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
