<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import MenuFlottant from '../ui/MenuFlottant.svelte';
  import type { Ecriture, Lecture } from './gestionContributeurs.d';

  const LIBELLE_DROITS = { [1]: 'Lecture', [2]: 'Édition' };
  const droitsDisponibles: {
    nom: string;
    description: string;
    droit: Lecture | Ecriture;
  }[] = [
    {
      nom: LIBELLE_DROITS[1],
      description: 'Consulter uniquement les informations',
      droit: 1,
    },
    {
      nom: LIBELLE_DROITS[2],
      description: 'Modifier et ajouter des informations',
      droit: 2,
    },
  ];

  export let droit: Lecture | Ecriture;
  const dispatch = createEventDispatcher<{
    droitChange: Lecture | Ecriture;
  }>();
</script>

<MenuFlottant>
  <div
    slot="declencheur"
    class="droit"
    class:lecture={droit === 1}
    class:ecriture={droit === 2}
  >
    {LIBELLE_DROITS[droit]}
  </div>

  <div class="droits-disponibles">
    {#each droitsDisponibles as { nom, description, droit }}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="droit-propose"
        on:click={() => dispatch('droitChange', droit)}
        class:lecture={droit === 1}
        class:ecriture={droit === 2}
      >
        <div class="nom">{nom}</div>
        <div class="description">{description}</div>
      </div>
    {/each}
  </div>
</MenuFlottant>

<style>
  .droit {
    border-radius: 4px;
    font-weight: bold;
    color: #ffffff;
    font-size: 0.85rem;
    line-height: 0.85rem;
    padding: 0.4em 0.5em;
    align-self: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 6px;
  }

  .droit::after {
    content: '';
    width: 12px;
    height: 12px;
    background: url('/statique/assets/images/icone_fleche_bas.svg') no-repeat
      center;
    background-size: contain;
    filter: brightness(0) invert(1);
  }

  .droit.lecture {
    background: linear-gradient(180deg, #a226b8 0%, #8926c9 100%);
  }

  .droit.ecriture {
    background: linear-gradient(180deg, #326fc0 0%, #4d3dc5 100%);
  }

  .droits-disponibles {
    width: 11rem;
    border-radius: 5px;
    border: 1px solid #0c5c98;
    background: white;
    padding: 5px;
    position: relative;
  }

  .droit-propose {
    padding: 8px;
    border-radius: 5px;
  }

  .droit-propose .nom {
    font-style: normal;
    font-weight: 500;
    line-height: 1.2rem;
  }

  .droit-propose.lecture .nom {
    color: #7025da;
  }
  .droit-propose.ecriture .nom {
    color: #0079d0;
  }
  .droit-propose .description {
    color: #2f3a43;
    font-weight: 400;
  }
  .droit-propose:hover .nom {
    font-weight: 700;
  }
  .droit-propose:hover .description {
    font-weight: 500;
  }
  .droit-propose.lecture:hover {
    background: #e9ddff;
  }
  .droit-propose.ecriture:hover {
    background: #dbeeff;
  }
</style>
