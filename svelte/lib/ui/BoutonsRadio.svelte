<script context="module" lang="ts">
  export type OptionBoutonRadio = {
    titre: string;
    sousTitre?: string;
    valeur: string;
  };
</script>

<script lang="ts">
  export let options: OptionBoutonRadio[];
  export let valeurSelectionnee: string = '';

  const nomUnique = crypto.randomUUID();
</script>

<div class="groupe-boutons-radio">
  {#each options as { titre, valeur, sousTitre } (valeur)}
    <div class="bouton-radio">
      <input
        type="radio"
        id={valeur}
        name={nomUnique}
        value={valeur}
        bind:group={valeurSelectionnee}
      />
      <label for={valeur}>
        <span class="titre">{titre}</span>
        <span class="sous-titre">{sousTitre}</span>
      </label>
    </div>
  {/each}
</div>

<style lang="scss">
  .groupe-boutons-radio {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .bouton-radio {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      input[type='radio'] {
        position: relative;
        appearance: none;
        width: 24px;
        height: 24px;
        border: 1px solid var(--bleu-mise-en-avant);
        border-radius: 50%;
        margin: 0;
        box-sizing: border-box;
        min-width: 24px;
        min-height: 24px;
        cursor: pointer;

        &:checked::before {
          position: absolute;
          display: flex;
          content: '';
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--bleu-mise-en-avant);
          transform: translateX(5px) translateY(5px);
        }
      }

      label {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        user-select: none;

        .titre {
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          line-height: 1.5rem;
        }

        .sous-titre {
          color: #666;
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 400;
          line-height: 1.25rem;
        }
      }
    }
  }
</style>
