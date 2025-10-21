<script lang="ts">
  import Toast from './Toast.svelte';
  import type { IdNiveauDeSecurite } from './types';
  import type { NiveauDeSecurite } from '../niveauxDeSecurite/niveauxDeSecurite.d';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';

  export let niveau: IdNiveauDeSecurite;
  export let afficheToastNiveauSuperieurSelectionne: boolean = false;
  export let afficheAvertissementAttaqueEtatique: boolean = false;

  const donneesNiveau: NiveauDeSecurite = donneesNiveauxDeSecurite.find(
    (d) => d.id === niveau
  )!;
</script>

<div class="corps-niveau-securite">
  <hr />
  <div class="description-niveau-securite">
    <div class="conteneur-illustration">
      <img
        src="/statique/assets/images/niveauxSecurite/{niveau}.svg"
        alt="Illustration du niveau de sécurité"
      />
    </div>
    <div class="conteneur-texte">
      <div class="conteneur-mises-en-garde">
        {#if afficheToastNiveauSuperieurSelectionne}
          <Toast
            niveau="alerte"
            avecOmbre={false}
            titre="Ce niveau est supérieur à celui identifié à titre indicatif par l'ANSSI."
            contenu="Cela signifie que la liste des mesures de sécurité sera plus complète et la démarche d'homologation plus exigeante."
          />
        {/if}
        <dsfr-badge
          label="Démarche indicative adaptée : {donneesNiveau.description
            .demarcheIndicative}"
          type="accent"
          accent="blue-cumulus"
          size="md"
          hasIcon
          icon="info-fill"
          ellipsis={false}
        />
        {#if niveau !== 'niveau3' && afficheAvertissementAttaqueEtatique}
          <p class="info-attaque-etatique">
            Si vous considérez que le système d'information peut faire l'objet
            d'une cyberattaque ciblée par un acteur étatique, il est recommandé
            de sélectionner manuellement le besoin de niveau avancé
          </p>
        {/if}
      </div>

      <h6>Exemples de services numériques</h6>
      <ul class="liste-exemples-services">
        {#each donneesNiveau.description.exemplesServicesNumeriques as exemple}
          <li>{exemple}</li>
        {/each}
      </ul>
      <h6>Sécurisation et évaluation de la sécurité</h6>
      {#if donneesNiveau.description.securisation.length === 1}
        <p>{@html donneesNiveau.description.securisation[0]}</p>
      {:else}
        <ul>
          {#each donneesNiveau.description.securisation as securisation}
            <li>{@html securisation}</li>
          {/each}
        </ul>
      {/if}
      <h6>Homologation</h6>
      <ul>
        {#each donneesNiveau.description.homologation as homologation}
          <li>{@html homologation}</li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  hr {
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
  }

  p {
    grid-area: resume;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
  }

  .corps-niveau-securite hr {
    margin: 32px 0;
  }

  .description-niveau-securite {
    display: flex;
    flex-direction: row;
    gap: 32px;
    align-items: start;
    justify-content: space-between;

    h6 {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5rem;
      margin: 0 0 8px;
      padding: 0;
    }

    h6:not(:first-of-type) {
      margin-top: 24px;
    }

    img {
      padding: 75px 24px;
    }

    p,
    li {
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5rem;
    }

    p.info-attaque-etatique {
      color: #b34000;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.25rem;
      display: flex;
      gap: 6px;

      &::before {
        content: '';
        width: 29px;
        height: 18px;
        background: url('/statique/assets/images/icone_erreur_dsfr.svg')
          no-repeat center;
        display: inline-block;
      }
    }

    ul {
      padding-inline-start: 24px;
    }
  }

  .conteneur-mises-en-garde {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }
</style>
