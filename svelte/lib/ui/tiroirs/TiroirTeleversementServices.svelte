<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';

  export const titre = 'Téléverser des services';
  export const sousTitre =
    "Importez votre liste de services, qu'ils soient homologués ou non. Vous pourrez ainsi piloter plus facilement leur sécurisation dans MonServiceSécurisé grâce au tableau de bord, centre de notifications, mails de rappels, etc...";

  let enCoursEnvoi = false;
</script>

<Formulaire formulaireDuTiroir>
  <ContenuTiroir>
    <div>
      <h3>1. Téléchargez et complétez le template de vos services</h3>
      <a
        href="/statique/assets/fichiers/Template services - MSS.xlsx"
        download="Template services - MSS.xlsx"
        >Template de services à télécharger</a
      >
      <p>XLSX - 50,3 kB</p>
    </div>
    <div>
      <h3>2. Importez le template</h3>
    </div>
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      actif={enCoursEnvoi}
      on:click={() => {
        if (!enCoursEnvoi) tiroirStore.ferme();
      }}
    />
    <Bouton
      titre="Valider le fichier"
      type="primaire"
      boutonSoumission
      {enCoursEnvoi}
    />
  </ActionsTiroir>
</Formulaire>

<style lang="scss">
  h3 {
    margin: 0 0 24px;
  }

  a {
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--bleu-mise-en-avant);
    width: fit-content;

    &:after {
      content: '';
      background: url(/statique/assets/images/icone_telecharger.svg);
      width: 16px;
      height: 16px;
      display: flex;
    }
  }

  p {
    margin: 4px 0 0;
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: var(--texte-gris);
  }
</style>
