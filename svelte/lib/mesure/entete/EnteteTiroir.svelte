<script lang="ts">
  import { configurationAffichage } from '../mesure.store';

  const contenuTexte =
    $configurationAffichage.contenuTexteCartoucheDuReferentiel;
</script>

<p
  class="referentiel"
  class:indispensable={contenuTexte === 'Indispensable'}
  class:recommandee={contenuTexte === 'Recommandée'}
>
  {contenuTexte}
</p>

<style>
  p {
    padding: 4px 10px;
    font-size: 0.6em;
    font-weight: 500;
    color: #08416a;
    border-radius: 40px;
    background: #ffffff;
    width: fit-content;
    margin-top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  p:is(.indispensable, .recommandee):before {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/logo_mss_petit.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 19px;
    height: 16px;
    margin-right: 6px;
  }

  .indispensable {
    color: #7025da;
  }

  .recommandee {
    color: #0079d0;
  }
</style>
