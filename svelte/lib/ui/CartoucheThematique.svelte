<script lang="ts">
  export let thematique: string;
</script>

<span class="cartouche">{thematique}</span>

<style lang="scss">
  .cartouche {
    padding: 1px 8px 3px;
    font-size: 0.9em;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    background: #eee;
    color: #161616;
    font-weight: 400;
    white-space: nowrap;
  }
</style>
