<script lang="ts">
  import Explication from '../kit/Explication.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import { dateEnFrancaisLongue } from '../../../../outils/date';
  import * as api from '../parcoursHomologation.api';

  interface Props {
    idService: string;
    dossier: Dossier;
    peutHomologuer: boolean;
  }

  let { idService, dossier, peutHomologuer }: Props = $props();

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

<div class="etape">
  {#if peutHomologuer}
    <Explication>
      Voici les étapes à suivre pour finaliser l'homologation de sécurité de
      votre service :
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
        Se reconnecter ensuite pour renseigner la date de signature et la durée
        de validité de l'homologation dans les dernières étapes Date et
        Récapitulatif.
      </li>
    </ul>
  {:else}
    <Explication>
      Le PDF de la décision d'homologation de sécurité est disponible pour le(s)
      propriétaire(s) du service. <br /><br />
      Une fois signée par l'autorité d'homologation, le statut et la durée d'homologation
      pour ce service apparaîtront dans la liste des homologations et sur votre tableau
      de bord.
    </Explication>
  {/if}
</div>

<style lang="scss">
  .etape {
    width: var(--parcours-homologation-largeur-formulaire);

    .consignes {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #3a3a3a;

      li {
        margin-bottom: 1rem;
      }
    }

    dsfr-tile {
      margin-bottom: 2.5rem;
      width: 400px;
    }
  }
</style>
