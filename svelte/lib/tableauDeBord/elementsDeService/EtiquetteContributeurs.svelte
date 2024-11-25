<script lang="ts">
  export let nombreContributeurs: number;
</script>

<span>
  <img
    src="/statique/assets/images/icone_contributeurs.svg"
    alt="Icône du nombre de contributeurs"
  />
  {nombreContributeurs}
</span>

<style>
  span {
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
  }

  img {
    height: 12px;
  }
</style>
