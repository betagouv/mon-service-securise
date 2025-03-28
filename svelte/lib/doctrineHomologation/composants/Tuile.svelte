<script lang="ts">
  export let titre: string;
  export let illustration: string;
  export let contenu: string;
  export let classe: string = '';
</script>

<div class="tuile {classe ?? ''}">
  <div class="conteneur-image">
    <img src={illustration} alt="" />
  </div>
  <p>{titre}</p>
  <span>{contenu}</span>
</div>

<style>
  .tuile {
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    color: var(--texte-fonce);
    max-width: 384px;
  }

  p {
    margin: 0;
    font-size: 22px;
    font-style: normal;
    font-weight: 700;
    line-height: 28px;
  }

  span {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
  }
</style>
