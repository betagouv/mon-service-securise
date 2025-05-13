<script lang="ts">
  import Bloc from './composants/Bloc.svelte';
  import Tuile from './composants/Tuile.svelte';
  import Lien from '../ui/Lien.svelte';
  import CarrouselTuiles from './composants/CarrouselTuiles.svelte';
  import TuileTelechargement from './composants/TuileTelechargement.svelte';
</script>

<Bloc variation="attenue" classe="hero">
  <div>
    <h1>
      Les nouveaux principes et étapes de l'homologation de sécurité de l'ANSSI
      sont là !
    </h1>
    <p>
      Découvrez-les et partagez-les sein de votre organisation afin d’accélérer
      vos efforts d’homologation !
    </p>
    <div class="conteneur-actions">
      <Lien
        titre="Télécharger la documentation"
        type="bouton-primaire"
        href="#les-documents-utiles"
        icone="telecharger-blanc"
      />
      <Lien
        titre="Consulter les articles"
        type="bouton-secondaire"
        href="/conseils-cyber"
      />
    </div>
  </div>
  <img
    src="/statique/assets/images/doctrine-homologation/illustration_doctrine_homologation.svg"
    alt="Illustration de la nouvelle doctrine d'homologation"
    class="illustration"
  />
</Bloc>
<Bloc variation="primaire" sansMargeLaterale>
  <CarrouselTuiles />
</Bloc>
<Bloc>
  <h2 class="centre" id="video-decouvrez-homologation-simplifiee">
    Découvrez l'homologation simplifiée
  </h2>
  <div class="conteneur-video">
    <video controls crossorigin="anonymous">
      <source
        src="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/Nouvelle_doctrine_homologation.mp4"
        type="video/mp4"
      />
      <track
        src="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/Nouvelle_doctrine_homologation.vtt"
        kind="captions"
        srclang="fr"
        label="Français"
      />
    </video>
  </div>
</Bloc>
<Bloc variation="attenue">
  <div class="enjeu">
    <h2>L'enjeu pour vous</h2>
    <img
      src="/statique/assets/images/doctrine-homologation/illustration_ordinateurs.svg"
      alt="Illustration de l'enjeu"
      class="illustration invisible-tablette"
    />
    <p class="sous-texte">
      <b>
        L'homologation de sécurité est une obligation pour tous les systèmes
        d'information de l'Etat, les services numériques des collectivités et de
        certains autres organismes.
      </b>
    </p>
    <ul>
      <li>
        🤝 Comment participer à une démarche d'homologation lorsque l'on n'est
        pas soi-même <b>spécialiste cyber</b> ?
      </li>
      <li>
        ⏳ Comment réussir à homologuer tous ses systèmes quand on <b
          >manque de temps pour le faire</b
        > ?
      </li>
    </ul>
  </div>
  <div class="proposition">
    <h2>Notre proposition</h2>
    <img
      src="/statique/assets/images/doctrine-homologation/illustration_homologuation_personnages.svg"
      alt="Illustration de notre proposition"
      class="illustration"
    />
    <p class="sous-texte">
      <b>
        Proportionner vos efforts de sécurisation et d'homologation de chaque
        système et clarifier les attentes pour chaque niveau de démarche. Cela
        signifie :
      </b>
    </p>
    <ul>
      <li>
        ⚡ S'autoriser <b>une démarche simplifiée</b>, plus légère et accélérée,
        pour les systèmes à besoins de sécurité les moins élevés : moins de
        documentation, moins de réunions, plus d'efficacité, plus de sécurité.
      </li>
      <li>
        💡 Adopter <b>une démarche renforcée</b>, rigoureuse et approfondie,
        pour les systèmes aux besoins beaucoup plus importants : tout savoir de
        la sécurité d'un système et contrôler pour une décision éclairée !
      </li>
    </ul>
  </div>
</Bloc>
<Bloc variation="primaire">
  <h2>Mon&ZeroWidthSpace;Service&ZeroWidthSpace;Sécurisé,</h2>
  <p class="sans-marge-basse solution-anssi">
    <b
      >La solution de l’ANSSI pour vous permettre de piloter en équipe la
      sécurité et l'homologation tous vos services publics numériques !</b
    >
  </p>
  <div class="mon-service-securise">
    <img
      src="/statique/assets/images/doctrine-homologation/illustration_tdb.svg"
      alt="Illustration de la nouvelle doctrine d'homologation"
      class="illustration sans-marge-basse"
    />
    <ul class="liste-mss">
      <li>
        <p class="titre-element-liste">
          Des efforts de sécurisation proportionnés !
        </p>
        <p class="contenu-element-liste">
          Obtenez une évaluation des besoins de sécurité de chaque service et
          découvrez une liste de mesure de sécurité personnalisée.
        </p>
      </li>
      <li>
        <p class="titre-element-liste">Un plan d’action cyber collaboratif</p>
        <p class="contenu-element-liste">
          Construisez en équipe votre plan d'action cyber.
        </p>
      </li>
      <li>
        <p class="titre-element-liste">L’homologation, en toute simplicité</p>
        <p class="contenu-element-liste">
          Téléchargez un projet de dossier d'homologation clé-en-main.
        </p>
      </li>
      <li>
        <p class="titre-element-liste">
          Pilotez tous vos services au même endroit
        </p>
        <p class="contenu-element-liste">
          Supervisez tous vos services depuis votre tableau de bord.
        </p>
      </li>
    </ul>
  </div>
  <Lien
    titre="Commencer à homologuer"
    type="bouton-tertiaire"
    href="/inscription"
    classe="lien-commencer-homologuer"
  />
