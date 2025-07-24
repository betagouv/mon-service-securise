<script lang="ts">
  export let contenu: string;
  export let label: string;
  export let aideSaisie: string = '';
</script>

<label>
  {label}
  <textarea bind:value={contenu} rows="3" placeholder={aideSaisie} />
</label>

<style lang="scss">
  textarea {
    width: 100%;
    max-width: 700px;
    border: none;
    border-radius: 4px 4px 0 0;
    border-bottom: 2px solid #3a3a3a;
    background: #eee;
    color: #3a3a3a;
    font-family: Marianne;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 8px 16px;
    box-sizing: border-box;
    margin-top: 8px;
  }
</style>
