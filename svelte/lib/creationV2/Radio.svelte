<script lang="ts">
  export let id: string;
  export let nom: string;
  export let valeur: string;
  export let exemple: string | undefined = undefined;
  export let illustration: string | undefined = undefined;
</script>

<div class="conteneur-radio" class:avec-illustration={!!illustration}>
  <input type="radio" {id} value={id} bind:group={valeur} on:change />
  <label for={id}>
    {#if illustration}
      <img src={illustration} alt="" />
    {/if}
    <span class="details">
      {nom}
      {#if exemple}
        <span>{exemple}</span>
      {/if}
    </span>
  </label>
</div>

<style lang="scss">
  .conteneur-radio {
    display: flex;
    gap: 8px;
    border: 1px solid #dddddd;
    border-radius: 8px;
    cursor: pointer;

    * {
      cursor: pointer;
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

    label {
      width: 100%;
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: normal;
      margin: 12px 24px;

      display: flex;
      flex-direction: row;

      .details {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      span:not(.details) {
        font-size: 0.75rem;
        line-height: 1.25rem;
        color: #666;
      }
    }

    input[type='radio'] {
      height: 0;
      width: 0;
      margin: 0;
      padding: 0;
    }

    &.avec-illustration {
      padding: 4px 4px 4px 0;

      label {
        margin: 0;

        .details {
          margin-left: 24px;
        }
      }

      img {
        width: 56px;
        height: 56px;
        padding: 12px 16px;
        border-right: 1px solid #dddddd;
      }
    }
  }
</style>
