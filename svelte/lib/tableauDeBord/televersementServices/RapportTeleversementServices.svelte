<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import { recupereRapportDetaille } from '../../rapportTeleversement/rapportTeleversement.api';
  import { singulierPluriel } from '../../ui/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types';

  let resume: ResumeRapportTeleversement;

  onMount(async () => {
    const rapport = await recupereRapportDetaille();
    if (!rapport) return;

    const nbOK = rapport.services.filter((s) => s.erreurs.length === 0).length;
    const erreurs = rapport.services.filter((s) => s.erreurs.length > 0).length;

    const labelOK = singulierPluriel(
      '1 service valide',
      `${nbOK} services valides`,
      nbOK
    );
    const labelErreurs = singulierPluriel(
      '1 service invalide',
      `${erreurs} services invalides`,
      erreurs
    );

    resume = {
      elementsValide: { label: labelOK },
      elementsErreur: erreurs ? { label: labelErreurs } : null,
    };
  });
</script>

<RapportTeleversementGenerique
  titreDuRapport="Rapport du téléversement des services"
  {resume}
/>
