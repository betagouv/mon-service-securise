<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let actif: boolean;
  export let id: string;

  const emetEvenement = createEventDispatcher<{
    change: boolean;
  }>();

  const gereChangementEtat = () => {
    actif = !actif;
    emetEvenement('change', actif);
  };
</script>

<div>
  <button
    type="button"
    role="switch"
    aria-checked={actif}
    {id}
    on:click={gereChangementEtat}
  >
  </button>
  <label for={id}>{actif ? 'Activé' : 'Désactivé'}</label>
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  button {
    width: 40px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 40px;
    border: 1px solid var(--bleu-mise-en-avant);
    background: white;
    cursor: pointer;
    transition: all 0.1s ease-out;
    padding: 0;

    &:before {
      content: '';
      display: flex;
      width: 22px;
      height: 22px;
      outline: 1px solid var(--bleu-mise-en-avant);
      border-radius: 100%;
      transition: all 0.1s ease-out;
      background-repeat: no-repeat;
      background-position: center;
    }

    &[aria-checked='true'] {
      background: var(--bleu-mise-en-avant);

      &:before {
        transform: translateX(16px);
        background-size: 16px 16px;
        background: white url(/statique/assets/images/icone_check.svg) no-repeat
          center;
      }
    }
  }

  label {
    color: var(--texte-fonce);
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    margin: 0;
  }
</style>
