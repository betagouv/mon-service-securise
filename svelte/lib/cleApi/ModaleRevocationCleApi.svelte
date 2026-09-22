<script lang="ts">
  interface Props {
    ouverte: boolean;
    prefixe: string | undefined;
    enCours: boolean;
    onConfirme: () => void;
    onAnnule: () => void;
  }

  let { ouverte, prefixe, enCours, onConfirme, onAnnule }: Props = $props();
</script>

<dsfr-modal
  id="modale-revocation-cle-api"
  has-footer
  opened={ouverte}
  title="Confirmation requise"
  onclose={onAnnule}
>
  <div>
    <dsfr-alert
      size="sm"
      type="warning"
      has-description
      text="Cette action est irréversible."
    ></dsfr-alert>
    <p class="texte-modale">
      Voulez-vous vraiment révoquer la clé <code>mss_live_{prefixe}_…</code>
      ? <br /> Toute application qui l'utilise perdra immédiatement l'accès à l'API.
    </p>
  </div>
  <div slot="footer" class="conteneur-actions-modale">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      kind="secondary"
      size="md"
      type="button"
      onclick={onAnnule}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Révoquer"
      kind="primary"
      size="md"
      type="button"
      disabled={enCours}
      onclick={onConfirme}
    ></dsfr-button>
  </div>
</dsfr-modal>

<style lang="scss">
  .texte-modale {
    font-size: 1rem;
    line-height: 1.5rem;
    margin-top: 16px;
  }

  .conteneur-actions-modale {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
</style>
