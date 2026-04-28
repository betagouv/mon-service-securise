<script lang="ts">
  import Pastille from './Pastille.svelte';

  interface Props {
    active: boolean;
    libelle: string;
    libellePastille: string;
  }

  let props: Props = $props();
</script>

<div class="label-onglet">
  <span>{props.libelle}</span>
  <Pastille active={props.active} contenu={props.libellePastille} />
</div>

<style lang="scss">
  .label-onglet {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
