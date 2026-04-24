<script lang="ts">
  import Explication from '../kit/Explication.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import { dateEnFrancaisLongue } from '../../../../outils/date';
  import * as api from '../parcoursHomologation.api';

  interface Props {
    idService: string;
    dossier: Dossier;
  }

  let { idService, dossier }: Props = $props();

  const commandesTelechargement = {
    declenche: async () => {
      await api.enregistrement(idService).telechargement();
      document.dispatchEvent(new CustomEvent('homologation-modifiee'));
    },
  };

  let dateTelechargement = $derived(dossier.dateTelechargement?.date);

  // Rien à faire dans `enregistre()`aa : tout se passe au déclenchement du téléchargement
  export const enregistre = async () => {};
</script>

<Explication>
  Voici les étapes à suivre pour finaliser l'homologation de sécurité de votre
  service :
</Explication>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<dsfr-tile
  title="MonServiceSécurisé - Dossier d'homologation"
  details={dateTelechargement
    ? `Dernier téléchargement le : ${dateEnFrancaisLongue(dateTelechargement)}`
    : 'Pas encore téléchargé'}
  onclick={commandesTelechargement.declenche}
  action-markup="a"
  href={`/api/service/${idService}/pdf/documentsHomologation.zip`}
  enlarge
  no-link
  blank
  download
></dsfr-tile>

<ul class="consignes">
  <li>
    Télécharger le fichier .ZIP contenant les 3 PDF : synthèse de sécurité,
    annexes et décision d'homologation de sécurité.
  </li>
  <li>
    Présenter, pour signature, la décision d'homologation de sécurité à
    l'autorité d'homologation ainsi que la synthèse de la sécurité.
  </li>
  <li>
    Se reconnecter ensuite pour renseigner la date de signature et la durée de
    validité de l'homologation dans les dernières étapes Date et Récapitulatif.
  </li>
</ul>

<style lang="scss">
  .consignes {
    font-size: 1rem;
    line-height: 1.5rem;
    color: #3a3a3a;
    max-width: 894px;

    li {
      margin-bottom: 1rem;
    }
  }

  dsfr-tile {
    margin-bottom: 2.5rem;
    width: 400px;
  }
</style>
