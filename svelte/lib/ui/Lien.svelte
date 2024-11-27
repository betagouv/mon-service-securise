<script lang="ts">
  export let titre: string;
  export let href: string;
  export let icone: 'plus' = '';
  export let type: 'bouton-primaire' = 'bouton-primaire';
</script>

<a class="{type} {icone}" class:avecIcone={!!icone} {href} rel="noopener">
  {titre}
</a>

<style>
  a {
    align-items: center;
    gap: 8px;
    display: flex;
    margin: 0;
    padding: 7px 16px;

    border: solid 1px var(--bleu-mise-en-avant);
    border-radius: 4px;

    color: #fff;

    font-size: 16px;
    font-weight: 500;
    line-height: 24px;

    text-decoration: none;
    user-select: none;
    justify-content: center;
  }

  .plus:before {
    background-image: url('/statique/assets/images/icone_plus_dsfr.svg');
    transform: translateY(1px);
  }

  .avecIcone:before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .bouton-primaire {
    background: var(--bleu-mise-en-avant);
  }

  .bouton-primaire:hover {
    background: #026ab5;
  }

  .bouton-primaire:active {
    background: #025591;
  }

  .bouton-primaire:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }
</style>
