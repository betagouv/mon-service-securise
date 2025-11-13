<script lang="ts">
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import Formulaire from '../../ui/Formulaire.svelte';
  import {
    type EtatTeleversement,
    FormatAccepte,
  } from '../../ui/televersement/KitDeTeleversement.types';
  import KitDeTeleversement from '../../ui/televersement/KitDeTeleversement.svelte';
  import { ajouteParametreAUrl } from '../../outils/url';

  export const titre = 'Téléverser des services';
  export const sousTitre =
    "Importez votre liste de services, qu'ils soient homologués ou non. Vous pourrez ainsi piloter plus facilement leur sécurisation dans MonServiceSécurisé grâce au tableau de bord, centre de notifications, mails de rappels, etc...";

  let etatTeleversement: EtatTeleversement = 'EnAttente';

  const gereValidationTeleversement = async () => {
    if (etatTeleversement !== 'Valide') return;

    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement-services-v2')
    );
    ajouteParametreAUrl('rapportTeleversementV2', 'true');
    tiroirStore.ferme();
  };
</script>

<Formulaire formulaireDuTiroir>
  <ContenuTiroir>
    <KitDeTeleversement
      etape1="Téléchargez et complétez le template de vos services"
      template={{
        href: '/statique/assets/fichiers/Template services v2 - MSS.xlsx',
        nom: 'Template services 2025 - MSS.xlsx',
        titre: 'Template de services à télécharger',
        sousTitre: 'XLSX - 58 kB',
      }}
      lesLimitations={[
        'Nombre de services maximum : 250',
        'Taille maximale : 1 Mo. Format supporté : XLSX.',
      ]}
      apiPostDuTeleversement="/api/televersement/services-v2"
      formatAccepte={FormatAccepte.Excel}
      on:televersementChange={(e) => {
        etatTeleversement = e.detail;
      }}
    />
  </ContenuTiroir>

  <ActionsTiroir>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Annuler"
      variante="tertiaire-sans-bordure"
      taille="md"
      positionIcone="sans"
      actif={etatTeleversement !== 'EnCoursEnvoi'}
      on:click={() => {
        if (etatTeleversement !== 'EnCoursEnvoi') tiroirStore.ferme();
      }}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Valider le fichier"
      variante="primaire"
      taille="md"
      icone="check-line"
      positionIcone="gauche"
      actif={etatTeleversement === 'Valide'}
      on:click={gereValidationTeleversement}
    />
  </ActionsTiroir>
</Formulaire>
