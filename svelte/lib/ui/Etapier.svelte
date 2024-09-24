<script lang="ts">
  export let etapeCourante: number;
  export let nombreEtapes: number;
</script>

<div>
  {#each new Array(nombreEtapes).fill(0) as _, i}
    <span class:accessible={i + 1 <= etapeCourante} />
  {/each}
</div>

<style>
  div {
    display: flex;
    gap: 8px;
  }

  span {
    flex-grow: 1;
    height: 8px;
    background-color: #eee;
  }
  .accessible {
    background-color: var(--bleu-mise-en-avant);
  }
</style>
