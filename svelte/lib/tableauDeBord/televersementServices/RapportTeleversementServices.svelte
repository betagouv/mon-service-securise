<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import { recupereRapportDetaille } from '../../rapportTeleversement/rapportTeleversement.api';
  import { singulierPluriel } from '../../ui/string';

  let resume: { elementsValide: { label: string } };

  onMount(async () => {
    const rapport = await recupereRapportDetaille();
    if (!rapport) return;

    const nbOk = rapport?.services.filter((s) => s.erreurs.length === 0).length;

    resume = {
      elementsValide: {
        label: singulierPluriel(
          '1 service valide',
          `${nbOk} services valides`,
          nbOk
        ),
      },
    };
  });
</script>

<RapportTeleversementGenerique
  titreDuRapport="Rapport du téléversement des services"
  {resume}
/>
