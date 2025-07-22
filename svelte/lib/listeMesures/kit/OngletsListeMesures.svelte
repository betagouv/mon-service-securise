<script context="module" lang="ts">
  export type CleOngletListeMesure = 'generales' | 'specifiques';
</script>

<script lang="ts">
  import Onglet from '../../ui/Onglet.svelte';
  import { mesuresReferentiel } from '../stores/mesuresReferentiel.store';
  import { modelesMesureSpecifique } from '../stores/modelesMesureSpecifique.store';

  export let ongletActif: CleOngletListeMesure;
</script>

<div class="conteneur-onglets">
  <Onglet
    bind:ongletActif
    cetOnglet="generales"
    labelOnglet="Les mesures ANSSI & CNIL"
    badge={Object.keys($mesuresReferentiel).length}
  />
  <Onglet
    bind:ongletActif
    cetOnglet="specifiques"
    labelOnglet="Mes mesures ajoutées"
    badge={$modelesMesureSpecifique.length}
  />
</div>

<style lang="scss">
  .conteneur-onglets {
    display: flex;
    gap: 8px;
    margin-bottom: -1px;
  }
</style>