</Bloc>
<Bloc variation="defaut">
  <h2 class="grande-marge-basse" id="les-documents-utiles">
    Les documents utiles
  </h2>
  <div class="conteneur-tuiles-telechargement">
    <TuileTelechargement
      titre="L’homologation simplifiée"
      contenu="Une présentation pédagogique présentant les grands principes de l'homologation de sécurité accessible à toutes et tous."
      illustration="/statique/assets/images/doctrine-homologation/thumbnail-pdf-doctrine.png"
      href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/LAB_Homologation_Simplifiee.pdf"
    />
    <TuileTelechargement
      titre="Le guide d’homologation de la sécurité des SI"
      contenu="Le guide d'homologation détaillé de l'ANSSI pour les spécialistes de l'homologation de sécurité."
      illustration="/statique/assets/images/doctrine-homologation/thumbnail-pdf-anssi.png"
      href="https://cyber.gouv.fr/lhomologation-de-securite"
      lienExterne
    />
  </div>
</Bloc>

<style>
  h1 {
    font-size: 40px;
    margin: 0;
    line-height: 48px;
    word-break: break-word;
  }

  p {
    font-size: 20px;
    line-height: 32px;
    margin: 8px 0 24px;
  }

  .conteneur-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .centre {
    text-align: center;
  }

  h2 {
    font-size: 32px;
    font-weight: 700;
    line-height: 40px;
    margin: 0;
  }

  .conteneur-video {
    display: flex;
    justify-content: center;
  }

  video {
    margin: 56px 0 24px 0;
    width: 100%;
    max-width: 792px;
  }

  .illustration {
    margin-top: 48px;
    margin-bottom: 24px;
    width: 100%;
  }

  .sous-texte {
    font-size: 16px;
    line-height: 24px;
  }

  ul {
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }

  ul li {
    font-size: 16px;
  }

  .sans-marge-basse {
    margin-bottom: 0;
  }

  .liste-mss {
    margin-top: 0;
    padding-left: 0;
    list-style-type: none;
  }

  .liste-mss li {
    padding-left: 32px;
    border-left: 4px solid #fff;
  }

  .titre-element-liste {
    font-size: 22px;
    font-weight: 700;
    line-height: 28px;
    margin-top: 0;
    margin-bottom: 8px;
  }

  .contenu-element-liste {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    margin: 0;
  }

  .grande-marge-basse {
    margin-bottom: 56px;
  }

  .conteneur-tuiles-telechargement {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :global(#doctrine-homologation .lien-commencer-homologuer) {
    margin: 0 auto;
  }

  @media screen and (min-width: 577px) {
    :global(#doctrine-homologation .hero) {
      display: flex;
    }

    :global(#doctrine-homologation .hero > *) {
      flex: 1;
    }

    .enjeu {
      display: grid;
      grid-template-areas:
        'titre illustration'
        'contenu illustration'
        'liste illustration';
      grid-template-columns: 50%;
      grid-column-gap: 16px;
    }

    .proposition {
      display: grid;
      grid-template-areas:
        'illustration titre'
        'illustration contenu'
        'illustration liste';
      grid-template-columns: 50%;
      grid-column-gap: 16px;
      margin-top: 32px;
    }

    .enjeu h2,
    .proposition h2 {
      grid-area: titre;
    }

    .enjeu p,
    .proposition p {
      grid-area: contenu;
    }

    .enjeu ul,
    .proposition ul {
      grid-area: liste;
    }

    .enjeu .illustration,
    .proposition .illustration {
      grid-area: illustration;
      align-self: center;
    }

    .mon-service-securise {
      display: grid;
      grid-template-areas: 'liste illustration';
      grid-template-columns: 50%;
      grid-column-gap: 16px;
      margin-top: 32px;
    }

    .mon-service-securise .illustration {
      grid-area: illustration;
      align-self: center;
    }

    .mon-service-securise ul {
      grid-area: liste;
      align-self: center;
    }

    .solution-anssi {
      max-width: 808px;
    }

    .titre-element-liste {
      font-size: 24px;
      line-height: 32px;
    }

    .conteneur-tuiles-telechargement {
      flex-direction: row;
    }
  }

  @media screen and (min-width: 1247px) {
    .enjeu,
    .proposition {
      grid-column-gap: 24px;
    }
  }
</style>
