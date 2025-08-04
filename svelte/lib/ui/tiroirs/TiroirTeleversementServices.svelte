<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';
  import {
    type EtatTeleversement,
    FormatAccepte,
  } from '../televersement/KitDeTeleversement.types';
  import KitDeTeleversement from '../televersement/KitDeTeleversement.svelte';

  export const titre = 'Téléverser des services';
  export const sousTitre =
    "Importez votre liste de services, qu'ils soient homologués ou non. Vous pourrez ainsi piloter plus facilement leur sécurisation dans MonServiceSécurisé grâce au tableau de bord, centre de notifications, mails de rappels, etc...";

  let etatTeleversement: EtatTeleversement = 'EnAttente';

  const gereValidationTeleversement = async () => {
    if (etatTeleversement !== 'Valide') return;

    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement')
    );
    const url = new URL(window.location.href);
    url.searchParams.append('rapportTeleversement', 'true');
    window.history.replaceState({}, '', url);
    tiroirStore.ferme();
  };
</script>

<Formulaire formulaireDuTiroir>
  <ContenuTiroir>
    <KitDeTeleversement
      etape1="Téléchargez et complétez le template de vos services"
      template={{
        href: '/statique/assets/fichiers/Template services - MSS.xlsx',
        nom: 'Template services - MSS.xlsx',
        titre: 'Template de services à télécharger',
        sousTitre: 'XLSX - 50,3 kB',
      }}
      lesLimitations={[
        'Nombre de services maximum : 250',
        'Taille maximale : 1 Mo. Format supporté : XLSX.',
      ]}
      apiPostDuTeleversement="/api/televersement/services"
      formatAccepte={FormatAccepte.Excel}
      on:televersementChange={(e) => {
        etatTeleversement = e.detail;
      }}
    />
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      actif={etatTeleversement !== 'EnCoursEnvoi'}
      on:click={() => {
        if (etatTeleversement !== 'EnCoursEnvoi') tiroirStore.ferme();
      }}
    />
    <Bouton
      titre="Valider le fichier"
      type="primaire"
      boutonSoumission
      enCoursEnvoi={etatTeleversement === 'EnCoursEnvoi'}
      actif={etatTeleversement === 'Valide'}
      on:click={gereValidationTeleversement}
    />
  </ActionsTiroir>
</Formulaire>
