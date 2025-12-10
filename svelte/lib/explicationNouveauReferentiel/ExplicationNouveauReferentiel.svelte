<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  import { onMount } from 'svelte';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import type { IdNiveauDeSecurite } from '../ui/types';
  import { donneesEvolutionQuestions } from './donneesEvolutionQuestions';

  let indexEtapeCourante = 0;
  let elementModale: Modale;
  let elementModaleConfirmationFermeture: Modale;
  let aTermine = false;
  export let afficheAuMontage = true;
  export let avecModaleConfirmation = true;

  onMount(() => {
    if (afficheAuMontage) elementModale?.affiche();
  });

  const termineExplications = async () => {
    await axios.post('/api/explicationNouveauReferentiel/termine');
    aTermine = true;
    elementModale?.ferme();
  };

  export const affiche = () => {
    indexEtapeCourante = 0;
    elementModale?.affiche();
  };

  const comparaisonNombresMesures: Record<
    IdNiveauDeSecurite,
    {
      ancienReferentiel: number;
      nouveauReferentiel: string;
      difference: string;
    }
  > = {
    niveau1: {
      ancienReferentiel: 55,
      nouveauReferentiel: 'entre 50 et 58',
      difference: 'de -5 à +3 mesures',
    },
    niveau2: {
      ancienReferentiel: 60,
      nouveauReferentiel: 'entre 76 et 87',
      difference: 'de +16 à +44 mesures',
    },
    niveau3: {
      ancienReferentiel: 62,
      nouveauReferentiel: 'entre 107 et 124',
      difference: 'de +45 à +62 mesures',
    },
  };

  const gereFermetureModale = () => {
    if (!aTermine && avecModaleConfirmation)
      elementModaleConfirmationFermeture.affiche();
  };

  const afficheEtape = (index: number) => {
    indexEtapeCourante = index;
    const contenuScrollable = document.querySelector('.contenu-modale');
    if (contenuScrollable) contenuScrollable.scrollTop = 0;
  };
</script>

<Modale
  id="modale-explication-nouveau-referentiel"
  bind:this={elementModale}
  on:close={gereFermetureModale}
