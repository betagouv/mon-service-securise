<script lang="ts">
  export let nombreContributeurs: number;
</script>

<button class="contributeurs-service" on:click>
  <img
    src="/statique/assets/images/icone_contributeurs.svg"
    alt="Icône du nombre de contributeurs"
  />
  {nombreContributeurs}
</button>

<style>
  button {
    padding: 0 6px;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
    color: var(--bleu-mise-en-avant);
    background: var(--cyan-clair);
    width: fit-content;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background: #b6cffb;
  }

  button:active {
    background: #7badef;
  }

  img {
    height: 12px;
  }
</style>
