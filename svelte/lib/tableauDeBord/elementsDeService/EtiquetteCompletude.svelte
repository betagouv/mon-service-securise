<script lang="ts">
  export let pourcentageCompletude: number;
  export let idService: string;

  const valeurCompletude = pourcentageCompletude || 0;
</script>

<a class="conteneur-completude" href="/service/{idService}/mesures">
  <span>{Math.round(valeurCompletude * 100)}%</span>
  <progress max="1" value={valeurCompletude} />
</a>

<style>
  .conteneur-completude {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    color: var(--texte-clair);
    border-radius: 4px;
    padding: 0 4px;
    outline-offset: 2px;
    border: 1px solid transparent;
    width: fit-content;
  }

  .conteneur-completude:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  .conteneur-completude:focus-visible {
    border-color: var(--bleu-mise-en-avant);
    outline: 2px solid var(--bleu-mise-en-avant);
  }

  .conteneur-completude:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  .conteneur-completude:active {
    background-color: #dadfe6;
  }

  .conteneur-completude span {
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
