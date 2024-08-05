<script lang="ts">
  import type { Section, Article, IdSection } from './blog.d';

  export let sections: Section[];
  export let articles: Article[];

  let sectionSelectionnee: IdSection = '';
  $: nomSectionSelectionnee = sections.find(
    (s) => s.id === sectionSelectionnee
  )?.nom;
  $: articlesVisibles = articles
    .filter((a) => a.url)
    .filter((a) =>
      sectionSelectionnee ? a.section.id === sectionSelectionnee : true
    );

  type DonneesSection = {
    image: string;
    couleurFond: string;
    couleurTexte: string;
  };

  const idMiseEnOeuvre: IdSection = '09d78fb4-fe9a-4f60-9dd7-91232e98d419';
  const idHomologation: IdSection = '0cef9600-977a-4817-9735-8717942a4920';
  const idUtilisation: IdSection = '8d97721b-ef75-4edf-acf2-c615793d69f0';

  const donneesSections: Record<IdSection, DonneesSection> = {
    [idMiseEnOeuvre]: {
      image: 'mise_en_oeuvre',
      couleurFond: '#e9ddff',
      couleurTexte: 'var(--violet-indice-cyber)',
    },
    [idHomologation]: {
      image: 'homologation',
      couleurFond: 'var(--fond-bleu-pale)',
      couleurTexte: 'var(--bleu-mise-en-avant)',
    },
    [idUtilisation]: {
      image: 'utilisation',
      couleurFond: '#d4f4db',
      couleurTexte: '#0c8626',
    },
  };
</script>

<div class="contenu-blog">
  <h1>Conseils Cyber</h1>
  <p>
    Tous nos conseils à propos de la mise en œuvre des mesures de sécurité, de
    l'homologation, et de l'utilisation de MonServiceSécurisé
  </p>
  <div class="titre-categories">
    <h2>Catégories</h2>
    <button
      id="reinitialise-filtre"
      on:click={() => (sectionSelectionnee = '')}
    >
      Voir tous les articles
    </button>
  </div>
  <fieldset class="filtre-sections">
    {#each sections as section (section.id)}
      <div class="section">
        <input
          type="radio"
          id={section.id}
          name="section"
          value={section.id}
          bind:group={sectionSelectionnee}
        />
        <label for={section.id}>
          <img
            src="/statique/assets/images/blog/{donneesSections[section.id]
              .image}.svg"
            alt=""
          />
          <p>{section.nom}</p>
        </label>
      </div>
    {/each}
  </fieldset>
  <h2 class="titre-conteneur-articles">
    {nomSectionSelectionnee ?? 'Tous les articles'}
  </h2>
  <div class="conteneur-articles">
    {#each articlesVisibles as article (article.id)}
      {@const donneesSection = donneesSections[article.section.id]}
      <a class="article" href={article.url}>
        <p
          class="etiquette-section"
          style="color: {donneesSection.couleurTexte}; background: {donneesSection.couleurFond}"
        >
          {article.section.nom}
        </p>
        <p class="titre-article">{article.titre}</p>
      </a>
    {/each}
  </div>
</div>

<style>
  .contenu-blog {
    text-align: left;
  }

  h1 {
    font-size: 56px;
    line-height: 52px;
    font-weight: bold;
    color: var(--bleu-survol);
    margin-top: 50px;
    margin-bottom: 40px;
  }

  p {
    font-size: 16px;
    line-height: 24px;
    max-width: 578px;
    margin-bottom: 0;
  }

  h2 {
    font-size: 36px;
    line-height: 46px;
    font-weight: bold;
    margin: 0;
  }

  .filtre-sections {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 24px;
  }

  .section {
    flex: 1;
    max-width: 384px;
    border: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 4px solid var(--bleu-mise-en-avant);
  }

  .section label {
    font-size: 20px;
    line-height: 28px;
    font-weight: bold;
    color: var(--bleu-mise-en-avant);
    display: flex;
    flex-direction: row;
    gap: 32px;
    align-items: center;
    justify-content: start;
    padding: 32px;
    cursor: pointer;
  }

  .section label p {
    margin: 0;
  }

  input[type='radio'] {
    appearance: none;
    display: none;
  }

  .section:has(input[type='radio']:checked) {
    background-color: #eff6ff;
  }

  .titre-categories {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
    margin-bottom: 32px;
    margin-top: 54px;
  }

  #reinitialise-filtre {
    background: none;
    border: none;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    text-decoration: underline;
    color: var(--bleu-mise-en-avant);
    cursor: pointer;
  }

  .article {
    padding: 24px;
    border-radius: 10px;
    border: 1px solid var(--systeme-design-etat-contour-champs);
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 232px;
  }

  .article:hover {
    box-shadow: 0px 16px 32px 0px #0000001f;
  }

  .conteneur-articles {
    display: flex;
    flex-direction: row;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 105px;
  }

  .etiquette-section {
    background: var(--fond-gris-pale);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    line-height: 20px;
    font-weight: bold;
    color: var(--texte-clair);
    width: fit-content;
    margin: 0;
  }

  .titre-article {
    margin: 0;
    font-weight: bold;
    font-size: 20px;
    line-height: 28px;
    color: var(--bleu-anssi);
  }

  h2.titre-conteneur-articles {
    margin-top: 82px;
    margin-bottom: 32px;
  }
</style>
