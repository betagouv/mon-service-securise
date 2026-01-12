<script lang="ts">
  export let invite: boolean;
</script>

<div class="conteneur">
  <div class="contenu-texte">
    {#if invite}
      <h1>Bienvenue, <br />vous avez été invité à contribuer à un service</h1>
      <h2>
        Pour commencer à sécuriser ce service, veuillez vous créer un compte
        avec l'adresse e-mail avec laquelle vous avez été invité.
      </h2>
    {:else}
      <h1>Créez votre compte MonServiceSécurisé</h1>
    {/if}
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
      <p class="deja-un-compte">
        Vous avez déjà un compte ? <a href="/connexion">Se connecter</a>
      </p>
    </div>
  </div>

  <div class="contenu-image">
    <img
      src="/statique/assets/images/illustration_accueil_connexion.svg"
      alt="Illustration de connexion"
    />
  </div>
</div>

<style>
  .conteneur {
    display: flex;
    flex-grow: 1;
    width: 100%;
  }

  .contenu-texte {
    flex: 1;
    text-align: center;
    padding: 56px 102px;
    color: var(--texte-fonce);
    font-size: 1rem;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .contenu-connexion {
    width: 385px;
    margin: 0 auto;
  }

  .contenu-texte h1 {
    font-weight: bold;
    font-size: 2.25rem;
    margin: 0;
  }

  .contenu-texte h2 {
    margin-top: 8px;
    margin-bottom: 0;
    font-size: 1rem;
    font-weight: normal;
  }

  .agentconnect-button {
    margin-top: 40px;
  }

  .contenu-image {
    flex: 1;
    padding: 127px 85.5px;
    background-color: var(--bleu-mise-en-avant);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .deja-un-compte {
    margin-top: 40px;
  }
</style>
