<script lang="ts">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  interface Props {
    parDessusDeclencheur?: boolean;
    fermeMenuSiClicInterne?: boolean;
    estLectureSeule?: boolean;
    menuOuvert?: boolean;
    stopPropagation?: boolean;
    classePersonnalisee?: string;
    declencheur?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    parDessusDeclencheur = false,
    fermeMenuSiClicInterne = false,
    estLectureSeule = false,
    menuOuvert = $bindable(false),
    stopPropagation = false,
    classePersonnalisee = '',
    declencheur,
    children,
  }: Props = $props();

  let declencheurEl: HTMLButtonElement = $state();
  let contenuEl: HTMLDivElement = $state();

  const ouvreLeMenu = (e: MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    menuOuvert = true;
  };

  export const fermeLeMenu = () => {
    menuOuvert = false;
  };
</script>

<div class="conteneur {classePersonnalisee}">
  <button
    type="button"
    class="declencheur"
    onclick={ouvreLeMenu}
    bind:this={declencheurEl}
    disabled={estLectureSeule}
  >
    {@render declencheur?.()}
  </button>
  <div
    class="svelte-menu-flottant"
    bind:this={contenuEl}
    class:invisible={!menuOuvert}
    class:parDessusDeclencheur
  >
    {@render children?.()}
  </div>
</div>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={menuOuvert}
  elements={[declencheurEl, ...(fermeMenuSiClicInterne ? [] : [contenuEl])]}
/>

<style>
  .conteneur {
    display: flex;
    position: relative;
    cursor: pointer;
  }

  .svelte-menu-flottant {
    position: absolute;
    left: -2px;
    transform: translateX(-100%);
    z-index: 100;
  }

  .svelte-menu-flottant.parDessusDeclencheur {
    transform: translate(0, -1px);
  }

  .invisible {
    display: none;
  }

  button {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  button[disabled] {
    cursor: not-allowed;
  }
</style>
