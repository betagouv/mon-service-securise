<script lang="ts">
  export let pourcentageCompletude: number;
</script>

<div class="conteneur-completude">
  <span>{Math.round(pourcentageCompletude * 100)}%</span>
  <progress max="1" value={pourcentageCompletude} />
</div>

<style>
  .conteneur-completude {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  span {
    font-size: 0.88rem;
    line-height: 1.5rem;
  }

  progress {
    accent-color: var(--bleu-mise-en-avant);
    background-color: var(--fond-bleu-pale);
    -webkit-appearence: none;
    appearance: none;
    border: none;
    width: 40px;
    height: 5px;
    border-radius: 5px;
  }

  progress::-webkit-progress-bar {
    background-color: var(--fond-bleu-pale);
    border-radius: 5px;
  }

  progress::-webkit-progress-value {
    background-color: var(--bleu-mise-en-avant);
    border-radius: 5px;
  }

  progress::-moz-progress-bar {
    background-color: var(--bleu-mise-en-avant);
    border-radius: 5px;
  }
</style>
