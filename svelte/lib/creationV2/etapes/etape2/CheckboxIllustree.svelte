<script lang="ts">
  export let id: string;
  export let details: { nom: string; exemple?: string };
  export let valeurs: string[];
  export let illustration: string;

  let cochee: boolean;

  $: cochee = valeurs.includes(id);

  const metsAJourLesValeursCochees = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      valeurs = [...valeurs, id];
    } else {
      valeurs = valeurs.filter((item) => item !== id);
    }
  };
</script>

<div class="conteneur-checkbox">
  <input
    type="checkbox"
    {id}
    name="type-service"
    value={id}
    checked={cochee}
    on:change={metsAJourLesValeursCochees}
  />

  <label for={id}>
    <img src={illustration} alt="" />
    <span class="details">
      {details.nom}
      {#if details.exemple}
        <span>{details.exemple}</span>
      {/if}
    </span>
  </label>
</div>

<style lang="scss">
  .conteneur-checkbox {
    display: flex;
    gap: 8px;
    border: 1px solid #dddddd;
    padding: 4px 4px 4px 0;
    border-radius: 8px;
    cursor: pointer !important;

    * {
      cursor: pointer !important;
    }

    input[type='checkbox'] {
      height: 0;
      width: 0;
      margin: 0;
      padding: 0;
    }

    &:has(input:hover) {
      border-color: var(--bleu-mise-en-avant);
      background: #f6f6f6;
    }

    &:has(input:checked) {
      box-shadow: 0 0 0 1px var(--bleu-mise-en-avant);
      border-color: var(--bleu-mise-en-avant);
      background: #f1f5f9;

      &:has(input:hover) {
        background: #d0e5fb;
      }
    }

    &:has(input:focus-visible) {
      outline: 2px solid var(--bleu-mise-en-avant);
      outline-offset: 2px;
    }

    img {
      width: 56px;
      height: 56px;
      padding: 12px 16px;
      border-right: 1px solid #dddddd;
    }

    label {
      width: 100%;
      font-size: 1rem !important;
      line-height: 1.5rem !important;
      font-weight: normal !important;
      display: flex !important;
      flex-direction: row !important;

      .details {
        display: flex;
        flex-direction: column;
        font-size: 1.5rem;
        line-height: 1.5rem;
        font-weight: 400;
        justify-content: center;
        color: #161616;

        span {
          font-size: 0.75rem;
          line-height: 1.25rem;
          color: #666;
          justify-content: center;
        }
      }
    }
  }
</style>
