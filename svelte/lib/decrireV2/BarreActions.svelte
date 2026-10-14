<script lang="ts">
  type ModeAffichage = 'Édition' | 'MiseÀJourForcéeBesoinsSécurité';
  interface Props {
    mode: ModeAffichage;
    afficheInfoBesoinsSecurite?: boolean;
    activeBoutonEnregistrer?: boolean;
    onEnregistrer?: () => void;
    onAnnuler?: () => void;
  }

  let {
    mode,
    afficheInfoBesoinsSecurite = false,
    activeBoutonEnregistrer = true,
    onAnnuler,
    onEnregistrer,
  }: Props = $props();
</script>

<div class="barre-actions">
  <div class="les-boutons">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Enregistrer les modifications"
      size="md"
      icon="save-line"
      has-icon
      disabled={!activeBoutonEnregistrer}
      onclick={() => onEnregistrer?.()}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label={mode === 'Édition' ? 'Annuler' : 'Annuler les modifications'}
      kind="tertiary"
      size="md"
      onclick={() => onAnnuler?.()}
    ></dsfr-button>
    {#if afficheInfoBesoinsSecurite}
      <span class="attention-aux-besoins">
        <img src="/statique/assets/images/icone_attention_rose.svg" alt="" />
        En modifiant ce service, ses besoins en sécurité pourront être réévalués.
      </span>
    {/if}
  </div>
</div>

<style lang="scss">
  .barre-actions {
    margin-bottom: 8px;

    .les-boutons {
      display: flex;
      align-items: center;
      gap: 16px;

      dsfr-button {
        white-space: nowrap;
      }

      .attention-aux-besoins {
        color: #666;
        text-align: left;
        display: flex;
        img {
          width: 16px;
          filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(16deg)
            brightness(94%) contrast(87%);
          margin-right: 4px;
        }
      }
    }
  }
</style>
