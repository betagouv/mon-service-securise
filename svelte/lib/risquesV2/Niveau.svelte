<script lang="ts">
  import type { Niveau } from './risquesV2.d';

  export let niveau: Niveau;
</script>

<div class="niveau-{niveau}">
  <span>{niveau}</span>
</div>

<style lang="scss">
  div {
    display: flex;
    padding: 0 4px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    width: 16px;

    &.niveau-4 {
      background: #000;
    }

    &.niveau-3 {
      background: var(--bleu-anssi);
    }

    &.niveau-2 {
      background: var(--bleu-survol);
    }

    &.niveau-1 {
      background: var(--bleu-mise-en-avant);
    }

    span {
      color: #fff;
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.5rem;
    }
  }
</style>
