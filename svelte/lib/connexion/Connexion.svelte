<script lang="ts">
  import Lien from '../ui/Lien.svelte';

  interface Props {
    urlRedirection: string;
  }

  let { urlRedirection }: Props = $props();

  let cheminRedirection = $derived(
    urlRedirection && new URL(urlRedirection).pathname
  );
</script>

<div class="conteneur">
  <div class="contenu-texte">
    <h1>Connectez-vous à MonServiceSécurisé</h1>
    <div class="contenu-connexion">
      <div>
        <a
          class="agentconnect-button"
          href={cheminRedirection
            ? `/oidc/connexion?urlRedirection=${cheminRedirection}`
            : '/oidc/connexion'}
        >
          <span class="agentconnect-sr-only">
            S'identifier avec ProConnect</span
          >
        </a>
        <p>
          <dsfr-link
            href="https://www.proconnect.gouv.fr"
            blank
            rel="noopener noreferrer"
            title="Qu’est-ce que ProConnect ? - nouvelle fenêtre"
            label="Qu'est-ce que ProConnect ?"
          >
          </dsfr-link>
        </p>
      </div>
      <dsfr-callout
        text="Depuis le 5 mars 2026, la connexion à MonServiceSécurisé se fait uniquement via ProConnect.
"
        title="Évolution des modes de connexion"
        title-markup="h3"
        button-label="En savoir plus"
        icon="info-line"
        has-title
        has-icon
        has-button
      >
        <dsfr-button
          slot="button"
          markup="a"
          label="En savoir plus"
          href="https://aide.monservicesecurise.cyber.gouv.fr/fr/article/la-connexion-a-monservicesecurise-evolue-1jr2z6k"
          kind="primary"
          target="_blank"
        ></dsfr-button>
      </dsfr-callout>

      <div class="pas-encore-compte">
        <span>Vous n'avez pas encore de compte ?</span>
        <dsfr-link href="/inscription" label="S'inscrire"></dsfr-link>
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

<style lang="scss">
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
    width: 496px;
    margin: 0 auto;
  }

  .contenu-texte h1 {
    color: black;
    max-width: 500px;
    align-self: center;
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

  dsfr-callout {
    text-align: left;
  }

  .pas-encore-compte {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
