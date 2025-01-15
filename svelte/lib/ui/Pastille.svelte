<script lang="ts">
  export let contenu: string;
  export let active: boolean = false;
</script>

<span class="pastille" class:active>
  {contenu}
</span>

<style>
  .pastille {
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

  .pastille.active {
    background: var(--bleu-mise-en-avant);
    border: 1px solid transparent;
    color: white;
  }
</style>
