<script lang="ts">
  import { onMount } from 'svelte';
  import Modale from '../ui/Modale.svelte';

  const NB_ETAPES = 2;

  let indexEtapeCourante = 0;
  let elementModale: Modale;

  onMount(() => {
    elementModale?.affiche();
  });

  export const affiche = () => {
    indexEtapeCourante = 0;
    elementModale?.affiche();
  };

  const afficheEtape = (index: number) => {
    indexEtapeCourante = index;
    const contenuScrollable = document.querySelector('.contenu-modale');
    if (contenuScrollable) contenuScrollable.scrollTop = 0;
  };
</script>

<Modale id="modale-explication-fin-compte-legacy" bind:this={elementModale}>
  <svelte:fragment slot="contenu">
    <dsfr-badge
      label="Message important"
      type="status"
      status="warning"
      size="md"
    />
    {#if indexEtapeCourante === 0}
      <h4>La connexion à MonServiceSécurisé évolue !</h4>
      <div class="contenu-modale">
        <p>
          <b>
            Pour renforcer la sécurité de votre compte, les modalités de
            connexion à MonServiceSécurisé évoluent.
          </b>
        </p>
        <p>
          👉 À partir de mars 2026, la connexion se fera
          <b>exclusivement via ProConnect</b>, le moyen d'authentification
          commun des services numériques de l'Etat pour les professionnels,
          intégrant
          <b>une authentification multifacteurs (MFA)</b>.
        </p>
        <p>Selon votre situation, deux cas sont possibles :</p>
        <ul>
          <li>
            <span>
              <b>
                Vous avez déjà un compte ProConnect avec une adresse e-mail
                différente
              </b><br />
              Vous devrez inviter cette adresse e-mail sur vos services pour lui
              donner accès et continuer à utiliser MonServiceSécurisé.
            </span>
          </li>

          <li>
            <span>
              <b> Vous n'avez pas encore de compte ProConnect</b><br />
              Vous devrez créer un compte ProConnect, avec la même adresse e-mail
              que celle utilisée sur MonServiceSécurisé.
            </span>
          </li>
        </ul>
        <p>➡️ L'étape suivante vous guidera en fonction de votre situation.</p>
      </div>
    {:else if indexEtapeCourante === 1}
      <h4>Accès à MonServiceSécurisé : action requise</h4>
      <div class="contenu-modale">
        <p>
          <b>
            Quelques étapes sont nécessaires pour continuer à utiliser
            MonServiceSécurisé.
          </b>
        </p>

        <ul>
          <li>
            <span>
              <b>
                Vous disposez déjà d'un compte ProConnect, mais l'adresse e-mail
                associée est différente de celle utilisée sur
                MonServiceSécurisé.
              </b><br />
              Pour continuer à utiliser MonServiceSécurisé, vous devez inviter cette
              adresse e-mail sur vos services afin de lui donner les accès nécessaires.
            </span>
          </li>
          <li>
            <span>
              <b>Vous n'avez pas encore de compte ProConnect ?</b><br />
              Vous devez en créer un en vous rendant sur :
              <a
                href="https://www.proconnect.gouv.fr"
                target="_blank"
                rel="noopener">https://www.proconnect.gouv.fr</a
              >
              <br />
              Puis suivez les étapes du parcours d'inscription.
            </span>
          </li>
        </ul>

        <p>
          Une fois votre compte ProConnect créé ou mis à jour, activez l'
          <b>authentification multifacteurs (MFA)</b> pour sécuriser votre accès.
        </p>

        <p>
          <b>Comment faire ?</b><br />
          Depuis votre profil ProConnect :<br />
          Profil > Compte et connexion > Double authentification
        </p>

        <p>
          Ou directement via ce lien :<br />
          <a
            href="https://identite.proconnect.gouv.fr/connection-and-account#two-factor-authentication"
            target="_blank"
            rel="noopener"
            >https://identite.proconnect.gouv.fr/connection-and-account#two-factor-authentication</a
          >
        </p>

        <p>
          Besoin d'aide pour choisir votre méthode de double authentification ?<br
          />
          <a
            href="https://proconnect.crisp.help/fr/article/quest-ce-que-la-double-authentification-1m5mpmj"
            target="_blank"
            rel="noopener"
            >https://proconnect.crisp.help/fr/article/quest-ce-que-la-double-authentification-1m5mpmj</a
          >
        </p>

        <p>
          <em>
            👉 Ces informations s'afficheront tant que vous n'aurez pas effectué
            le changement.
          </em>
        </p>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <div class="actions-modale">
      <div class="conteneur-pagination">
        {#each new Array(NB_ETAPES) as _, idx (idx)}
          <button
            class="pagination-etape"
            class:etape-courante={idx === indexEtapeCourante}
            on:click={() => afficheEtape(idx)}
          ></button>
        {/each}
      </div>
      <div class="conteneur-boutons-actions">
        {#if indexEtapeCourante === 0}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="Suivant"
            variante="primaire"
            taille="md"
            icone="arrow-right-line"
            positionIcone="droite"
            on:click={() => afficheEtape(indexEtapeCourante + 1)}
          />
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="Précédent"
            variante="secondaire"
            taille="md"
            icone="arrow-left-line"
            positionIcone="gauche"
            on:click={() => afficheEtape(indexEtapeCourante - 1)}
          />
        {/if}
      </div>
    </div>
  </svelte:fragment>
</Modale>

<style lang="scss">
  :global(#modale-explication-fin-compte-legacy) {
    max-width: 792px;
    max-height: 740px;

    :global(.contenu-modale) {
      margin-top: 0;
    }
  }

  .conteneur-boutons-actions {
    display: flex;
    gap: 16px;
  }

  .actions-modale {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .conteneur-pagination {
    display: flex;
    align-items: center;

    .pagination-etape {
      --taille: 8px;
      margin: 6px;
      padding: 0;
      width: var(--taille);
      height: var(--taille);
      max-width: var(--taille);
      max-height: var(--taille);
      border-radius: 50%;
      display: flex;
      background: var(--argent-brillant-indice-cyber);
      outline: none;
      border: none;
      cursor: pointer;

      &.etape-courante {
        --taille: 12px;
        margin: 4px;
        background: var(--bleu-mise-en-avant);
      }
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

    ul {
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
