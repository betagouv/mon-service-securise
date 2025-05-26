<div class="chargement-en-cours"></div>

<style>
  .chargement-en-cours {
    display: block;
    width: 16px;
    height: 16px;
    margin: 0;
    border-radius: 50%;
    border: 2px solid var(--texte-fonce);
    border-color: var(--texte-fonce) transparent;
    animation: rotation 1.2s linear infinite;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
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
