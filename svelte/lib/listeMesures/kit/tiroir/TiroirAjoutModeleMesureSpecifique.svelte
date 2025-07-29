<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import Onglets from '../../../ui/Onglets.svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import ListeDeroulante from '../../../ui/ListeDeroulante.svelte';
  import { ajouteModeleMesureSpecifique } from '../../listeMesures.api';
  import { modelesMesureSpecifique } from '../../stores/modelesMesureSpecifique.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import type { ListeMesuresProps } from '../../listeMesures.d';

  export let categories: ListeMesuresProps['categories'];
  export const titre: string = 'Ajouter une mesure';
  export const sousTitre: string =
    'Ajoutez une mesure, associez-la aux services de votre choix et ajustez le statut ou la précision sur plusieurs services simultanément.';
  export const taille = 'large';

  let donneesModeleMesureAjoute = {
    description: '',
    descriptionLongue: '',
    categorie: '',
  };
  let enCoursDenvoi = false;

  $: formulaireValide =
    !!donneesModeleMesureAjoute.description &&
    !!donneesModeleMesureAjoute.categorie;

  const ajouteModele = async () => {
    enCoursDenvoi = true;
    try {
      await ajouteModeleMesureSpecifique(donneesModeleMesureAjoute);
      await modelesMesureSpecifique.rafraichis();
      tiroirStore.ferme();
    } catch (e) {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };
</script>

<ContenuTiroir>
  <Onglets
    onglets={[{ id: 'info', label: 'Informations' }]}
    ongletActif="info"
  />
  <h3>Modifier les informations de la mesure</h3>
  <div class="contenu-formulaire">
    <div class="info-champ-obligatoire">Champ obligatoire</div>
    <div class="champs-de-saisie">
      <ChampDeSaisie
        bind:contenu={donneesModeleMesureAjoute.description}
        aideSaisie="Indiquez un intitulé clair pour votre mesure"
        label="Intitulé de la mesure"
        requis
      />
      <ChampDeSaisie
        aideSaisie="Apportez des précisions sur la mesure"
        label="Description de la mesure"
        bind:contenu={donneesModeleMesureAjoute.descriptionLongue}
      />
      <ListeDeroulante
        label="Catégorie"
        id="categorie"
        requis={true}
        options={categories.map(({ id, label }) => ({ label, valeur: id }))}
        bind:valeur={donneesModeleMesureAjoute.categorie}
      />
    </div>
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="primaire"
    taille="md"
    titre="Ajouter cette mesure"
    icone="add-line"
    position-icone="gauche"
    on:click={async () => await ajouteModele()}
    actif={formulaireValide && !enCoursDenvoi}
  />
</ActionsTiroir>

<style lang="scss">
  h3 {
    margin: 2px 0 0 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .contenu-formulaire {
    display: flex;
    gap: 16px;
    flex-direction: column;

    .info-champ-obligatoire {
      text-align: right;
      font-size: 0.875rem;
      width: 700px;

      &:before {
        content: '*';
        color: var(--erreur-texte);
        margin-right: 4px;
        font-size: 1rem;
      }
    }

    .champs-de-saisie {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }
</style>
