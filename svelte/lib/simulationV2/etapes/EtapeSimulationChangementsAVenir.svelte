<script lang="ts">
  import {
    type ResumeEvolutions,
    lisEvolutionMesures,
    type StatutEvolutionMesure,
  } from '../simulationv2.api';
  import { onMount } from 'svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import IndiceCyber from '../../indiceCyber/IndiceCyber.svelte';
  import donneesNiveauxDeSecurite from '../../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import Tableau from '../../ui/Tableau.svelte';
  import Onglets from '../../ui/Onglets.svelte';

  let resumeEvolutions: ResumeEvolutions;
  let ongletActif: StatutEvolutionMesure = 'ajoutee';

  onMount(async () => {
    resumeEvolutions = await lisEvolutionMesures($leBrouillon.id!);
  });

  $: donneesAAfficher =
    resumeEvolutions?.evolutionMesures.detailsMesures.filter(
      (m) => m.statut === ongletActif
    ) || [];

  const configurationStatut: Record<
    StatutEvolutionMesure,
    { label: string; icone: string }
  > = {
    ajoutee: { label: 'Ajoutée', icone: 'icone_tableau_ajout' },
    inchangee: { label: 'Inchangée', icone: 'icone_tableau_succes' },
    modifiee: { label: 'Modifiée', icone: 'icone_tableau_modifie' },
    supprimee: { label: 'Supprimée', icone: 'icone_tableau_supprime' },
  };
</script>

<hr />
<div class="conteneur-titre">
  <h5>Aperçu des changements à venir</h5>
  <p>
    Voici les changements qui seront appliqués si vous passez au nouveau
    référentiel.<br />
    L’indice cyber affiché est provisoire : il sera recalculé une fois les nouvelles
    mesures renseignées. Pensez à les compléter pour améliorer votre score.
  </p>
</div>

{#if resumeEvolutions}
  <div class="conteneur-resume">
    <div class="resume-evolutions-mesures">
      <h6>
        Besoins de sécurité {donneesNiveauxDeSecurite.find(
          (d) => d.id === $leBrouillon.niveauSecurite
        )?.nom}
      </h6>
      <div class="conteneur-resume-evolution">
        <span
          >{resumeEvolutions.evolutionMesures.nbMesures} mesures au total</span
        >
        <span
          >🆕 {resumeEvolutions.evolutionMesures.nbMesuresAjoutees} mesures ajoutées</span
        >
        <span
          >✅ {resumeEvolutions.evolutionMesures.nbMesuresInchangees} mesures inchangées</span
        >
        <span
          >✏️ {resumeEvolutions.evolutionMesures.nbMesuresModifiees} mesures modifiées</span
        >
        <span
          >❌ {resumeEvolutions.evolutionMesures.nbMesuresSupprimees} mesures supprimées</span
        >
      </div>
    </div>
    <div class="separateur-vertical" />
    <div class="resume-evolution-indice-cyber">
      <h6>Évolution de l’indice cyber ANSSI</h6>
      <span>En attente de la complétion des mesures.</span>
      <div class="conteneur-indice-cyber">
        <div>
          <div class="contenu-indice-cyber">
            <IndiceCyber
              indiceCyber={resumeEvolutions.evolutionIndiceCyber.v1}
              noteMax={resumeEvolutions.evolutionIndiceCyber.max}
            />
          </div>
          <span>Avec le référentiel actuel</span>
        </div>
        <img
          src="/statique/assets/images/home/icone_fleche_gauche.svg"
          alt=""
        />
        <div>
          <div class="contenu-indice-cyber">
            <IndiceCyber
              indiceCyber={resumeEvolutions.evolutionIndiceCyber.v2}
              noteMax={resumeEvolutions.evolutionIndiceCyber.max}
            />
          </div>
          <span>Avec le nouveau référentiel</span>
        </div>
      </div>
    </div>
  </div>
  <div class="tableau-evolutions-mesures">
    <h6>Évolution du référentiel de mesures</h6>
    <Tableau
      colonnes={[
        { cle: 'ancienneDescription', libelle: 'Mesure actuelle' },
        { cle: 'nouvelleDescription', libelle: 'Nouvelle version proprosée' },
        { cle: 'statut', libelle: 'Type de changement' },
      ]}
      donnees={donneesAAfficher}
    >
      <div slot="onglets">
        <Onglets
          bind:ongletActif
          onglets={[
            {
              id: 'ajoutee',
              label: 'Ajoutées',
            },
            {
              id: 'inchangee',
              label: 'Inchangées',
            },
            {
              id: 'modifiee',
              label: 'Modifiées',
            },
            {
              id: 'supprimee',
              label: 'Supprimées',
            },
          ]}
        />
      </div>
      <svelte:fragment slot="cellule" let:donnee let:colonne>
        {#if colonne.cle === 'ancienneDescription'}
          <span>{donnee.ancienneDescription ?? '-'}</span>
        {:else if colonne.cle === 'nouvelleDescription'}
          <span>{donnee.nouvelleDescription ?? '-'}</span>
        {:else if colonne.cle === 'statut'}
          {@const { label, icone } = configurationStatut[donnee.statut]}
          <div class="conteneur-statut">
            <img
              src="/statique/assets/images/{icone}.svg"
              alt="Icône du statut {label}"
            />
            <span>{label}</span>
          </div>
        {/if}
      </svelte:fragment>
    </Tableau>
  </div>
{/if}

<style lang="scss">
  hr {
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: -24px 0 40px;
    width: 690px;
  }

  .conteneur-resume-evolution {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  .conteneur-titre {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 8px;

    h5 {
      font-size: 1.375rem;
      line-height: 1.75rem;
      margin: 0;
    }

    p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5rem;
    }
  }

  .conteneur-resume {
    border: 1px solid #dddddd;
    border-radius: 8px;
    padding: 48px;
    display: flex;
    gap: 64px;

    .separateur-vertical {
      height: 100%;
      border-left: 1px solid #dddddd;
    }

    h6 {
      font-size: 1.125rem;
      line-height: 1.75rem;
      margin: 0 0 4px;
    }

    span {
      font-size: 0.875rem;
      line-height: 1.5rem;
    }

    .conteneur-indice-cyber {
      margin-top: 32px;
      max-width: 400px;
      display: flex;
      gap: 32px;

      img {
        transform: rotate(180deg);
      }

      & > div {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;

        .contenu-indice-cyber {
          width: 100px;
        }

        span {
          font-size: 0.75rem;
          line-height: 1.25rem;
        }
      }
    }
  }

  :global(
      .tableau-evolutions-mesures td:nth-child(1),
      .tableau-evolutions-mesures td:nth-child(2)
    ) {
    width: 40%;
  }

  .tableau-evolutions-mesures {
    margin-top: 8px;

    h6 {
      font-size: 1.125rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0 0 32px;
    }

    .conteneur-statut {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
</style>
