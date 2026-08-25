<script lang="ts">
  interface Props {
    icone: string;
    titre: string;
    sousTitre: string;
    valeur: boolean;
    avecBordure?: boolean;
    onvaleurmodifiee: (valeur: boolean) => Promise<void>;
  }

  let {
    icone,
    titre,
    sousTitre,
    valeur,
    avecBordure = false,
    onvaleurmodifiee,
  }: Props = $props();

  let id = $derived(`toggle-${titre.toLowerCase().replace(' ', '-')}`);
</script>

<div class:avecBordure>
  <lab-anssi-icone nom={icone} taille="md"></lab-anssi-icone>
  <dsfr-toggle
    {id}
    label={titre}
    hint={sousTitre}
    hint-id="{id}-hint"
    checked={valeur}
    onvaluechanged={(e: CustomEvent<boolean>) => onvaleurmodifiee(e.detail)}
    left
    border={avecBordure}
  ></dsfr-toggle>
</div>

<style lang="scss">
  div {
    display: flex;
    gap: 16px;
    width: 100%;
    padding: 16px 0;

    &.avecBordure {
      padding-bottom: 0;
    }

    dsfr-toggle {
      flex: 1;
    }
  }
</style>
