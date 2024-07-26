<script lang="ts">
  import { glisse } from '../ui/animations/transitions';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let niveau: 'info' | 'avertissement' = 'info';
  export let avecBoutonFermeture: boolean = false;
  export let id: string | undefined = undefined;
</script>

<div {id} class="cadre {niveau}" out:glisse={{ depuis: 'right', duree: 500 }}>
  {#if avecBoutonFermeture}
    <button
      class="fermeture-avertissement"
      type="button"
      on:click|preventDefault={() => dispatch('fermeture')}
      >×
    </button>
  {/if}
  {#if niveau === 'info'}
    <img
      src="/statique/assets/images/icone_information_suppression.svg"
      alt="Icône d'information"
    />
  {:else if niveau === 'avertissement'}
    <img src="/statique/assets/images/icone_danger.svg" alt="Icône de danger" />
  {/if}
  <slot />
</div>

<style>
  .cadre {
    padding: 10px 50px 10px 16px;
    display: flex;
    align-items: start;
    gap: 12px;
    border-radius: 4px;
    margin-bottom: 28px;
    text-align: left;
    position: relative;
  }

  .cadre.info {
    border: 1px solid var(--bleu-mise-en-avant);
    background: var(--fond-bleu-pale);
  }

  .cadre.avertissement {
    border: 1px solid #faa72c;
    background: var(--fond-ocre-pale);
  }

  .fermeture-avertissement {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 22px;
    line-height: 16px;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>
