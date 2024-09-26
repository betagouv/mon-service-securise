<script lang="ts">
  export let nom: string;
  export let id: string;
</script>

<input type="text" {id} name={nom} />

<style>
  input {
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 16px;
    padding: 8px 16px;
    line-height: 24px;
  }
</style>
