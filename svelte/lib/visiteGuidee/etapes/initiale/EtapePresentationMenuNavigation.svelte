<script>
  import { visiteGuidee } from '../../visiteGuidee.store';
  import IndicateurEtape from '../../kit/IndicateurEtape.svelte';
</script>

<div class="conteneur-menu-navigation">
  <div class="menu-navigation">
    <h2>Bienvenue dans <br />MonServiceSécurisé</h2>
    <p class="decouvrir-outil">Découvrons l’outil ensemble.</p>
    <IndicateurEtape
      configuration={{
        etapes: [
          {
            titre: 'Décrivez',
            id: 'DECRIRE',
            icone:
              '/statique/assets/images/actionsSaisie/descriptionService.svg',
          },
          {
            titre: 'Sécurisez',
            id: 'securiser',
            icone: '/statique/assets/images/actionsSaisie/mesures.svg',
          },
          {
            titre: 'Homologuez',
            id: 'homologuer',
            icone: '/statique/assets/images/actionsSaisie/dossiers.svg',
          },
          {
            titre: 'Pilotez vos services',
            id: 'piloter',
            icone: '/statique/assets/images/actionsSaisie/piloter.svg',
          },
        ],
      }}
      etapeCourante="DECRIRE"
    />
    <div class="conteneur-actions">
      <button
        class="bouton"
        on:click={async () => await visiteGuidee.etapeSuivante()}
        >C'est parti !</button
      >
      <button
        class="bouton bouton-tertiaire"
        on:click={async () =>
          await visiteGuidee.fermeDefinitivementVisiteGuidee()}
        >Non merci, je n’ai pas besoin d’aide</button
      >
    </div>
  </div>
  <button
    class="fermeture-menu"
    on:click={async () => await visiteGuidee.masqueEtapeCourante()}
  >
    <img
      src="/statique/assets/images/icone_fermeture_modale.svg"
      alt="Fermeture du menu de navigation"
      width="24"
      height="24"
    />
  </button>
</div>

<style>
  .conteneur-menu-navigation {
    color: var(--gris-fonce);
    position: fixed;
    bottom: 64px;
    left: 50px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
  }

  .menu-navigation {
    border-radius: 8px;
    background: #ffffff;
    padding: 24px;
    width: fit-content;
  }

  h2 {
    margin: 0;
    color: var(--bleu-anssi);
  }

  p.decouvrir-outil {
    margin-bottom: 24px;
  }

  .conteneur-actions {
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 10px;
  }

  button {
    margin: 0;
    width: fit-content;
    padding: 8px 16px;
  }

  .fermeture-menu {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: #ffffff;
    width: 44px;
    height: 44px;
    margin-top: 8px;
    cursor: pointer;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
  }

  .fermeture-menu img {
    filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
      hue-rotate(184deg) brightness(107%) contrast(101%);
  }
</style>
