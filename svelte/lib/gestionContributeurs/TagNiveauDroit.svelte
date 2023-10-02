<script lang="ts">
  import type { ResumeNiveauDroit } from './gestionContributeurs.d';

  const STATUS_DROITS: Record<ResumeNiveauDroit, string> = {
    PROPRIETAIRE: 'Propriétaire',
    ECRITURE: 'Édition',
    LECTURE: 'Lecture',
    PERSONNALISE: 'Personnalisé',
  };

  export let niveau: ResumeNiveauDroit;
</script>

<div class="role {niveau}">
  {STATUS_DROITS[niveau]}
</div>

<style>
  .role {
    border-radius: 4px;
    font-weight: bold;
    color: #ffffff;
    font-size: 0.9em;
    line-height: 0.9em;
    padding: 0.4em 0.5em;
    align-self: center;
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
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
