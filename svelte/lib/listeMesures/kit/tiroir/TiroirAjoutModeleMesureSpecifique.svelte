<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import Onglets from '../../../ui/Onglets.svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import ListeDeroulante from '../../../ui/ListeDeroulante.svelte';

  export const titre: string = 'Ajouter une mesure';
  export const sousTitre: string =
    'Ajoutez une mesure, associez-la aux services de votre choix et ajustez le statut ou la précision sur plusieurs services simultanément.';
  export const taille = 'large';
</script>

<ContenuTiroir>
  <Onglets
    onglets={[{ id: 'info', label: 'Informations' }]}
    ongletActif="info"
  />
  <h3>Modifier les informations de la mesure</h3>
  <div class="contenu-formulaire">
    <ChampDeSaisie
      aideSaisie="Indiquez un intitulé clair pour votre mesure"
      label="Intitulé de la mesure"
      contenu=""
    />
    <ChampDeSaisie
      aideSaisie="Apportez des précisions sur la mesure "
      label="Description de la mesure"
      contenu=""
    />
    <ListeDeroulante
      label="Catégorie"
      id="categorie"
      requis={true}
      options={[{ label: 'Gouvernance', valeur: 'gouvernance' }]}
    />
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  <lab-anssi-bouton
    variante="primaire"
    taille="md"
    titre="Ajouter cette mesure"
    icone="add-line"
    position-icone="gauche"
    on:click={() => tiroirStore.ferme()}
    actif={false}
  />
</ActionsTiroir>

<style lang="scss">
  .contenu-formulaire {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
