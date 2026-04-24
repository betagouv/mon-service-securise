<script lang="ts">
  import Explication from '../kit/Explication.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import type { EcheancesRenouvellementHomologation } from '../../../pagesService.d';
  import { dateEnFrancais } from '../../../../outils/date';
  import * as api from '../parcoursHomologation.api';

  interface Props {
    idService: string;
    dossier: Dossier;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
  }

  let { idService, dossier, echeancesRenouvellement }: Props = $props();

  let estRefusee = $derived(dossier.decision.refusee === true);
  let dateHomologation = $derived(
    dateEnFrancais(dossier.decision.dateHomologation)
  );
  let dureeValidite = $derived(
    dossier.decision.dureeValidite
      ? (echeancesRenouvellement[dossier.decision.dureeValidite]?.description ??
          '')
      : ''
  );

  export const enregistre = async () => {
    await api.enregistrement(idService).finalise();
  };
</script>

{#if estRefusee}
  <Explication>
    La décision d'homologation de sécurité a été prise le
    <b>{dateHomologation}</b>.
    <br />
    L'homologation de sécurité a été <b>refusée</b>.<br />
    <br />
    En cliquant sur « Enregistrer la décision », vous confirmez l'exactitude des informations
    renseignées conformément au document « Décision d'homologation de sécurité ».
  </Explication>
{:else}
  <Explication>
    La décision d'homologation de sécurité a été prise le
    <b>{dateHomologation}</b>
    pour une durée de <b>{dureeValidite}</b>.<br />
    <br />
    En cliquant sur « Enregistrer la décision », vous confirmez l'exactitude des informations
    renseignées conformément au document « Décision d'homologation de sécurité ».
  </Explication>
{/if}
