<script lang="ts">
  import { glisse } from '../ui/animations/transitions';

  interface Props {
    niveau?: 'info' | 'avertissement';
    avecBoutonFermeture?: boolean;
    id?: string | undefined;
    classeSupplementaire?: string;
    children?: import('svelte').Snippet;
    onFermeture?: () => void;
  }

  let {
    niveau = 'info',
    avecBoutonFermeture = false,
    id = undefined,
    classeSupplementaire = '',
    children,
    onFermeture,
  }: Props = $props();
</script>

<div
  {id}
  class="cadre {niveau} {classeSupplementaire}"
  out:glisse|global={{ depuis: 'right', duree: avecBoutonFermeture ? 500 : 0 }}
>
  {#if avecBoutonFermeture}
    <button
      class="fermeture-avertissement"
      type="button"
      onclick={(e) => {
        e.preventDefault();
        onFermeture?.();
      }}
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
  <div class="contenu-avertissement">
    {@render children?.()}
  </div>
</div>

<style>
  .contenu-avertissement {
    display: flex;
    flex-direction: column;
  }

  .cadre {
    padding: 10px 50px 10px 16px;
    display: flex;
    align-items: start;
    gap: 12px;
    border-radius: 4px;
    margin-bottom: 28px;
    text-align: left;
    position: relative;
    max-width: fit-content;
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
