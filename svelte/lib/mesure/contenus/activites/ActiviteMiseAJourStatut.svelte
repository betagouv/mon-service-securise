<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/mesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';

  export let activite: ActiviteMesure;
  export let statuts: ReferentielStatut;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienStatut = <StatutMesure>details.ancienneValeur;
  const nouveauStatut = <StatutMesure>details.nouvelleValeur;
</script>

<div>
  Le statut de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été
  modifié de
  <TagStatutMesure referentielStatuts={statuts} statut={ancienStatut} />
  à
  <TagStatutMesure referentielStatuts={statuts} statut={nouveauStatut} />
</div>
