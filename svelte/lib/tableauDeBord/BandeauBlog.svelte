<script lang="ts">
  import CarteDePromotion from './CarteDePromotion.svelte';

  export let dateInscriptionUtilisateur: Date;

  const ilYA1Mois = new Date().setMonth(new Date().getMonth() - 1);
  const utilisateurInscritDepuisPlusD1Mois =
    dateInscriptionUtilisateur.getTime() < ilYA1Mois;
</script>

<h2>Des contenus qui pourraient vous intéresser</h2>
<div class="conteneur-liens-blog">
  {#if utilisateurInscritDepuisPlusD1Mois}
    <CarteDePromotion
      titre="🚀 Promouvoir MonServiceSécurisé"
      href="/promouvoir-monservicesecurise"
    >
      Vous appréciez MonServiceSécurisé ? N'hésitez pas à en parler autour de
      vous !
    </CarteDePromotion>
  {:else}
    <CarteDePromotion
      titre="Notre équipe est à votre écoute"
      href="https://calendly.com/fabien-giraud/presentation-de-monservicesecurise-1"
    >
      <img
        slot="illustration"
        alt=""
        src="/statique/assets/images/tableauDeBord/image_equipe_webinaire.svg"
      />
      Nous vous guiderons dans la découverte et prise en main de MonServiceSécurisé
      au sein de votre organisation.
    </CarteDePromotion>
  {/if}

  <CarteDePromotion titre="Rejoignez la communauté" href="https://malea.dev">
    <img
      slot="illustration"
      src="/statique/assets/images/tableauDeBord/image_rejoignez_communaute.svg"
      alt=""
    />
    <b>Échangez</b> directement avec vos pairs pour une collaboration facilitée.
  </CarteDePromotion>

  <CarteDePromotion titre="Découvrez le blog" href="/conseils-cyber">
    <img
      slot="illustration"
      src="/statique/assets/images/tableauDeBord/image_decouvrez_blog.svg"
      alt=""
    />
    Toutes les réponses à vos questions sur l'homologation de sécurité, la mise en
    oeuvre des mesures
  </CarteDePromotion>
</div>

<style>
  .conteneur-liens-blog {
    display: flex;
    gap: 24px;
  }

  h2 {
    font-size: 1.375rem;
    line-height: 1.75rem;
    font-weight: bold;
    margin-top: 32px;
  }
</style>
