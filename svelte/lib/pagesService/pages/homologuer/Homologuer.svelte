<script lang="ts">
  let dossiers = [];
</script>

{#if dossiers.length === 0}
  <div class="conteneur-projets-vide">
    <img
      src="/statique/assets/images/illustration_dossiers.svg"
      alt="Illustration du dossier d'homologation vide"
    />
    <div>
      <h4>Aucun projet d’homologation en cours</h4>
      <span>
        Aucun projet d’homologation n’est en cours, ni aucune homologation n’a
        été validée.
      </span>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Créer un nouveau projet d'homologation"
      kind="primary"
      size="md"
      onclick={() => {}}
    ></dsfr-button>
  </div>
{:else}{/if}

<style lang="scss">
  .conteneur-projets-vide {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    max-width: 588px;
    color: #161616;
    margin: 0 auto;
    text-align: center;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    img {
      max-width: 200px;
    }

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      margin: 0;
    }

    span {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }
</style>
