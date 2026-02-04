<script lang="ts">
  export let description: string;
  export let lienBlog: string | undefined = undefined;
  export let repliee: boolean = false;

  const recupereObjectif = (
    descriptionComplete: string
  ): {
    description: string;
    objectif?: string;
  } => {
    const marqueurs = ['<p>Cette mesure', 'Cette mesure'];

    for (const marqueur of marqueurs) {
      const index = descriptionComplete.indexOf(marqueur);
      if (index !== -1) {
        return {
          description: descriptionComplete.slice(0, index),
          objectif: descriptionComplete.slice(index),
        };
      }
    }

    return { description };
  };

  let descriptionAAfficher: string;
  let objectifAAfficher: string | undefined;
  $: {
    const resultat = recupereObjectif(description);
    descriptionAAfficher = resultat.description;
    objectifAAfficher = resultat.objectif;
  }
</script>

<details open={!repliee}>
  <summary />
  <p class="description">
    {@html descriptionAAfficher}
  </p>
  {#if objectifAAfficher}
    <dsfr-highlight text="Du texte">
      <div slot="text" class="objectif-mesure">
        {@html objectifAAfficher}
      </div>
    </dsfr-highlight>
  {/if}
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
    font-size: 1rem;
    line-height: 1.5rem;
  }

  summary:before {
    content: 'Description de la mesure';
    font-size: 1rem;
    line-height: 1.5rem;
    color: #282828;
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
    font-size: 1rem;
    line-height: 1.375rem;
    color: #000000;
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

  .description {
    max-width: 700px;
  }

  .objectif-mesure {
    color: #3a3a3a;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
  }

  dsfr-highlight {
    margin-left: -32px;
  }
</style>