>
  <svelte:fragment slot="contenu">
    <dsfr-badge
      label="Nouveau"
      type="accent"
      accent="yellow-tournesol"
      size="md"
      hasIcon
      icon="flashlight-fill"
    />
    {#if indexEtapeCourante === 0}
      <h4>Mise en place d’un nouveau référentiel de mesures</h4>
      <div class="contenu-modale">
        <p>
          <b
            >Le formulaire d’ajout de service a été mis à jour avec de nouvelles
            questions. Les mesures associées à chaque besoin de sécurité ont
            également évolué : certaines ont été ajoutées, d'autres modifiées ou
            supprimées.</b
          >
        </p>
        <div>
          <p><b>Les principaux axes de cette mise à jour :</b></p>
          <ul>
            <li>• Des mesures séparées pour une analyse plus fine</li>
            <li>
              • Des ajouts de mesures "simples" basées sur les bonnes pratiques
            </li>
            <li>
              • Une meilleure adaptation au périmètre d’homologation, selon les
              contextes
            </li>
            <li>
              • Un renforcement du principe de proportionnalité, pour cibler les
              mesures là où les risques sont les plus élevés.
            </li>
          </ul>
        </div>
        <div>
          <h5>Évolution du nombre de mesures</h5>
          <p class="petit">
            Le nombre affiché pour chaque besoin de sécurité est le maximum
            possible (par exemple si votre service présente un grand nombre de
            caractéristiques)
          </p>
        </div>
        <div class="conteneur-niveaux-securite">
          {#each Object.values(donneesNiveauxDeSecurite) as niveau (niveau.id)}
            {@const id = niveau.id}
            {@const donnees = comparaisonNombresMesures[id]}
            <div class="carte-niveau-securite">
              <h6>{niveau.nom}</h6>
              <div>
                <p>Ancien référentiel: {donnees.ancienReferentiel}</p>
                <p>Nouveau référentiel: {donnees.nouveauReferentiel}</p>
                <p class="mis-en-avant">{donnees.difference}</p>
              </div>
              <img
                src="/statique/assets/images/niveauxSecurite/{id}.svg"
                alt="Illustration du niveau de sécurité {niveau.nom}"
              />
            </div>
          {/each}
        </div>
      </div>
    {:else if indexEtapeCourante === 1}
      <h4>🎯 Choisissez le référentiel à utiliser</h4>
      <div class="contenu-modale">
        <p>
          <b
            >Suite à l’évolution du formulaire d'ajout de service et des mesures
            de sécurité proposées, vous avez désormais la possibilité de :</b
          >
        </p>
        <div>
          <p>
            <b
              >🆕 Tester le nouveau référentiel pour identifier les changements
              qu’il implique</b
            ><br />

            Vous pouvez simuler le passage au nouveau référentiel :
          </p>
          <ul>
            <li>
              • depuis votre tableau de bord, via le bouton “Simuler le
              référentiel 2025”,
            </li>
            <li>
              • ou directement depuis votre service, en utilisant le bandeau
              “Passer au nouveau référentiel”.
            </li>
          </ul>
        </div>
        <p>
          👉 Cette simulation vous permet de visualiser les changements et les
          impacts avant de faire le choix d’utiliser le nouveau référentiel.<br
          />
          Les données déjà renseignées seront automatiquement reprises (questions
          inchangées dans l’ajout d’un service, mesures de sécurité, statuts, commentaires,
          plans d'action, etc.).
        </p>

        <p>
          <b>🕒 Continuer avec l’ancien référentiel</b><br />Vous pouvez
          également choisir de conserver l’ancien référentiel.<br />Le passage
          au nouveau référentiel reste possible à tout moment, via le même
          bouton, depuis votre tableau de bord ou l’un de vos services.
        </p>

        <img
          src="/statique/assets/images/explicationNouveauReferentiel/tableauDeBord.png"
          alt="Illustration de l'action recommandée dans le tableau de bord"
        />
        <img
          src="/statique/assets/images/explicationNouveauReferentiel/simulation.png"
          alt="Illustration de la simulation de passage au nouveau référentiel au sein d'un service"
        />
        <div class="citation">
          <p>Ce choix s’applique uniquement à ce service.</p>
          <p>Vous pourrez effectuer un autre choix pour vos autres services.</p>
        </div>
      </div>
    {:else if indexEtapeCourante === 2}
      <h4>📝 De nouvelles questions pour mieux qualifier vos services</h4>
      <div class="contenu-modale">
        <p>
          <b
            >De nouvelles questions permettent une meilleure qualification de
            vos services et une adaptation plus fine des besoins de sécurité. En
            fonction des réponses, cela peut impacter votre niveau de besoin de
            sécurité actuel.</b
          >
        </p>
        <h5>Évolution des questions</h5>
        <table>
          <colgroup>
            <col class="questions" />
            <col class="statut" />
          </colgroup>
          <thead>
            <tr>
              <th>Nouvelles questions</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {#each donneesEvolutionQuestions as { label, statut }, index (index)}
              <tr>
                <td>{label}</td>
                <td>{statut}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <div class="actions-modale">
      <div class="conteneur-pagination">
        {#each new Array(3) as _, idx (idx)}
          <button
            class="pagination-etape"
            class:etape-courante={idx === indexEtapeCourante}
            on:click={() => afficheEtape(idx)}
          ></button>
        {/each}
      </div>
      <div class="conteneur-boutons-actions">
        {#if indexEtapeCourante > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="Précédent"
            variante="secondaire"
            taille="md"
            icone=""
            positionIcone="sans"
            on:click={() => afficheEtape(indexEtapeCourante - 1)}
          />
        {/if}
        {#if indexEtapeCourante === 2}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="J’ai compris 👍"
            variante="primaire"
            taille="md"
            icone=""
            positionIcone="sans"
            on:click={termineExplications}
          />
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="Suivant"
            variante="primaire"
            taille="md"
            icone=""
            positionIcone="sans"
            on:click={() => afficheEtape(indexEtapeCourante + 1)}
          />
        {/if}
      </div>
    </div>
  </svelte:fragment>
</Modale>
<Modale
  id="modale-confirmation-fermeture"
  bind:this={elementModaleConfirmationFermeture}
>
  <svelte:fragment slot="contenu">
    <div class="contenu-modale">
      <h4>⚠️ Rappel important</h4>
      <p>
        Vous avez choisi de fermer la fenêtre sans cliquer sur <b
          >«J’ai compris»</b
        >
        à <b>la dernière étape.</b>
        <br />
        Cette information est essentielle : elle vous sera donc reproposée lors de
        votre prochaine visite tant que vous ne l’aurez pas validée.
      </p>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Me le reproposer plus tard"
      variante="secondaire"
      taille="md"
      icone=""
      positionIcone="sans"
      on:click={() => elementModaleConfirmationFermeture.ferme()}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Valider maintenant"
      variante="primaire"
      taille="md"
      icone=""
      positionIcone="sans"
      on:click={() => {
        elementModaleConfirmationFermeture.ferme();
        elementModale.affiche();
      }}
    />
  </svelte:fragment>
</Modale>

<style lang="scss">
  :global(#modale-explication-nouveau-referentiel) {
    max-width: 792px;
    max-height: 740px;

    :global(.contenu-modale) {
      margin-top: 0;
    }
  }

  :global(#modale-confirmation-fermeture) {
    max-width: calc(556px + 64px);
    max-height: calc(336px + 32px);

    :global(.contenu-modale) {
      margin-top: 0;
    }

    :global(.conteneur-actions) {
      border: none;
    }

    h4 {
      margin: 0;
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

    .citation {
      padding-left: 36px;
      margin-left: 32px;
      border-left: 4px solid #6a6af4;
    }

    img {
      max-width: 700px;
      align-self: center;
    }

    p {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #3a3a3a;
      margin: 0;

      &.petit {
        font-size: 0.875rem;
        line-height: 1.5rem;
      }
    }

    ul {
      padding: 0;
      margin: 0;
      font-size: 1rem;
      line-height: 1.5rem;
      list-style-type: none;
      color: #3a3a3a;
    }

    h5 {
      line-height: 1.75rem;
      font-size: 1.125rem;
      margin: 0 0 4px;
    }

    .conteneur-niveaux-securite {
      display: flex;
      flex-direction: row;
      gap: 20px;

      .carte-niveau-securite {
        display: flex;
        flex-direction: column;
        padding: 27px 40px;
        border: 1px dashed #cbd5e1;
        border-radius: 4px;
        gap: 12px;
        align-items: center;

        h6 {
          font-size: 1.3rem;
          line-height: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        p {
          margin: 0;
          line-height: 1rem;
          font-size: 0.7rem;
          text-align: center;

          &.mis-en-avant {
            color: var(--bleu-mise-en-avant);
            font-weight: bold;
          }
        }

        img {
          max-width: 100%;
        }
      }
    }

    table {
      border-collapse: collapse;
      border: 1px solid var(--systeme-design-etat-contour-champs);

      .statut {
        width: 218px;
      }

      td,
      th {
        padding: 8px 16px;
        font-size: 0.875rem;
        line-height: 1.5rem;
        color: #3a3a3a;
      }
      tr {
        border: 1px solid var(--systeme-design-etat-contour-champs);
      }
    }
  }
</style>
