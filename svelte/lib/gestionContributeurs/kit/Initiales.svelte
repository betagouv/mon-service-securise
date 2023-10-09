<script lang="ts">
  import type { ResumeNiveauDroit } from '../gestionContributeurs.d';

  export let valeur: string;
  export let resumeNiveauDroit: ResumeNiveauDroit | undefined;
</script>

<div
  class="initiales contributeur {resumeNiveauDroit || ''}"
  class:persona={!valeur}
>
  {valeur}
</div>

<style>
  .initiales {
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
    min-width: 36px;
    min-height: 36px;
    font-size: 0.9rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #ffffff;
  }

  .initiales.persona::before {
    content: '';
    width: 1.5rem;
    height: 1.5rem;
    background: url('/statique/assets/images/persona_invitation_contributeur.svg')
      no-repeat;
    background-size: contain;
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
