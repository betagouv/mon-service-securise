<script lang="ts">
  import { couleursStatutHomologation } from '../../../../ui/couleursStatutHomologation';

  interface Props {
    statutsHomologation: Record<string, { libelle: string }>;
    statutHomologation: string;
    dateExpiration: string;
  }

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
  accent={couleursStatutHomologation[statutHomologation]}
  size="md"
></dsfr-badge>
