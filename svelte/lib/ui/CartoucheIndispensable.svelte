<script lang="ts">
  interface Props {
    indispensable: boolean;
  }

  let { indispensable }: Props = $props();
</script>

<span class:indispensable
  >{indispensable ? 'Indispensable' : 'Recommandée'}</span
>

<style>
  span {
    padding: 1px 8px 3px;
    font-size: 0.9em;
    font-weight: 500;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    background: #f1f5f9;
  }

  span.indispensable {
    color: #7025da;
  }

  span:not(.indispensable) {
    color: #0079d0;
  }
</style>
