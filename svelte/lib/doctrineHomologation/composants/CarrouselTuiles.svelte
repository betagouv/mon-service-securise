<script lang="ts">
  import Tuile from './Tuile.svelte';

  let elementCarrousel: HTMLDivElement;

  const versDirection = (direction: number) => {
    if (elementCarrousel) {
      const cardWidth = elementCarrousel.firstElementChild?.clientWidth || 0;
      elementCarrousel.scrollBy({
        left: direction * (cardWidth + 16),
        behavior: 'smooth',
      });
    }
  };

  const precedent = () => versDirection(-1);

  const suivant = () => versDirection(+1);
</script>

<div class="carrousel-tuiles">
  <div class="conteneur-tuiles" bind:this={elementCarrousel}>
    <Tuile
      illustration="/statique/assets/images/doctrine-homologation/icone-succes.svg"
      titre="Pédagogique"
      contenu="Pourquoi, quoi, quand, qui, comment ? L'homologation de sécurité a été pensée pour être accessible à tous."
      classe="tuile-presentation"
    />
    <Tuile
      illustration="/statique/assets/images/doctrine-homologation/icone-balance.svg"
      titre="Proportionnée"
      contenu={`D'une démarche "simplifiée" à une démarche "renforcée", l'homologation doit être adaptée à la criticité d'un système et à son exposition.`}
      classe="tuile-presentation"
    />
    <Tuile
      illustration="/statique/assets/images/doctrine-homologation/icone-utilisateur.svg"
      titre="Adaptée à vos usages"
      contenu="Une doctrine construite grâce à l'expérience de l'ANSSI auprès de l'immense diversité des entités publiques et privées concernées par l'obligation d'homologation."
      classe="tuile-presentation"
    />
  </div>
  <div class="conteneur-actions">
    <button class="precedent" on:click={precedent}>Précédent</button>
    <button class="suivant" on:click={suivant}>Suivant</button>
  </div>
</div>

<style>
  .conteneur-tuiles {
    --espacement: 16px;
    display: flex;
    overflow-x: auto;
    gap: var(--espacement);
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .conteneur-tuiles::-webkit-scrollbar {
    display: none;
  }

  :global(.tuile-presentation:first-of-type) {
    margin-left: var(--espacement);
  }

  :global(.tuile-presentation:last-of-type) {
    margin-right: var(--espacement);
  }

  :global(.tuile-presentation) {
    box-sizing: border-box;
    scroll-snap-align: center;
    flex-shrink: 0;
    width: calc(100vw - 60px);
    max-width: 266px;
  }

  .conteneur-actions {
    display: flex;
    margin-top: 32px;
    justify-content: center;
    padding: 0 var(--espacement);
    gap: 24px;
  }

  .conteneur-actions button {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    font-weight: 400;
    line-height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .conteneur-actions .precedent:before,
  .conteneur-actions .suivant:after {
    content: url(/statique/assets/images/fleche_gauche_bleue.svg);
    display: flex;
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }

  .conteneur-actions .suivant:after {
    transform: rotate(180deg);
  }

  .conteneur-actions button:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
  }

  @media screen and (min-width: 577px) {
    .conteneur-tuiles {
      --espacement: 24px;
    }
  }

  @media screen and (min-width: 1247px) {
    .conteneur-actions {
      display: none;
    }

    :global(.tuile-presentation:first-of-type) {
      margin-left: 0;
    }

    :global(.tuile-presentation:last-of-type) {
      margin-right: 0;
    }
  }
</style>
