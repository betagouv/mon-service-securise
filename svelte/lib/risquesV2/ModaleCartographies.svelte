<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  let elementModale: Modale | undefined;

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-confirmation-fermeture" bind:this={elementModale}>
  {#snippet contenu()}
    <div class="contenu-modale">Hello</div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Fermer"
      kind="secondary"
      size="md"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
</style>
