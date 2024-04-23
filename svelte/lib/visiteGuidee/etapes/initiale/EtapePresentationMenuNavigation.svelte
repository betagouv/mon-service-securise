<script>
  import { visiteGuidee } from '../../visiteGuidee.store';
</script>

<div class="conteneur-menu-navigation">
  <div class="menu-navigation">
    <h2>Bienvenue dans <br />MonServiceSécurisé</h2>
    <p>Découvrons l’outil ensemble.</p>
    <ul>
      <li class="decrire">Décrivez</li>
      <li class="desactive securiser">Sécurisez</li>
      <li class="desactive homologuer">Homologuez</li>
      <li class="desactive piloter">Pilotez vos services</li>
    </ul>
    <div class="conteneur-actions">
      <button class="bouton">C'est parti !</button>
      <button
        class="bouton bouton-tertiaire"
        on:click={visiteGuidee.fermeDefinitivementVisiteGuidee}
        >Non merci, je n’ai pas besoin d’aide</button
      >
    </div>
  </div>
  <button class="fermeture-menu" on:click={visiteGuidee.masqueEtapeCourant}>
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

  ul {
    list-style: none;
    padding-left: 0;
    margin-top: 24px;
  }

  ul li {
    font-weight: 500;
    padding-bottom: 20px;
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 8px;
  }

  ul li:before {
    content: '';
    width: 20px;
    height: 20px;
    display: flex;
    background-size: 20px;
  }

  ul li.desactive:before {
    filter: brightness(0) invert(83%) sepia(4%) saturate(776%)
      hue-rotate(178deg) brightness(111%) contrast(76%);
  }

  .decrire:before {
    background-image: url('/statique/assets/images/actionsSaisie/descriptionService.svg');
  }

  .securiser:before {
    background-image: url('/statique/assets/images/actionsSaisie/mesures.svg');
  }

  .homologuer:before {
    background-image: url('/statique/assets/images/actionsSaisie/dossiers.svg');
  }

  .piloter:before {
    background-image: url('/statique/assets/images/actionsSaisie/piloter.svg');
  }

  .desactive {
    color: var(--liseres-fonce);
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
  }

  .fermeture-menu img {
    filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
      hue-rotate(184deg) brightness(107%) contrast(101%);
  }
</style>
