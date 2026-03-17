<script lang="ts">
  interface Props {
    actif: boolean;
    id: string;
    labelActif?: string;
    labelInactif?: string;
    onChange?: (actif: boolean) => void;
  }

  let {
    actif = $bindable(),
    id,
    labelActif = 'Activé',
    labelInactif = 'Désactivé',
    onChange,
  }: Props = $props();

  const gereChangementEtat = () => {
    actif = !actif;
    onChange?.(actif);
  };
</script>

<div>
  <button
    type="button"
    aria-label={actif ? labelActif : labelInactif}
    role="switch"
    aria-checked={actif}
    {id}
    onclick={gereChangementEtat}
  >
  </button>
  <label for={id}>{actif ? labelActif : labelInactif}</label>
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
