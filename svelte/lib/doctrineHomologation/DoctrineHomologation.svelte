<script lang="ts">
  import Bloc from './composants/Bloc.svelte';
  import Lien from '../ui/Lien.svelte';
</script>

<Bloc variation="attenue">
  <h1>La nouvelle doctrine d'homologation de sécurité de l'ANSSI est là !</h1>
  <p>
    Découvrez la doctrine, partagez la au sein de votre organisation afin
    d’accélérer vos efforts d’homologation !
  </p>
  <div class="conteneur-actions">
    <Lien
      titre="Télécharger la documentation"
      type="bouton-primaire"
      href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/Doctrine_Homologation_A4.pdf"
      target="_blank"
      icone="telecharger-blanc"
    />
    <Lien
      titre="Consulter la FAQ"
      type="bouton-secondaire"
      href="/conseils-cyber"
    />
  </div>
  <img
    src="/statique/assets/images/illustration_doctrine_homologation.svg"
    alt="Illustration de la nouvelle doctrine d'homologation"
  />
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
</style>
