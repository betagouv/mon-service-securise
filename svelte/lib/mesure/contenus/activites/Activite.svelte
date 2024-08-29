<script lang="ts">
  import ActiviteAjoutPriorite from './ActiviteAjoutPriorite.svelte';
  import type { ActiviteMesure } from '../../mesure.d';
  import type { ReferentielPriorite } from '../../../ui/types';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  const titre = 'Priorité';

  let acteur: { prenomNom: string };
  let intituleActeur: string;

  $: {
    const contributeursTrouves = $contributeurs.filter(
      (c) => c.id === activite.idActeur
    );
    acteur =
      contributeursTrouves.length === 0
        ? { prenomNom: 'Utilisateur·rice' }
        : contributeursTrouves[0];
    intituleActeur = acteur.prenomNom;
  }
</script>

<div>
  <div>MG</div>
  <div>
    <div>{titre}</div>
    <div>
      <span>{intituleActeur}</span> &bull; <span>15 sept. 2024 à 13:20</span>
    </div>
    <div>
      <ActiviteAjoutPriorite {activite} {priorites} />
    </div>
  </div>
</div>
