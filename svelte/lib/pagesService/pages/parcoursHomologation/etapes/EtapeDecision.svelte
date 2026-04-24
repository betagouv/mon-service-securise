<script lang="ts">
  import { untrack } from 'svelte';
  import Explication from '../kit/Explication.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import type { EcheancesRenouvellementHomologation } from '../../../pagesService.d';
  import * as api from '../parcoursHomologation.api';
  import InputDSFR from '../../../../ui/InputDSFR.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
  }

  let { idService, dossier, echeancesRenouvellement }: Props = $props();

  let dateHomologation = $state(
    untrack(() => dossier.decision.dateHomologation ?? '')
  );
  let validee = $state(untrack(() => dossier.decision.refusee !== true));
  let dureeValidite = $state(
    untrack(() => dossier.decision.dureeValidite ?? undefined)
  );

  const commandesDecision = {
    updateValidee: (e: { detail: boolean }) => {
      validee = e.detail;
      if (!validee) dureeValidite = undefined;
    },
    updateDureeValidite: (e: { detail: string }) => {
      dureeValidite = e.detail;
    },
  };

  export const enregistre = async () => {
    await api
      .enregistrement(idService)
      .decision({ dateHomologation, refusee: !validee, dureeValidite });
  };
</script>

<div class="etape">
  <Explication>
    Saisissez les informations remplies par l'autorité d'homologation sur le
    document <strong>Décision de l'homologation de sécurité</strong>.
  </Explication>

  <div class="champs">
    <InputDSFR
      label="Date de la commission d'homologation"
      type="date"
      id="date-homologation"
      bind:value={dateHomologation}
    />

    <dsfr-radios-group
      legend="Validation de l'homologation"
      onvaluechanged={commandesDecision.updateValidee}
      radios={[
        { label: 'Oui', id: 'validee-oui', value: true },
        { label: 'Non', id: 'validee-non', value: false },
      ]}
      value={validee}
    ></dsfr-radios-group>

    {#if validee}
      <dsfr-radios-group
        legend="Durée de validité de l'homologation"
        onvaluechanged={commandesDecision.updateDureeValidite}
        radios={Object.entries(echeancesRenouvellement).map(
          ([cle, valeur]) => ({
            id: `duree-${cle}`,
            label: valeur.description,
            value: cle,
          })
        )}
        value={dureeValidite}
      ></dsfr-radios-group>
    {/if}
  </div>
</div>

<style lang="scss">
  .etape {
    width: var(--parcours-homologation-largeur-formulaire);

    .champs {
      display: flex;
      flex-direction: column;
      margin-top: 1.5rem;
      gap: 1.5rem;
    }
  }
</style>
