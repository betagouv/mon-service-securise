<script lang="ts">
  import { termineVisiteGuidee } from './visiteGuidee.api';

  interface Props {
    estOuverte: boolean;
    profilUtilisateurComplet: boolean;
    prenomNom?: string;
  }

  let {
    estOuverte = $bindable(),
    profilUtilisateurComplet,
    prenomNom,
  }: Props = $props();

  const ignore = async () => {
    await termineVisiteGuidee();
    estOuverte = false;
  };
</script>

<dsfr-modal
  id="modale-accueil-visite-guidee"
  has-footer
  opened={estOuverte}
  onclose={() => ignore()}
>
  <div>
    <h4>
      Bonjour{profilUtilisateurComplet && prenomNom ? ` ${prenomNom}` : ''},<br
      /> Bienvenue sur MonServiceSécurisé !
    </h4>
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
</dsfr-modal>

<style lang="scss">
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 16px;
    padding: 0;
  }

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
    gap: 16px;
  }
</style>
