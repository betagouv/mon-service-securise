<script lang="ts">
  export let visible: boolean;
</script>

<div id="contenu-onglet-plan-action" class:visible>
  <p>Plan d’action</p>
</div>

<style>
  #contenu-onglet-plan-action:not(.visible) {
    display: none;
  }
</style>
