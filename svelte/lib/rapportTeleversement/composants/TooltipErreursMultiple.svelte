<script lang="ts">
  export let erreurs: string[];
</script>

<div class="infobulle">
  <div class="conteneur-image">
    <img
      src="/statique/assets/images/icone_infobulle.svg"
      alt="Information sur les erreurs d'import"
    />
  </div>
  <div class="conteneur-information">
    {#each erreurs as erreur, idx (idx)}
      <p>{erreur}</p>
    {/each}
  </div>
</div>

<style lang="scss">
  .infobulle {
    position: relative;

    &:hover .conteneur-information {
      display: flex;
    }

    .conteneur-image {
      padding: 8px 8px 4px 8px;
      cursor: help;

      img {
        filter: brightness(0) invert(11%) sepia(77%) saturate(4724%)
          hue-rotate(4deg) brightness(111%) contrast(120%);
      }
    }

    .conteneur-information {
      display: none;
      width: fit-content;
      padding: 8px;
      position: absolute;
      right: 0;
      top: 0;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 18, 0.16);
      background: white;
      transform: translateX(50%) translateY(-100%);
      flex-direction: column;

      &:after {
        content: '';
        background: white;
        width: 8px;
        height: 8px;
        display: flex;
        position: absolute;
        bottom: -4px;
        right: calc(50% + 12px);
        transform: rotate(45deg);
      }

      p {
        margin: 0;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: 1.25rem;
        text-wrap: initial;
        color: var(--erreur-texte);
        white-space: nowrap;
      }
    }
  }
</style>
