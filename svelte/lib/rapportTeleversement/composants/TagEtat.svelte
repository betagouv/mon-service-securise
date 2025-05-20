<script lang="ts">
  export let valide: boolean;
</script>

<span class:valide>{valide ? 'Valide' : 'Erreur'}</span>

<style lang="scss">
  span {
    padding: 0 6px;
    border-radius: 4px;
    --couleur-fond: #ffe9e9;
    --couleur-texte: var(--erreur-texte);
    background: var(--couleur-fond);
    color: var(--couleur-texte);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.25rem;
    text-transform: uppercase;
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;

    &:before {
      content: url(/statique/assets/images/ui-kit/erreur.svg);
      display: flex;
      width: 16px;
      height: 16px;
      transform: scale(0.75);
    }

    &.valide {
      --couleur-fond: #defbe5;
      --couleur-texte: var(--succes-texte);

      &:before {
        content: url(/statique/assets/images/ui-kit/succes.svg);
      }
    }
  }
</style>
