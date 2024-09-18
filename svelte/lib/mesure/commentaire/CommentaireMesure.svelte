<script lang="ts">
  export let contenuCommentaire: string;
</script>

<form on:submit|preventDefault>
  <input
    type="text"
    placeholder="Écrivez un commentaire..."
    bind:value={contenuCommentaire}
  />
  <button type="submit" class="envoi-commentaire">
    <img
      src="/statique/assets/images/icone_envoyer.svg"
      alt="Envoyer le commentaire"
    />
  </button>
</form>

<style>
  form {
    padding: 0 24px 0 36px;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: 12px;
  }

  form input {
    border: 2px solid #eff6ff;
    border-radius: 4px;
    background: white;
    color: #667892;
  }

  button[type='submit'].envoi-commentaire {
    margin: 0;
    padding: 8px;
    border: none;
    background: none;
    display: flex;
    cursor: pointer;
  }
</style>
