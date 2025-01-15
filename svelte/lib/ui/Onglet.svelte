<script lang="ts" generics="T extends string">
  import Pastille from './Pastille.svelte';

  export let ongletActif: T;
  export let cetOnglet: T;
  export let labelOnglet: string;
  export let badge: 'info' | number = 0;
  export let sansBordureEnBas: boolean = false;
</script>

<button
  type="button"
  class="onglet"
  class:active={ongletActif === cetOnglet}
  class:sansBordureEnBas
  on:click={() => (ongletActif = cetOnglet)}
>
  <span class="label">{labelOnglet}</span>
  {#if badge === 'info'}
    <img
      src="/statique/assets/images/icone_information_suppression.svg"
      alt="Icône d'information"
    />
  {:else if badge}
    <Pastille contenu={badge.toString()} active={ongletActif === cetOnglet} />
  {/if}
</button>

<style>
  img {
    width: 16px;
    height: 16px;
  }

  .onglet {
    min-width: 140px;
    padding: 9px 12px;
    background: #eff6ff;
    border: none;
    cursor: pointer;
    border-top: 2px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .onglet:not(.sansBordureEnBas):not(.active) {
    border-bottom: 1px solid var(--liseres-fonce);
  }

  .onglet:hover {
    background: var(--fond-bleu-pale);
  }

  .onglet.active {
    background: white;
    border-top: 2px solid var(--bleu-mise-en-avant);
    border-left: 1px solid var(--liseres-fonce);
    border-right: 1px solid var(--liseres-fonce);
    border-bottom: 1px solid white;
    color: var(--bleu-mise-en-avant);
    font-weight: bold;
  }
</style>
