<script lang="ts">
  interface Props {
    statutsHomologation: Record<string, { libelle: string }>;
    statutHomologation: string;
    dateExpiration: string;
  }

  const couleurStatut: Record<string, string> = {
    expiree: 'orange-terre-battue',
    bientotExpiree: 'yellow-tournesol',
    nonRealisee: 'beige-gris-galet',
    activee: 'green-emeraude',
    refusee: 'pink-tuile',
  };

  let { statutsHomologation, statutHomologation, dateExpiration }: Props =
    $props();

  const libelle = (statut: string) => {
    const libelleStatut = statutsHomologation[statut].libelle;
    return statut === 'bientotExpiree'
      ? `${libelleStatut} ${dateExpiration}`
      : libelleStatut;
  };
</script>

<dsfr-badge
  label={libelle(statutHomologation)}
  type="accent"
  accent={couleurStatut[statutHomologation]}
  size="md"
></dsfr-badge>
