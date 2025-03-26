<script lang="ts">
  export let href: string;
  export let titre: string;
  export let fondIllustration: 'bleu' | 'jaune' = 'bleu';

  let avecIllustration = $$slots.illustration;
</script>

<a
  {href}
  target="_blank"
  rel="noopener"
  class="carte"
  class:avec-illustration={avecIllustration}
>
  <div class={`illustration fond-${fondIllustration}`}>
    <slot name="illustration" />
  </div>

  <div class="promotion">
    <h3>{titre}</h3>
    <p><slot /></p>
    <img
      class="fleche-navigation"
      alt=""
      src="/statique/assets/images/fleche_gauche_bleue.svg"
    />
  </div>
</a>

<style lang="scss">
  .carte {
    display: flex;
    flex-direction: row;

    height: 204px;
    position: relative;
    flex: 1 1 0;
    border: 1px solid var(--systeme-design-etat-contour-champs);
    border-radius: 8px;

    &:hover {
      box-shadow: var(--ombre-md);
    }

    &.avec-illustration .illustration {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 0 0 135px;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;

      &.fond-jaune {
        background-color: #fff6d7;
      }
      &.fond-bleu {
        background-color: var(--bleu-mise-en-avant);
      }

      :global(img) {
        width: 100%;
      }
    }

    .promotion {
      display: flex;
      flex-direction: column;
      padding: 24px 24px 56px;
      gap: 8px;

      h3 {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: bold;
        color: #042794;
        text-decoration: none;
        margin: 0;
      }

      p {
        margin: 0;
        color: #282828;
        font-size: 0.875rem;
        line-height: 1.5rem;
      }

      .fleche-navigation {
        position: absolute;
        bottom: 24px;
        right: 24px;
        width: 16px;
        height: 16px;
        transform: rotate(180deg);
        filter: brightness(0) saturate(100%) invert(12%) sepia(63%)
          saturate(4499%) hue-rotate(239deg) brightness(87%) contrast(141%);
      }
    }
  }
</style>
