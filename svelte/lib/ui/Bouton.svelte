<script lang="ts">
  export let titre: string;
  export let type: 'primaire' | 'secondaire';
  export let actif: boolean = true;
  export let enCoursEnvoi: boolean = false;
</script>

<button
  class="bouton {type}"
  on:click
  disabled={!actif || enCoursEnvoi}
  class:en-cours-chargement={enCoursEnvoi}>{titre}</button
>

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

  button:disabled {
    background-color: var(--gris-inactif);
    border-color: var(--gris-inactif);
    color: #fff;
  }
</style>
