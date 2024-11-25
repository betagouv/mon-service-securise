<div></div>

<style>
  div {
    width: 12px;
    height: 12px;
    margin: 0;
    border-radius: 50%;
    border: 2px solid;
    border-color: var(--bleu-mise-en-avant) transparent;
    animation: rotation 1.2s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
