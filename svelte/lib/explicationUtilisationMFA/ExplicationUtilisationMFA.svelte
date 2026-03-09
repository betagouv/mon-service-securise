<script lang="ts">
  import { onMount } from 'svelte';
  import Modale from '../ui/Modale.svelte';

  let elementModale: Modale | undefined = $state();

  onMount(() => {
    elementModale?.affiche();
  });
</script>

<Modale id="modale-explication-utilisation-mfa" bind:this={elementModale}>
  {#snippet contenu()}
    <dsfr-badge
      label="Message important"
      type="status"
      status="warning"
      size="md"
    ></dsfr-badge>
    <h4>Activez l'authentification multifacteurs sur ProConnect</h4>
    <div class="contenu-modale">
      <p>
        Afin de renforcer la sécurité des accès à MonServiceSécurisé, l’<b
          >activation de l’authentification multifacteurs (MFA) via ProConnect</b
        > deviendra obligatoire pour toute connexion à MonServiceSécurisé à partir
        de mars 2026.
      </p>
      <p>
        <b>Comment activer l’authentification multifacteurs ?</b>
      </p>
      <ol>
        <li>
          Rendez-vous sur votre <b>profil ProConnect</b>
          <br />
          Profil > Compte et connexion > Double authentification
        </li>
        <li>
          Vous pouvez également accéder directement à la page dédiée via ce lien
          :
          <br />
          👉
          <a
            href="https://identite.proconnect.gouv.fr/double-authentication"
            target="_blank"
            rel="noopener"
            >https://identite.proconnect.gouv.fr/double-authentication</a
          >
        </li>
        <li>
          Vous ne savez pas quelle méthode d’authentification multifacteurs
          choisir ?
          <br />Une FAQ est à votre disposition pour vous guider :
          <br />👉
          <a
            href="https://proconnect.crisp.help/fr/article/quest-ce-que-la-double-authentification-1m5mpmj"
            target="_blank"
            rel="noopener"
            >https://proconnect.crisp.help/fr/article/quest-ce-que-la-double-authentification-1m5mpmj</a
          >
        </li>
      </ol>
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      titre="Me le rappeler plus tard"
      variante="secondaire"
      taille="md"
      positionIcone="sans"
      onclick={() => elementModale?.ferme()}
    ></lab-anssi-bouton>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-explication-utilisation-mfa) {
    max-width: 792px;
    max-height: 740px;

    :global(.contenu-modale) {
      margin-top: 0;
    }
  }

  h4 {
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: #161616;
    margin: 16px 0;
  }

  .contenu-modale {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 24px;
    color: #3a3a3a;

    p {
      margin: 0;
    }

    ol {
      margin: 0;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    a {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
</style>
