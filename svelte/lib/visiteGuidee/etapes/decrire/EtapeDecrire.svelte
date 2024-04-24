<script lang="ts">
  import { onMount } from 'svelte';
  import { visiteGuidee } from '../../visiteGuidee.store';
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';

  const rideau = document.getElementById('visite-guidee-rideau')!;
  const cible = document.getElementById('nom-service')!;
  cible.style.width = '50%';
  let positionCible: DOMRect;
  const calculePolygone = () => {
    positionCible = cible.getBoundingClientRect();
    let { left, top, right, bottom } = positionCible;
    left -= 20;
    right += 20;
    bottom += 20;
    top -= 30;
    rideau.style.clipPath = `polygon(
            0% 0%,
            0% 100%,
            ${left}px 100%,
            ${left}px ${top}px,
            ${right}px ${top}px,
            ${right}px ${bottom}px,
            ${left}px ${bottom}px,
            ${left}px 100%,
            100% 100%,
            100% 0%
        )`;
  };
  onMount(() => calculePolygone());
</script>

<svelte:window on:resize={calculePolygone} on:load={calculePolygone} />
<ModaleSousEtape
  bind:positionCible
  titre="Décrivez votre service"
  description="Dans un premier temps, répondez à quelques questions afin d’obtenir une liste de mesures de sécurité personnalisée"
  animation="/statique/assets/images/visiteGuidee/decrire.gif"
/>
