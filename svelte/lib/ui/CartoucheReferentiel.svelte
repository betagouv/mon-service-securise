<script lang="ts">
  import { Referentiel } from './types.d';

  export let referentiel: Referentiel;
  export let indispensable = false;

  const label =
    referentiel === Referentiel.SPECIFIQUE
      ? 'Spécifique'
      : referentiel === Referentiel.ANSSI && indispensable
      ? 'Indispensable'
      : 'Recommandé';
</script>

<span
  class="referentiel"
  class:indispensable
  class:anssi={referentiel === Referentiel.ANSSI}
  class:specifique={referentiel === Referentiel.SPECIFIQUE}
>
  {label}
</span>

<style>
  .referentiel {
    border-radius: 40px;
    padding: 4px 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
  }

  .referentiel.specifique {
    color: #08416a;
    background: #f1f5f9;
  }

  .referentiel.anssi:not(.indispensable) {
    color: #0079d0;
    background: #dbeeff;
  }

  .referentiel.anssi.indispensable {
    color: #7025da;
    background: #e9ddff;
  }

  .referentiel.anssi:before {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/logo_mss_petit.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 19px;
    height: 16px;
    margin-right: 6px;
  }
</style>
