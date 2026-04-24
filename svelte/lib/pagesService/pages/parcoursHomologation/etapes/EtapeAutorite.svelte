<script lang="ts">
  import { untrack } from 'svelte';
  import InputDSFR from '../../../../ui/InputDSFR.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import * as api from '../parcoursHomologation.api';
  import Explication from '../kit/Explication.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
  }

  let { idService, dossier }: Props = $props();

  let autorite = $state(untrack(() => dossier.autorite));

  export const enregistre = async () => {
    await api.enregistrement(idService).autorite(autorite);
  };
</script>

<Explication>
  Complétez les informations sur la personne physique au sein de votre entité
  qui sera chargée de prendre la décision d'homologation de sécurité (ex: maire,
  directeur général, etc).
</Explication>

<div class="champs">
  <InputDSFR label="Prénom Nom" bind:value={autorite.nom} />
  <InputDSFR label="Fonction" bind:value={autorite.fonction} />
</div>

<style lang="scss">
  .champs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
