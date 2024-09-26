<script lang="ts">
  export let nom: string;
  export let id: string;
  export let valeur: string = '';
</script>

<input type="text" {id} name={nom} bind:value={valeur} />

<style>
  input {
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 16px;
    padding: 8px 16px;
    line-height: 24px;
  }

  input:hover {
    border-color: var(--bleu-mise-en-avant);
  }
</style>
