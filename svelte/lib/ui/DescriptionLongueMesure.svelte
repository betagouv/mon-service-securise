<script lang="ts">
  export let description: string;
  export let lienBlog: string | undefined = undefined;
</script>

<details open={true}>
  <summary />
  <p>
    {@html description}
  </p>
  {#if lienBlog}
    <a class="lien-blog" href={lienBlog} target="_blank" rel="noopener"
      >Comment mettre en œuvre cette mesure ?</a
    >
  {/if}
</details>

<style lang="scss">
  details {
    margin-bottom: 30px;
  }

  summary {
    font-weight: bold;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  summary:before {
    content: 'Description de la mesure';
  }

  summary:after {
    content: '';
    width: 24px;
    height: 24px;
    background: url('/statique/assets/images/chevron_noir.svg');
    transform: translateY(1px) rotate(90deg);
    transition: transform 0.1s ease-in-out;
  }

  details[open] > summary:after {
    transform: translateY(1px) rotate(270deg);
  }

  details p {
    margin: 8px 0 0;
    font-weight: 400;
  }

  a.lien-blog {
    display: block;
  }

  a.lien-blog::after {
    display: inline-block;
    content: '';
    width: 16px;
    height: 16px;
    background: url('/statique/assets/images/home/icone_lien_externe.svg')
      no-repeat center;
    filter: invert(29%) sepia(71%) saturate(1558%) hue-rotate(181deg)
      brightness(70%) contrast(132%);
    margin: auto 5px;
    background-position-y: 2px;
  }
</style>
