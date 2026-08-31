<script lang="ts">
  import { termineVisiteGuidee } from './visiteGuidee.api';

  interface Props {
    estOuverte: boolean;
    profilUtilisateurComplet: boolean;
    prenomNom?: string;
    aDejaVuEntierementVisiteGuidee: boolean;
    onselectionVisiteAvancee: () => void;
  }

  let {
    estOuverte = $bindable(),
    profilUtilisateurComplet,
    prenomNom,
    aDejaVuEntierementVisiteGuidee,
    onselectionVisiteAvancee,
  }: Props = $props();

  const ignore = async () => {
    await termineVisiteGuidee();
    estOuverte = false;
  };

  const titreModale = $derived(
    aDejaVuEntierementVisiteGuidee
      ? 'Choisissez votre visite guidée'
      : `Bonjour${profilUtilisateurComplet && prenomNom ? ` ${prenomNom}` : ''}, bienvenue sur MonServiceSécurisé !`
  );
</script>

<dsfr-modal
  id="modale-accueil-visite-guidee"
  has-footer
  title={titreModale}
  opened={estOuverte}
  onclose={() => ignore()}
>
  {#if aDejaVuEntierementVisiteGuidee}
    <div>
      <p>
        Découvrez MonServiceSécurisé à votre rythme. Commencez par l'essentiel
        ou explorez les fonctionnalités avancées.
      </p>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="selection-etape-suivante">
        <dsfr-card
          title="Découvrez les fonctionnalités essentielles"
          has-description
          description="Prenez en main MonServiceSécurisé en quelques minutes : créez un service, obtenez vos mesures de sécurité et suivez leur avancement."
          has-badge
          size="sm"
          href="/visiteGuidee"
          enlarge
        >
          <dsfr-badge
            slot="badgesgroup"
            label="Essentielle"
            type="accent"
            accent="yellow-moutarde"
          ></dsfr-badge>
        </dsfr-card>
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-card
          title="Explorez les fonctionnalités avancées"
          has-description
          description="Approfondissez votre maîtrise de la plateforme : collaboration, gestion des risques, homologation et pilotage de vos services."
          has-badge
          size="sm"
          action-markup="button"
          onclick={onselectionVisiteAvancee}
          enlarge
        >
          <dsfr-badge
            slot="badgesgroup"
            label="Avancée"
            type="accent"
            accent="purple-glycine"
          ></dsfr-badge>
        </dsfr-card>
      </div>
    </div>
  {:else}
    <div>
      <p>
        Pilotez la sécurité de vos services numériques et homologuez-les
        rapidement. MonServiceSécurisé est gratuit, 100 % en ligne et
        collaboratif. <br /> <br />
        Suivez la visite guidée : 2 minutes pour découvrir la plateforme.
      </p>
    </div>
    <div slot="footer" class="actions">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Ignorer la visite guidée"
        kind="secondary"
        onclick={() => ignore()}
      ></dsfr-button>
      <dsfr-button
        label="Démarrer la visite guidée"
        markup="a"
        href="/visiteGuidee"
      ></dsfr-button>
    </div>
  {/if}
</dsfr-modal>

<style lang="scss">
  p {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 0;
    margin: 0 0 24px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    gap: 16px;
  }

  .selection-etape-suivante {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    & > * {
      flex: 1;
    }
  }
</style>
