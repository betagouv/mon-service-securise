<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let valeurs: string[] = [];
  export let label: string = '';
  export let actif = true;

  let cochee: boolean;

  $: cochee = valeurs.includes(id);

  const emetEvenement = createEventDispatcher();

  const metsAJourLesValeursCochees = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      valeurs = [...valeurs, id];
    } else {
      valeurs = valeurs.filter((item) => item !== id);
    }
    emetEvenement('change', event);
  };
</script>

<label for={id} class:inactif={!actif}>
  <input
    type="checkbox"
    {id}
    disabled={!actif}
    value={id}
    checked={cochee}
    on:change={metsAJourLesValeursCochees}
  />
  <span>{label}</span>
</label>

<style lang="scss">
  label {
    display: flex;
    gap: 8px;

    &.inactif span {
      opacity: 0.5;
    }
    span {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #161616;
      font-weight: normal;
    }
  }

  input[type='checkbox'] {
    appearance: none;
    border-radius: 4px;
    border: 1px solid #042794;
    width: 24px;
    height: 24px;
    margin: 0;
    cursor: pointer;
    transform: none;

    &:checked,
    &:indeterminate {
      background: var(--bleu-mise-en-avant);
      border-color: var(--bleu-mise-en-avant);
    }

    &:checked::before {
      content: '';
      width: 6px;
      height: 12px;
      border-right: 2px solid white;
      border-bottom: 2px solid white;
      display: block;
      transform: translate(7px, 2px) rotate(45deg);
      margin: 0;
    }

    &:focus-visible {
      outline: 2px solid var(--bleu-mise-en-avant);
      outline-offset: 2px;
    }

    &:indeterminate::before {
      content: '';
      height: 8px;
      border-bottom: 1.5px solid white;
      display: block;
      transform: translate(4px, -1.5px) rotate(0);
      border-right: 0;
      width: 6px;
    }

    &:disabled {
      cursor: not-allowed;
      border-color: #dddddd;
      background-color: #e5e5e5;

      &::before {
        border-color: #929292;
      }
    }
  }
</style>
