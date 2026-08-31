<script lang="ts">
  interface Props {
    estOuverte: boolean;
    utilisateurADesServices: boolean;
    onselectionVisiteAvancee: () => void;
  }

  let {
    estOuverte = $bindable(),
    utilisateurADesServices,
    onselectionVisiteAvancee,
  }: Props = $props();
</script>

<dsfr-modal
  id="modale-fin-visite-guidee"
  has-footer
  opened={estOuverte}
  title="À vous de jouer !"
>
  <div>
    <p>
      <b>Retrouvez ici une vision synthétique de tous vos services.</b>
      <br /><br />
      Choisissez la suite : créez votre premier service, découvrez les fonctionnalités
      avancées ou formez-vous à MonServiceSécurisé.
    </p>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="selection-etape-suivante">
      <dsfr-card
        title="Formation MonServiceSécurisé"
        has-description
        description="En 2 ateliers pratiques, devenez autonome sur toute la démarche d’homologation"
        has-badge
        size="sm"
        action-markup="a"
        href="https://app.livestorm.co/lab-anssi/formation-monservicesecurise-declarer-son-premier-service-numerique"
        blank
        enlarge
      >
        <dsfr-badge
          slot="badgesgroup"
          label="Accompagnement"
          type="accent"
          accent="yellow-moutarde"
        ></dsfr-badge>
      </dsfr-card>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-card
        title="Fonctionnalités avancées"
        has-description
        description="Poursuivez la visite guidée pour explorer les fonctionnalités avancées"
        has-badge
        size="sm"
        action-markup="button"
        onclick={onselectionVisiteAvancee}
        enlarge
      >
        <dsfr-badge
          slot="badgesgroup"
          label="Visite guidée"
          type="accent"
          accent="purple-glycine"
        ></dsfr-badge>
      </dsfr-card>
    </div>
  </div>
  <div slot="footer" class="actions">
    {#if utilisateurADesServices}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Retourner à mon tableau de bord"
        onclick={() => (estOuverte = false)}
      ></dsfr-button>
    {:else}
      <dsfr-button
        label="Créer mon premier service"
        markup="a"
        href="/service/v2/creation"
      ></dsfr-button>
    {/if}
  </div>
</dsfr-modal>

<style lang="scss">
  p {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 0;
    margin: 0 0 24px;
  }

  .selection-etape-suivante {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    & > * {
      flex: 1;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
</style>
