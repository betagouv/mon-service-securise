<script lang="ts">
  import type { ResumeNiveauDroit } from './gestionContributeurs.d';
  import { createEventDispatcher } from 'svelte';
  import MenuFlottant from '../ui/MenuFlottant.svelte';

  const STATUS_DROITS: Record<ResumeNiveauDroit, string> = {
    PROPRIETAIRE: 'Propriétaire',
    ECRITURE: 'Édition',
    LECTURE: 'Lecture',
    PERSONNALISE: 'Personnalisé',
  };

  export let niveau: ResumeNiveauDroit;
  export let droitsModifiables: boolean;

  const dispatch = createEventDispatcher<{ droitsChange: ResumeNiveauDroit }>();
</script>

{#if !droitsModifiables}
  <div class="role {niveau}">
    {STATUS_DROITS[niveau]}
  </div>
{:else}
  <MenuFlottant>
    <div slot="declencheur" class="role role-modifiable {niveau}">
      {STATUS_DROITS[niveau]}
    </div>

    <div class="roles-disponibles">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="role-propose"
        on:click={() => dispatch('droitsChange', 'LECTURE')}
      >
        <div class="nom">Lecture</div>
        <div class="description">Consulter uniquement les informations</div>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="role-propose"
        on:click={() => dispatch('droitsChange', 'ECRITURE')}
      >
        <div class="nom">Édition</div>
        <div class="description">Modifier et ajouter des informations</div>
      </div>
    </div>
  </MenuFlottant>
{/if}

<style>
  .role {
    border-radius: 4px;
    font-weight: bold;
    color: #ffffff;
    font-size: 0.85rem;
    line-height: 0.85rem;
    padding: 0.4em 0.5em;
    align-self: center;
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
  }

  .role-modifiable {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 6px;
  }

  .role-modifiable::after {
    content: '';
    width: 12px;
    height: 12px;
    background: url('/statique/assets/images/icone_fleche_bas.svg') no-repeat
      center;
    background-size: contain;
    filter: brightness(0) invert(1);
  }

  .roles-disponibles {
    width: 11rem;
    border-radius: 5px;
    border: 1px solid #0c5c98;
    background: white;
    padding: 5px;
    position: relative;
  }

  .role-propose {
    padding: 8px;
    border-radius: 5px;
  }

  .role-propose .nom {
    color: #0079d0;
    font-style: normal;
    font-weight: 500;
    line-height: 1.2rem;
  }

  .role-propose .description {
    color: #2f3a43;
    font-weight: 400;
  }

  .role-propose:hover {
    background: #eff6ff;
  }

  .role-propose:hover .nom {
    font-weight: 700;
  }
  .role-propose:hover .description {
    font-weight: 500;
  }

  .PROPRIETAIRE {
    background: #c19616;
  }

  .ECRITURE {
    background: linear-gradient(180deg, #326fc0 0%, #4d3dc5 100%);
  }

  .LECTURE {
    background: linear-gradient(180deg, #a226b8 0%, #8926c9 100%);
  }

  .PERSONNALISE {
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
  }
</style>
