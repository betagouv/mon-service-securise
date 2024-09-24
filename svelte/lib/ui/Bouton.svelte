<script lang="ts">
  export let titre: string;
  export let type: 'primaire' | 'secondaire';
</script>

<button class="bouton {type}" on:click>{titre}</button>

<style>
  button {
    position: relative;
    display: inline-block;
    margin: 0;
    padding: 7px 16px;

    border: solid 1px var(--bleu-mise-en-avant);
    border-radius: 4px;

    color: #fff;

    text-decoration: none;
    user-select: none;
  }

  .primaire {
    background: var(--bleu-mise-en-avant);
  }

  .secondaire {
    color: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
    background-color: #fff;
  }
</style>
