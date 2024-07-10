<script lang="ts">
  import type { TypeOnglet } from './centreNotifications.d';

  export let ongletActif: TypeOnglet;
  export let cetOnglet: TypeOnglet;
  export let labelOnglet: string;
</script>

<button
  type="button"
  class="onglet"
  class:active={ongletActif === cetOnglet}
  on:click={() => (ongletActif = cetOnglet)}
>
  {labelOnglet}
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
