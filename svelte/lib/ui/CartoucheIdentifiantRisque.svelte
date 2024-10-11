<script lang="ts">
  export let identifiant: string;
</script>

<span>{identifiant}</span>

<style>
  span {
    border: 1.5px solid #0c8626;
    border-radius: 40px;
    padding: 4px 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: #0c8626;
    background: #f1f5f9;
    font-size: 0.9em;
  }
</style>
