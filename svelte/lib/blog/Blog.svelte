<script lang="ts">
  import type { Section } from './blog.d';

  export let sections: Section[];
  let sectionSelectionnee: string = '';
  const donneesSections: Record<string, string> = {
    '09d78fb4-fe9a-4f60-9dd7-91232e98d419': 'mise_en_oeuvre',
    '0cef9600-977a-4817-9735-8717942a4920': 'homologation',
    '8d97721b-ef75-4edf-acf2-c615793d69f0': 'utilisation',
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
    <button id="reinitialise-filtre" on:click={() => (sectionSelectionnee = '')}
      >Voir tous les articles</button
    >
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
            src="/statique/assets/images/blog/{donneesSections[section.id]}.svg"
            alt=""
          />
          <p>{section.nom}</p>
        </label>
      </div>
    {/each}
  </fieldset>
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
</style>
