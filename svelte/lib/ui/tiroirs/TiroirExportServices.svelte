<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import Lien from '../Lien.svelte';
  import type { Service } from '../../tableauDeBord/tableauDeBord.d';

  export let services: Service[];
  export const titre = 'Exporter la sélection';
  export const sousTitre =
    services.length > 1
      ? 'Télécharger la liste des services sélectionnés dans le tableau de bord.'
      : 'Télécharger les données du service sélectionné dans le tableau de bord.';

  const queryString = new URLSearchParams();
  services.forEach((service) => queryString.append('idsServices', service.id));
  queryString.append('timestamp', Date.now().toString());

  const formatDateCourt = Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const maintenant = new Date();
  const nomFichierCsv = `MSS_services_${formatDateCourt
    .format(maintenant)
    .replaceAll('-', '')}.csv`;
</script>

<ContenuTiroir>
  <ul class="liste-fichiers">
    <li class="fichier">
      <div class="nom-document">
        <p>{nomFichierCsv}</p>
      </div>
      <Lien href="/api/services/export.csv?{queryString}" titre="Télécharger" />
    </li>
  </ul>
</ContenuTiroir>

<style>
  .liste-fichiers {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .fichier {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 16px;
    border: 1px solid var(--liseres-fonce);
    border-radius: 8px;
    font-weight: 500;
  }

  .nom-document p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nom-document p::before {
    content: '';
    width: 44px;
    height: 44px;
    background-image: url('/statique/assets/images/icone_telechargement_csv.svg');
    background-repeat: no-repeat;
    background-size: contain;
  }
</style>
