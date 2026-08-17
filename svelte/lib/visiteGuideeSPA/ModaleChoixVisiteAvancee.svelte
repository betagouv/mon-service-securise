<script lang="ts">
  interface Props {
    estOuverte: boolean;
  }

  let { estOuverte = $bindable() }: Props = $props();
</script>

<dsfr-modal id="modale-choix-visite-avancee" has-footer opened={estOuverte}>
  <div>
    <h4>Que souhaitez-vous découvrir ?</h4>
    <p>Choisissez la fonctionnalité qui vous intéresse.</p>
    <div class="selection-etape-suivante">
      <dsfr-card
        title="📋 Gérer toutes vos mesures"
        has-description
        description="Centralisez et mettez à jour vos mesures sur plusieurs services."
        size="sm"
      ></dsfr-card>
      <dsfr-card
        title="📥 Importer des services"
        has-description
        description="Importez jusqu'à 250 services en une seule fois."
        size="sm"
      ></dsfr-card>
      <dsfr-card
        title="👥 Collaborer avec votre équipe"
        has-description
        description="Invitez des contributeurs et gérez leurs accès."
        size="sm"
      ></dsfr-card>
      <dsfr-card
        title="📊 Piloter votre entité"
        has-description
        description="Suivez tous vos services depuis un tableau de bord."
        size="sm"
      ></dsfr-card>
    </div>
    <p>
      Devenez autonome sur la sécurisation et l'homologation avec
      <dsfr-link
        neutral
        blank
        label="la formation MonServiceSécurisé"
        href="https://app.livestorm.co/lab-anssi/formation-monservicesecurise-declarer-son-premier-service-numerique"
      ></dsfr-link>
    </p>
  </div>
  <div slot="footer" class="actions">
    <dsfr-button label="Créer un service" markup="a" href="/service/v2/creation"
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

  .selection-etape-suivante {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 16px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
