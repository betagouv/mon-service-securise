<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  import { onMount } from 'svelte';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import type { IdNiveauDeSecurite } from '../ui/types';
  let elementModale: Modale;

  onMount(() => {
    elementModale?.affiche();
  });

  const termineExplications = async () => {
    await axios.post('/api/explicationNouveauReferentiel/termine');
    elementModale?.ferme();
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
</script>

<Modale bind:this={elementModale} id="modale-explication-nouveau-referentiel">
  <svelte:fragment slot="contenu">
    <dsfr-badge
      label="Nouveau"
      type="accent"
      accent="yellow-tournesol"
      size="md"
      hasIcon
      icon="flashlight-fill"
    />
    <h4>Mise en place d’un nouveau référentiel de mesures</h4>
    <div class="contenu-modale">
      <p>
        <b
          >Le formulaire d’ajout de service a été mis à jour avec de nouvelles
          questions. Les mesures associées à chaque besoin de sécurité ont
          également été évoluées : certaines ont été ajoutées, d'autres
          modifiées ou supprimées.</b
        >
      </p>
      <div>
        <p><b>Les principaux axes de cette mise à jour :</b></p>
        <ul>
          <li>• Des mesures séparées pour une analyse plus fine</li>
          <li>
            • Des ajouts de mesures "simples" basées sur les bonnes pratiques
          </li>
          <li>• Un alignement avec la directive NIS2</li>
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
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <lab-anssi-bouton
      titre="J’ai compris 👍"
      variante="primaire"
      taille="md"
      icone=""
      positionIcone="sans"
      on:click={termineExplications}
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
      margin-bottom: 24px;

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
          max-width: 146px;
        }
      }
    }
  }
</style>
