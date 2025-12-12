<script lang="ts">
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite.js';
  import Infobulle from '../ui/Infobulle.svelte';
  import type { IdNiveauDeSecurite } from '../ui/types';
  import { type MiseAJour } from './creationV2.api';
  import { ordreDesNiveaux } from '../niveauxDeSecurite/niveauxDeSecurite.d';
  import { createEventDispatcher } from 'svelte';
  import ResumeNiveauSecurite from '../ui/ResumeNiveauSecurite.svelte';

  export let niveauSelectionne: IdNiveauDeSecurite | '';
  export let niveauDeSecuriteMinimal: IdNiveauDeSecurite;

  const dispatch = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estNiveauTropBas = (candidat: IdNiveauDeSecurite) =>
    ordreDesNiveaux[candidat] < ordreDesNiveaux[niveauDeSecuriteMinimal];

  $: estNiveauSuperieur = (candidat: IdNiveauDeSecurite) =>
    ordreDesNiveaux[candidat] > ordreDesNiveaux[niveauDeSecuriteMinimal];

  const selectionneNiveau = async (niveau: IdNiveauDeSecurite) => {
    niveauSelectionne = niveau;
    dispatch('champModifie', { niveauSecurite: niveauSelectionne });
  };
</script>

<div>
  <p class="explication-etape">
    Sur la base des informations renseignées, l'ANSSI a évalué à titre indicatif
    les besoins de sécurité de votre service et la démarche adaptée.
  </p>
  <p class="explication-cta">
    Sélectionnez les besoins identifiés ou des besoins plus élevés pour
    découvrir la liste des mesures pour sécuriser votre service. Si vous
    souhaitez en savoir plus retrouvez <lab-anssi-lien
      href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/LAB_Homologation_Simplifiee.pdf"
      cible="_blank"
      titre="l’homologation simplifiée"
    />
  </p>

  <slot name="infoMajNecessaire" />

  <div id="niveaux-securite">
    {#each donneesNiveauxDeSecurite as niveauSecurite, index}
      <details
        id={niveauSecurite.id}
        class="conteneur-niveau-securite"
        class:selectionne={niveauSelectionne === niveauSecurite.id}
      >
        <summary class="entete-niveau-securite">
          <h5>{niveauSecurite.nom}</h5>
          {#if niveauSecurite.id === niveauDeSecuriteMinimal}
            <dsfr-tag
              label="Besoins identifiés par l'ANSSI"
              size="md"
              hasIcon
              icon="star-s-fill"
            />
          {/if}
          <p>{niveauSecurite.resume}</p>
          <span class="bouton-selection">
            {#if estNiveauTropBas(niveauSecurite.id)}
              <Infobulle
                contenu="Il est impossible de sélectionner des besoins de sécurité moins élevés que ceux identifiés par l'ANSSI."
              />
            {/if}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <lab-anssi-bouton
              titre={niveauSelectionne === niveauSecurite.id
                ? 'Sélectionné'
                : 'Sélectionner'}
              variante={niveauSelectionne === niveauSecurite.id
                ? 'primaire'
                : 'secondaire'}
              taille="sm"
              actif={!estNiveauTropBas(niveauSecurite.id)}
              icone={niveauSelectionne === niveauSecurite.id
                ? 'check-line'
                : ''}
              positionIcone={niveauSelectionne === niveauSecurite.id
                ? 'gauche'
                : 'sans'}
              on:click={async () => await selectionneNiveau(niveauSecurite.id)}
            />
          </span>
        </summary>
        <hr />
        <ResumeNiveauSecurite
          niveau={niveauSecurite.id}
          afficheAvertissementAttaqueEtatique
          afficheToastNiveauSuperieurSelectionne={estNiveauSuperieur(
            niveauSecurite.id
          )}
        />
      </details>
    {/each}
  </div>
</div>

<style lang="scss">
  .conteneur-niveau-securite {
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #ddd;

    &.selectionne {
      border-color: var(--bleu-mise-en-avant);
    }
  }

  .entete-niveau-securite {
    display: grid;
    gap: 10px 8px;
    grid-template-columns: auto 1fr auto auto;
    grid-template-areas:
      'titre badge bouton switch'
      'resume resume bouton switch';
    cursor: pointer;

    &::marker {
      content: '';
    }

    &::-webkit-details-marker {
      display: none;
    }
  }

  .entete-niveau-securite::after {
    content: '';
    grid-area: switch;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    background: url('/statique/assets/images/icone_fleche_bas.svg') no-repeat
      center;
    background-size: contain;
    filter: brightness(0) saturate(100%) invert(31%) sepia(32%) saturate(4173%)
      hue-rotate(186deg) brightness(99%) contrast(101%) opacity(1);

    justify-self: end;
    align-self: center;
    transition: transform 0.2s ease-out;
  }

  .conteneur-niveau-securite[open] .entete-niveau-securite::after {
    transform: rotate(180deg);
  }

  dsfr-tag {
    grid-area: badge;
    align-self: baseline;
  }

  .bouton-selection {
    grid-area: bouton;
    justify-self: end;
    align-self: center;
    display: flex;
    gap: 8px;
  }

  h5 {
    grid-area: titre;
    padding: 0;
    align-self: baseline;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75rem;
    margin: 0 8px 0 0;
  }

  p {
    grid-area: resume;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
  }

  .explication-etape {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
  }

  .explication-etape,
  .explication-cta {
    max-width: 800px;
    margin-bottom: 24px;
  }

  hr {
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: 32px 0;
  }

  .conteneur-niveau-securite:not(:last-of-type) {
    margin-bottom: 16px;
  }
</style>
