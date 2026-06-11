<script lang="ts">
  interface Props {
    onclick: () => unknown;
  }

  let { onclick }: Props = $props();
</script>

<div class="aucun-resultat">
  <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
  <h4>Aucun résultat ne correspond à votre recherche</h4>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    kind="secondary"
    icon="restart-line"
    has-icon
    label="Effacer la recherche"
    {onclick}
  ></dsfr-button>
</div>

<style lang="scss">
  .aucun-resultat {
    padding: 36px 0;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-direction: column;
    color: #161616;
    max-width: 588px;
    margin: 0 auto;

    h4 {
      margin: 0;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: bold;
    }

    img {
      max-width: 128px;
      transform: scaleX(-1);
    }

    dsfr-button {
      margin-top: 16px;
    }
  }
</style>
