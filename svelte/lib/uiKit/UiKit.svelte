<script lang="ts">
  import ListeDeroulante from '../ui/ListeDeroulante.svelte';
  import { onMount } from 'svelte';
  import FilAriane from '../ui/FilAriane.svelte';
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';

  const optionsListeDeroulante = [
    { label: 'Option 1', valeur: 1 },
    { label: 'Option 2', valeur: 2 },
    { label: 'Option 3', valeur: 3 },
    { label: 'Option 4', valeur: 4 },
  ];
  let desactiveListeDeroulante = false,
    descriptionListeDeroulante = false,
    avecErreurListeDeroulante = false,
    tailleBarreRecherche = false;

  const declencheValidation = async (id: string) => {
    (document.getElementById(id) as HTMLInputElement)?.reportValidity();
  };

  let entreesMenu: { titre: string; id: string }[] = [];
  onMount(() => {
    const titresComposants = document.querySelectorAll('h2');
    titresComposants.forEach((element: HTMLHeadingElement) => {
      const titre = element.innerText;
      const id = titre.toLowerCase().replaceAll(/[^a-z]/g, '');
      element.id = id;
      entreesMenu = [...entreesMenu, { titre, id }];
    });
  });
</script>

<ul class="menu-navigation-ui-kit">
  <h3>Liste des composants</h3>
  {#each entreesMenu as entree}
    <li>
      <a href="#{entree.id}">{entree.titre}</a>
    </li>
  {/each}
</ul>
<div class="conteneur">
  <h1>Système de Design de MonServiceSécurisé</h1>

  <h2>Barre de recherche - Search</h2>
  <p>
    La barre de recherche est un système de navigation qui permet à
    l'utilisateur d’accéder rapidement à un contenu en lançant une recherche sur
    un mot clé ou une expression.
  </p>
  <div class="conteneur-composant">
    <BarreDeRecherche
      recherche=""
      taille={tailleBarreRecherche ? 'grand' : 'moyen'}
    />
    <div class="options-composant">
      <h3>Options du composant</h3>
      <div>
        <input
          type="checkbox"
          id="barre-recherche-taille"
          bind:checked={tailleBarreRecherche}
        />
        <label for="barre-recherche-taille"
          >{tailleBarreRecherche
            ? 'Grande taille'
            : 'Taille moyenne (défault)'}</label
        >
      </div>
    </div>
  </div>

  <h2>Fil d'Ariane - Breadcrumb</h2>
  <p>
    Le fil d’Ariane est un système de navigation secondaire qui permet à
    l’utilisateur de se situer sur le site qu’il consulte.
  </p>
  <p>
    Le fil d’Ariane donne des informations sur l’architecture du site. Il
    indique à l’utilisateur sa position courante et lui permet de se repérer
    dans l’arborescence du site. Le fil d’Ariane est présent sur l’ensemble des
    pages à l’exception de la page d'accueil. Sa position dans la page doit
    toujours être la même, de préférence entre le header et le contenu principal
    de la page. L’ensemble de ses éléments sont cliquables, à l’exception de la
    page consultée.
  </p>
  <div class="conteneur-composant">
    <FilAriane
      items={[
        { label: 'Accueil', lien: '/' },
        { label: 'Page N2', lien: '/' },
        { label: 'Page N3', lien: '/' },
        { label: 'Page en cours' },
      ]}
    />
  </div>

  <h2>Liste déroulante - Select</h2>
  <p>
    La liste déroulante permet à un utilisateur de choisir un élément dans une
    liste donnée.
  </p>
  <p>
    Elle fournit une liste d’option parmi laquelle l’utilisateur peut choisir.
    Seule la partie visible du composant est stylisé : la liste d’option
    déroulée conserve le style du navigateur.
  </p>
  <div class="conteneur-composant">
    {#key avecErreurListeDeroulante}
      <ListeDeroulante
        id="liste-deroulante"
        label="Libellé"
        options={optionsListeDeroulante}
        desactive={desactiveListeDeroulante}
        texteDescriptionAdditionnel={descriptionListeDeroulante
          ? 'Texte de description additionnel'
          : ''}
        requis={avecErreurListeDeroulante}
        messageErreur={avecErreurListeDeroulante
          ? 'Texte d’erreur obligatoire'
          : ''}
        messageValide={avecErreurListeDeroulante
          ? 'Texte de validation optionnel'
          : ''}
      />
    {/key}
    <div class="options-composant">
      <h3>Options du composant</h3>
      <div>
        <input
          type="checkbox"
          id="liste-deroulante-desactive"
          bind:checked={desactiveListeDeroulante}
        />
        <label for="liste-deroulante-desactive">Désactivé</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="liste-deroulante-description"
          bind:checked={descriptionListeDeroulante}
        />
        <label for="liste-deroulante-description">Avec description</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="liste-deroulante-erreur"
          bind:checked={avecErreurListeDeroulante}
          on:change={() => declencheValidation('liste-deroulante')}
        />
        <label for="liste-deroulante-erreur"
          >Avec message d'erreur / de validation</label
        >
      </div>
    </div>
  </div>
</div>

<style>
  :global(#ui-kit) {
    text-align: left;
    background: white;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 32px;
    padding: 0 32px;
  }

  .conteneur {
    padding-bottom: 64px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .conteneur-composant {
    padding: 32px 0;
    border-top: 1px solid #dddddd;
  }

  .options-composant {
    margin-top: 16px;
    padding: 8px 0;
  }

  ul {
    margin-top: 32px;
    padding: 0;
    list-style: none;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: sticky;
    top: 32px;
    height: fit-content;
  }

  ul h3 {
    margin: 0;
  }

  ul li a {
    color: var(--texte-fonce);
  }
</style>
