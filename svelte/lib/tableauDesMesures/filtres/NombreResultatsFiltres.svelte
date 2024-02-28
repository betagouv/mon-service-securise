<script>
  import { nombreResultats } from '../tableauDesMesures.store';
  import { menuNavigationOuvert } from '../../ui/menuNavigation.store';
</script>

<p
  class="nombre-resultat"
  class:visible={$nombreResultats.aDesFiltresAppliques}
>
  <strong>{$nombreResultats.filtrees}&nbsp;</strong
  >/&nbsp;{$nombreResultats.total}
  {#if !$menuNavigationOuvert}
    <span>mesures affichées</span>
  {/if}
</p>

<style>
  .nombre-resultat {
    color: #0079d0;
    opacity: 0;
    margin: 0;
  }

  .nombre-resultat.visible {
    opacity: 1;
  }
</style>
