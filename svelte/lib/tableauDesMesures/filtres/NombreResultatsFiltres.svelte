<script>
  import { nombreResultats } from '../stores/nombreDeResultats.store';
  import { volumetrieMesures } from '../stores/volumetrieMesures.store';
</script>

<p
  class="nombre-resultat"
  class:visible={$nombreResultats.aDesFiltresAppliques}
>
  <strong>{$nombreResultats.filtrees}&nbsp;</strong
  >/&nbsp;{$volumetrieMesures.total}
  <span>mesures affichées</span>
</p>

<style>
  .nombre-resultat {
    color: #0079d0;
    opacity: 0;
    margin: 0;
    white-space: nowrap;
  }

  .nombre-resultat.visible {
    opacity: 1;
  }
</style>
