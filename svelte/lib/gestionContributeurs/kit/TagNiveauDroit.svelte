<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import MenuFlottant from '../../ui/MenuFlottant.svelte';
  import type { ResumeNiveauDroit } from '../../ui/types';

  const STATUS_DROITS: Record<ResumeNiveauDroit, string> = {
    PROPRIETAIRE: 'Propriétaire',
    ECRITURE: 'Édition',
    LECTURE: 'Lecture',
    PERSONNALISE: 'Personnalisé',
  };

  export let niveau: ResumeNiveauDroit;
  export let droitsModifiables: boolean;

  const dispatch = createEventDispatcher<{
    droitsChange: ResumeNiveauDroit;
    choixPersonnalisation: null;
  }>();
</script>

{#if !droitsModifiables}
  <div class="role {niveau}">
    {STATUS_DROITS[niveau]}
  </div>
{:else}
  <MenuFlottant fermeMenuSiClicInterne={true}>
    <span slot="declencheur" class="role role-modifiable {niveau}">
      {STATUS_DROITS[niveau]}
    </span>

    <div class="roles-disponibles">
      <button
        class="role-propose lecture"
        on:click={() => dispatch('droitsChange', 'LECTURE')}
      >
        <span class="nom">Lecture</span>
        <br />
        <span class="description">Consulter uniquement les informations</span>
      </button>
      <button
        class="role-propose ecriture"
        on:click={() => dispatch('droitsChange', 'ECRITURE')}
      >
        <span class="nom">Édition</span>
        <br />
        <span class="description">Modifier et ajouter des informations</span>
      </button>
      <button
        class="role-propose personnalise"
        on:click={() => dispatch('choixPersonnalisation')}
      >
        <span class="nom">Personnalisé</span>
        <br />
        <span class="description">
          Avoir un droit d'accès adapté par rubrique
        </span>
      </button>
      <button
        class="role-propose proprietaire"
        on:click={() => dispatch('droitsChange', 'PROPRIETAIRE')}
      >
        <span class="nom">Propriétaire</span>
        <br />
        <span class="description">Gérer le service et les contributeurs</span>
      </button>
    </div>
  </MenuFlottant>
{/if}

<style>
  button {
    border: none;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }

  .role {
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.85rem;
    line-height: 0.85rem;
    padding: 0.4em 0.5em;
    align-self: center;
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
    filter: brightness(0);
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
  }
  .role-propose .nom {
    font-style: normal;
    font-weight: 500;
    line-height: 1.2rem;
  }

  .role-propose .description {
    color: #2f3a43;
    font-weight: 400;
  }

  .role-propose.personnalise {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .role-propose.proprietaire {
    border-top: 1px solid #cbd5e1;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
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
    background: var(--role-proprietaire);
    color: var(--role-proprietaire-texte);
  }

  .ECRITURE {
    background: var(--role-editeur);
    color: var(--role-editeur-texte);
  }

  .role-modifiable.ECRITURE::after {
    filter: brightness(0) invert(37%) sepia(97%) saturate(2274%)
      hue-rotate(184deg) brightness(85%) contrast(102%);
  }

  .LECTURE {
    background: var(--role-lecteur);
    color: var(--role-lecteur-texte);
  }

  .role-modifiable.LECTURE::after {
    filter: brightness(0) invert(20%) sepia(89%) saturate(3120%)
      hue-rotate(259deg) brightness(83%) contrast(106%);
  }

  .PERSONNALISE {
    background: var(--role-personnalise);
    color: var(--role-personnalise-texte);
  }

  .role-modifiable.PERSONNALISE::after {
    filter: brightness(0) invert(30%) sepia(68%) saturate(1806%)
      hue-rotate(112deg) brightness(92%) contrast(91%);
  }
</style>
