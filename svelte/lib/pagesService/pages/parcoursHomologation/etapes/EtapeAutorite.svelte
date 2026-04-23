<script lang="ts">
  import InputDSFR from '../../contactsUtiles/InputDSFR.svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import { untrack } from 'svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
  }

  let { idService, dossier }: Props = $props();

  let autorite = $state(untrack(() => dossier.autorite));

  export const enregistre = async () => {};
</script>

<p>
  Complétez les informations sur la personne physique au sein de votre entité
  qui sera chargée de prendre la décision d'homologation de sécurité (ex: maire,
  directeur général, etc).
</p>
<InputDSFR label="Prénom Nom" bind:value={autorite.nom} />
<InputDSFR label="Fonction" bind:value={autorite.fonction} />

<style lang="scss">
</style>
