<script lang="ts">
  import { store } from '../mesure.store';
  import SelectionPriorite from '../../ui/SelectionPriorite.svelte';

  export let visible: boolean;
  export let estLectureSeule: boolean;
</script>

<div id="contenu-onglet-plan-action" class:visible>
  <p>
    Le plan d'action vous permet de mettre en oeuvre plus rapidement les mesures
    en équipe.
  </p>
  <SelectionPriorite
    id="priorite"
    bind:priorite={$store.mesureEditee.mesure.priorite}
    label="Priorité"
    {estLectureSeule}
    avecLibelleOption
  />
</div>

<style>
  #contenu-onglet-plan-action:not(.visible) {
    display: none;
  }

  #contenu-onglet-plan-action {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  p {
    font-weight: bold;
    line-height: 22px;
    font-size: 16px;
    margin: 0;
  }
</style>
