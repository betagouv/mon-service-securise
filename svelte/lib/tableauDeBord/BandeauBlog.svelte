<script lang="ts">
  import CarteDePromotion from './CarteDePromotion.svelte';
</script>

<h2>Des contenus qui pourraient vous intéresser</h2>
<div class="conteneur-liens-blog">
  <CarteDePromotion
    titre="Inscrivez-vous à la formation à l'homologation de sécurité avec MonServiceSécurisé !"
    href="https://app.livestorm.co/lab-anssi/formation-monservicesecurise-declarer-son-premier-service-numerique?s=fd6032fa-4833-4403-8087-3945d168752e"
    illustration="/statique/assets/images/tableauDeBord/image_formation_mss.png"
    description="Découvrez pas à pas comment lancer un premier projet d'homologation et passez à l'échelle !"
  />

  <CarteDePromotion
    titre="Rejoignez la communauté"
    href="https://tally.so/r/wa6o22"
    illustration="/statique/assets/images/tableauDeBord/image_rejoignez_communaute.png"
    description="Échangez directement avec vos pairs pour une collaboration facilitée."
  />

  <CarteDePromotion
    titre="Découvrez MesServicesCyber&nbsp;!"
    href="https://messervices.cyber.gouv.fr/"
    illustration="/statique/assets/images/tableauDeBord/image_promotion_msc.png"
    description="MesServicesCyber, la plateforme pour faciliter l'accès de tous aux services et ressources de l'ANSSI et de ses partenaires."
  />
</div>

<style>
  .conteneur-liens-blog {
    display: flex;
    gap: 24px;
  }

  h2 {
    font-size: 2rem;
    line-height: 2.5rem;
    font-weight: 700;
    margin: 24px 0;
  }
</style>
