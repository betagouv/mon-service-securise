<script lang="ts">
  export let libelleCategorie: string;
</script>

<span>{libelleCategorie}</span>

<style>
  span {
    border-radius: 40px;
    padding: 1px 8px 3px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: black;
    background: #f1f5f9;
    font-size: 0.9em;
  }
</style>
