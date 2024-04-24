<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';

  const cibleNomService = document.getElementById('nom-service')!;
</script>

<ModaleSousEtape
  cible={cibleNomService}
  callbackInitialeCible={(cible) => (cible.style.width = '50%')}
  titre="Décrivez votre service"
  description="Dans un premier temps, répondez à quelques questions afin d’obtenir une liste de mesures de sécurité personnalisée"
  animation="/statique/assets/images/visiteGuidee/decrire.gif"
  nbEtapes={2}
  numeroEtapeCourante={1}
/>
