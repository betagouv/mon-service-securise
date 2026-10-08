<script lang="ts">
  import Toaster from '../ui/Toaster.svelte';
  import { api } from './groupes.api';
  import type { Groupe } from './groupes.d';
  import OngletGroupes from './OngletGroupes.svelte';
  import { singulierPluriel } from '../outils/string';
  import { services } from '../tableauDeBord/stores/services.store';
  import type { ReponseApiServices } from '../tableauDeBord/tableauDeBord.d';

  const chargeServices = async () => {
    const reponse = await axios.get<ReponseApiServices>('/api/services');
    services.reinitialise(reponse.data.services);
  };

  const lienServicesDuGroupe = (groupe: Groupe) => {
    const nombreServices = groupe.idServicesAssocies.filter((id) =>
      $services.some((s) => s.id === id)
    ).length;
    return {
      label: `${nombreServices} ${singulierPluriel('service', 'services', nombreServices)}`,
      title: `Voir les services du groupe ${groupe.libelle} sur le tableau de bord`,
      href: `/tableauDeBord?idGroupe=${groupe.id}`,
    };
  };
</script>

<h1>Mes groupes</h1>

<OngletGroupes
  identifiant="services"
  {api}
  textes={{
    introduction:
      'Organisez vos services en groupes pour faciliter leur classement et leur gestion.',
    exempleLibelle: 'exemple : Enfance et famille',
    aucunGroupe:
      'Saisissez un nom ci-dessus puis cliquez sur « Créer le groupe ». Vous pourrez ensuite y classer vos services depuis le tableau de bord.',
    explicationListe:
      'Un service peut appartenir à plusieurs groupes : la somme des colonnes « Services » peut donc dépasser le nombre total de services enregistrés. Pour classer un service dans un groupe, rendez-vous sur le tableau de bord.',
    colonneElements: 'Services',
  }}
  chargeElements={chargeServices}
  lienElements={lienServicesDuGroupe}
/>

<Toaster />

<style lang="scss">
  :global(main:has(#conteneur-groupes)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-groupes) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 0;
  }
</style>
