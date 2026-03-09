<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import AsterisqueChampRequis from './AsterisqueChampRequis.svelte';

  interface Props {
    contenu: string;
    label: string;
    aideSaisie?: string;
    requis?: boolean;
    tailleMinimale?: number;
  }

  let {
    contenu = $bindable(),
    label,
    aideSaisie = '',
    requis = false,
    tailleMinimale = 3,
  }: Props = $props();
</script>

<label>
  {#if requis}
    <AsterisqueChampRequis />
  {/if}
  {label}
  <textarea
    bind:value={contenu}
    rows={tailleMinimale}
    placeholder={aideSaisie}
    required={requis}
    onblur={bubble('blur')}
  ></textarea>
</label>

<style lang="scss">
  label {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: bold;
    margin: 0;
  }

  textarea {
    width: 100%;
    max-width: 700px;
    border: none;
    border-radius: 4px 4px 0 0;
    border-bottom: 2px solid #3a3a3a;
    background: #eee;
    color: #3a3a3a;
    font-family: Marianne;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 8px 16px;
    box-sizing: border-box;
    margin-top: 8px;
    height: unset;

    &:user-invalid {
      border-bottom-color: var(--erreur-texte);
    }
  }
</style>
