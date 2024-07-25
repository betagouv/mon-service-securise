<script lang="ts">
  import type { TypeOnglet } from '../centreNotifications.d';

  export let ongletActif: TypeOnglet;
  export let cetOnglet: TypeOnglet;
  export let labelOnglet: string;
  export let nbNonLue: number;
</script>

<button
  type="button"
  class="onglet"
  class:active={ongletActif === cetOnglet}
  on:click={() => (ongletActif = cetOnglet)}
>
  <span class="label">{labelOnglet}</span>
  {#if nbNonLue}
    <span class="non-lue">{nbNonLue}</span>
  {/if}
</button>

<style>
  .onglet {
    min-width: 140px;
    padding: 9px 12px;
    background: #eff6ff;
    border: none;
    cursor: pointer;
    border-top: 2px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    border-bottom: 1px solid var(--liseres-fonce);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
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

  .non-lue {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid white;
    background: var(--fond-gris-pale);
    color: var(--texte-clair);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 12px;
  }

  .onglet.active .non-lue {
    background: var(--bleu-mise-en-avant);
    border: 1px solid transparent;
    color: white;
  }
</style>
