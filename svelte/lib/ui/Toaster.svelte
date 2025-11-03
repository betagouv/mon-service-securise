<script lang="ts">
  import { toasterStore } from './stores/toaster.store';
  import { glisse } from './animations/transitions';
  import Toast from './Toast.svelte';

  const icones = { info: 'icone_info', succes: 'icone_succes' };
</script>

{#if $toasterStore.queue.length}
  <aside>
    {#each $toasterStore.queue as { niveau, contenu, titre, id, avecInterpolationHTMLDangereuse = false } (id)}
      <Toast
        {niveau}
        {titre}
        {contenu}
        {avecInterpolationHTMLDangereuse}
        avecFermeture
        on:close={() => toasterStore.fermeToast(id)}
      />
    {/each}
  </aside>
{/if}

<style>
  aside {
    position: fixed;
    right: 36px;
    top: 0;
    width: 540px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1em;
    padding-top: 2em;
    z-index: 1002;
  }
</style>
