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
  }

  .initiales.persona::before {
    content: '';
    width: 1.5rem;
    height: 1.5rem;
    background: url('/statique/assets/images/persona_invitation_contributeur.svg')
      no-repeat;
    background-size: contain;
    filter: brightness(0);
  }

  .PROPRIETAIRE {
    background: var(--role-proprietaire);
  }

  .initiales.PROPRIETAIRE {
    color: var(--role-proprietaire-texte);
  }

  .initiales.PROPRIETAIRE.persona::before {
    filter: brightness(0) invert(75%) sepia(72%) saturate(1307%)
      hue-rotate(334deg) brightness(98%) contrast(101%);
  }

  .ECRITURE {
    background: var(--role-editeur);
  }

  .initiales.ECRITURE {
    color: var(--role-editeur-texte);
  }

  .initiales.ECRITURE.persona::before {
    filter: brightness(0) invert(37%) sepia(97%) saturate(2274%)
      hue-rotate(184deg) brightness(85%) contrast(102%);
  }

  .LECTURE {
    background: var(--role-lecteur);
  }

  .initiales.LECTURE {
    color: var(--role-lecteur-texte);
  }

  .initiales.LECTURE.persona::before {
    filter: brightness(0) invert(20%) sepia(89%) saturate(3120%)
      hue-rotate(259deg) brightness(83%) contrast(106%);
  }

  .PERSONNALISE {
    background: var(--role-personnalise);
  }

  .initiales.PERSONNALISE {
    color: var(--role-personnalise-texte);
  }

  .initiales.PERSONNALISE.persona::before {
    filter: brightness(0) invert(30%) sepia(68%) saturate(1806%)
      hue-rotate(112deg) brightness(92%) contrast(91%);
  }
</style>
