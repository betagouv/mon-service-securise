<script lang="ts">
  import type { HTMLInputTypeAttribute } from 'svelte/elements';

  export let id: string = '';
  export let nom: string = '';
  export let valeur: string = '';
  export let type: HTMLInputTypeAttribute = 'password';
  let visible: boolean = false;

  const basculeVisibilite = () => {
    visible = !visible;
    type = visible ? 'text' : 'password';
  };

  const typeChamp = (node: HTMLInputElement) => {
    node.type = type;
  };
</script>

<div>
  {#key type}
    <input {id} name={nom} use:typeChamp bind:value={valeur} />
  {/key}
  <button
    type="button"
    class="icone-voir-mot-de-passe"
    class:cacher={visible}
    on:click={basculeVisibilite}
  ></button>
</div>

<style>
  div {
    position: relative;
  }

  input {
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 14px;
    padding: 8px 16px;
    line-height: 24px;
    background: white;
    margin-bottom: 0;
  }

  input:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  .icone-voir-mot-de-passe {
    top: 0.7em;
  }

  button {
    background-color: transparent;
    border: none;
  }
</style>
