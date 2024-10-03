<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import Bouton from '../ui/Bouton.svelte';
</script>

<div class="conteneur">
  <div class="contenu-texte">
    <h1>Connectez-vous</h1>
    <div class="contenu-connexion">
      <div>
        <a class="agentconnect-button" href="/oidc/connexion">
          <span class="agentconnect-sr-only">
            S'identifier avec ProConnect</span
          >
        </a>
        <p>
          <a
            href="https://www.proconnect.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            title="Qu’est-ce que ProConnect ? - nouvelle fenêtre"
          >
            Qu'est-ce que ProConnect ?
          </a>
        </p>
      </div>
      <hr class="separation-agent-connect" />
      <div class="connexion-mss">
        <span class="mention-obligatoire requis">champ obligatoire</span>
        <div class="champ">
          <label for="email" class="requis">Mail professionnel</label>
          <ChampTexte id="email" nom="email" />
        </div>
        <div class="champ">
          <label for="mot-de-passe" class="requis">Mot de passe</label>
          <ChampTexte id="mot-de-passe" nom="mot-de-passe" />
        </div>
        <div class="case-a-cocher">
          <input id="se-souvenir" type="checkbox" name="se-souvenir" />
          <label for="se-souvenir"> Se souvenir de moi </label>
        </div>
        <Bouton type="primaire" titre="Se connecter" actif={false} />
        <div class="pas-de-compte">
          <span>Vous n’avez pas encore de compte ?</span>
          <a href="/inscription">S’inscrire</a>
        </div>
      </div>
    </div>
  </div>

  <div class="contenu-image">
    <img
      src="/statique/assets/images/illustration_connexion.svg"
      alt="Illustration de connexion"
    />
  </div>
</div>

<style>
  .conteneur {
    display: flex;
    width: 100%;
  }

  .contenu-texte {
    flex: 1;
    padding: 56px 0;
    color: var(--texte-fonce);
    font-size: 16px;
  }

  .contenu-connexion {
    width: 385px;
    margin: 0 auto;
  }

  .contenu-texte h1 {
    font-weight: bold;
    font-size: 36px;
    margin-bottom: 40px;
  }

  .contenu-image {
    flex: 1;
    padding: 127px 85.5px;
    background-color: var(--cyan-clair);
  }

  .connexion-mss {
    text-align: left;
    align-items: normal;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .champ {
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .pas-de-compte {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .mention-obligatoire {
    margin-left: auto;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 16px;
  }

  .case-a-cocher label {
    font-weight: normal;
    margin: 0;
  }

  input[type='checkbox'] {
    transform: none;
  }
</style>
