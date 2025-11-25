<script lang="ts">
  import {
    type EvolutionMesures,
    lisEvolutionMesures,
  } from '../simulationv2.api';
  import { onMount } from 'svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import IndiceCyber from '../../indiceCyber/IndiceCyber.svelte';

  let evolutionMesures: EvolutionMesures;

  onMount(async () => {
    evolutionMesures = await lisEvolutionMesures($leBrouillon.id!);
  });
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

{#if evolutionMesures}
  <div class="conteneur-resume">
    <div class="resume-evolutions-mesures"></div>
    <div class="resume-evolution-indice-cyber">
      <h6>Évolution de l’indice cyber ANSSI</h6>
      <span>En attente de la complétion des mesures.</span>
      <div class="conteneur-indice-cyber">
        <div>
          <div class="contenu-indice-cyber">
            <IndiceCyber
              indiceCyber={evolutionMesures.indiceCyberV1.total}
              noteMax={evolutionMesures.indiceCyberV1.max}
            />
          </div>
          <span>Avec le référentiel actuel</span>
        </div>
      </div>
    </div>
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
</style>
