<script lang="ts">
  export let dateInscriptionUtilisateur: Date;

  const ilYA1Mois = new Date().setMonth(new Date().getMonth() - 1);
  const utilisateurInscritDepuisPlusD1Mois =
    dateInscriptionUtilisateur.getTime() < ilYA1Mois;
</script>

<h2>Des contenus qui pourraient vous intéresser</h2>
<div class="conteneur-liens-blog">
  <a class="carte avec-image decouvrez-blog" href="/conseils-cyber">
    <div class="contenu-carte">
      <h3>Découvrez le blog</h3>
      <p>
        Toutes les réponses à vos questions sur l'homologation de sécurité, la
        mise en oeuvre des mesures
      </p>
    </div>
    <span class="fleche-navigation"></span>
  </a>

  <a
    class="carte avec-image rejoignez-communaute"
    href="https://tally.so/r/wa6o22"
    target="_blank"
    rel="noopener"
  >
    <div class="contenu-carte">
      <h3>Rejoignez la communauté</h3>
      <p>
        <b>Échangez</b> directement avec vos pairs pour une collaboration facilitée.
      </p>
    </div>
    <span class="fleche-navigation"></span>
  </a>

  {#if utilisateurInscritDepuisPlusD1Mois}
    <a class="carte" href="/promouvoir-monservicesecurise">
      <div class="contenu-carte">
        <h3>🚀 Promouvoir MonServiceSécurisé</h3>
        <p>
          Vous appréciez MonServiceSécurisé ? N'hésitez pas à en parler autour
          de vous !
        </p>
      </div>
      <span class="fleche-navigation"></span>
    </a>
  {:else}
    <a
      class="carte avec-image webinaire"
      href="https://calendly.com/fabien-giraud/presentation-de-monservicesecurise-1"
      target="_blank"
      rel="noopener"
    >
      <div class="contenu-carte">
        <h3>Notre équipe est à votre écoute</h3>
        <p>
          Antoine et Fabien vous guideront dans la découverte et la prise en
          main de MonServiceSécurisé au sein de votre organisation. Notre
          priorité&nbsp;: vous accompagner.
        </p>
      </div>
      <span class="fleche-navigation"></span>
    </a>
  {/if}
</div>

<style>
  .conteneur-liens-blog {
    display: flex;
    gap: 24px;
  }

  .carte.avec-image::before {
    content: '';
    display: inline-block;
    vertical-align: bottom;
    flex: 0 0 135px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
  }

  .carte.avec-image.webinaire::before {
    background-color: var(--bleu-mise-en-avant);
    background-image: url('/statique/assets/images/tableauDeBord/image_equipe_webinaire.svg');
  }

  .carte.avec-image.rejoignez-communaute::before {
    background-color: var(--bleu-mise-en-avant);
    background-image: url('/statique/assets/images/tableauDeBord/image_rejoignez_communaute.svg');
  }

  .carte.avec-image.decouvrez-blog::before {
    background-image: url('/statique/assets/images/tableauDeBord/image_decouvrez_blog.svg');
  }

  .contenu-carte {
    padding: 24px 24px 56px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h2 {
    font-size: 1.375rem;
    line-height: 1.75rem;
    font-weight: bold;
  }

  h3 {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: bold;
    color: #042794;
    text-decoration: none;
    margin: 0;
  }

  .carte {
    height: 204px;
    position: relative;
    flex: 1 1 0;
    border: 1px solid var(--systeme-design-etat-contour-champs);
    border-radius: 8px;
    display: flex;
  }

  .carte:hover {
    box-shadow: 0px 16px 32px 0px #0000001f;
  }

  .carte p {
    margin: 0;
    color: #282828;
    font-size: 0.875rem;
    line-height: 1.5rem;
    max-height: 3.45em;
    overflow: hidden;
  }

  .fleche-navigation {
    content: '';
    background: url(/statique/assets/images/fleche_gauche_bleue.svg);
    width: 16px;
    height: 16px;
    transform: rotate(180deg);
    filter: brightness(0) saturate(100%) invert(12%) sepia(63%) saturate(4499%)
      hue-rotate(239deg) brightness(87%) contrast(141%);
    background-size: contain;
    position: absolute;
    bottom: 24px;
    right: 24px;
  }
</style>
