<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import MotDePasse from '../ui/MotDePasse.svelte';
  import Formulaire from '../ui/Formulaire.svelte';

  export let urlRedirection: string;

  let login: string;
  let motDePasse: string;

  let afficheErreur: boolean = false;

  export const connecte = async () => {
    try {
      await axios.post('/api/token', { login, motDePasse });
      window.location.href = urlRedirection ?? '/tableauDeBord';
    } catch (erreur: any) {
      if (erreur.response.status === 401) {
        afficheErreur = true;
      }
    }
  };
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
      <Formulaire on:formulaireValide={connecte}>
        <div class="connexion-mss">
          <span class="mention-obligatoire requis">champ obligatoire</span>
          <div class="champ">
            <label for="email" class="requis">Mail professionnel</label>
            <ChampTexte
              type="email"
              id="email"
              nom="email"
              bind:valeur={login}
            />
          </div>
          <div class="champ">
            <label for="mot-de-passe" class="requis">Mot de passe</label>
            <MotDePasse
              id="mot-de-passe"
              nom="mot-de-passe"
              bind:valeur={motDePasse}
            />
            <a href="/reinitialisationMotDePasse">mot de passe oublié</a>
          </div>
          <span class:afficheErreur class="message-erreur">
            L'email et le mot de passe saisis ne correspondent à aucun compte.
            Veuillez renseigner les identifiants d'un compte existant.
          </span>

          <Bouton type="primaire" titre="Se connecter" />
          <div class="pas-de-compte">
            <span>Vous n’avez pas encore de compte ?</span>
            <a href="/inscription">S’inscrire</a>
          </div>
        </div>
      </Formulaire>
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
    flex-grow: 1;
  }

  .contenu-texte {
    flex: 1;
    padding: 30px 102px;
    color: var(--texte-fonce);
    font-size: 1rem;
    background-color: white;
    flex-direction: column;
    display: flex;
    justify-content: center;
  }

  .contenu-connexion {
    width: 385px;
    margin: 0 auto;
  }

  .contenu-texte h1 {
    font-weight: bold;
    font-size: 2.25rem;
    margin-bottom: 30px;
    margin-top: 0;
  }

  .contenu-image {
    flex: 1;
    padding: 127px 85.5px;
    background-color: var(--cyan-clair);
    flex-direction: column;
    display: flex;
    justify-content: center;
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
    font-size: 1rem;
  }

  .message-erreur {
    position: relative;
    display: none;
    color: var(--rose-anssi);
    font-weight: normal;
    align-items: center;
    flex-direction: row;
    gap: 8px;
  }

  .message-erreur::before {
    content: '';
    display: flex;
    flex-shrink: 0;
    background-image: url(/statique/assets/images/icone_attention_rose.svg);
    background-repeat: no-repeat;
    background-size: contain;
    width: 24px;
    height: 24px;
  }

  .afficheErreur {
    display: flex;
    align-items: start;
  }
</style>
