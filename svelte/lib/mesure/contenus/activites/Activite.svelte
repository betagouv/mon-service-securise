<script lang="ts">
  import ActiviteAjoutPriorite from './ActiviteAjoutPriorite.svelte';
  import type { ActiviteMesure } from '../../mesure.d';
  import type { ReferentielPriorite } from '../../../ui/types';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';
  import Initiales from '../../../ui/Initiales.svelte';
  import { storeAutorisations } from '../../../gestionContributeurs/stores/autorisations.store';
  import { formatteDateHeureFr } from '../../../formatDate/formatDate';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  const titre = 'Priorité';

  $: autorisation = $storeAutorisations.autorisations[activite.idActeur];

  let acteur: { prenomNom: string; initiales: string };
  let intituleActeur: string;

  $: {
    const contributeursTrouves = $contributeurs.filter(
      (c) => c.id === activite.idActeur
    );
    acteur =
      contributeursTrouves.length === 0
        ? { prenomNom: 'Utilisateur·rice', initiales: '' }
        : contributeursTrouves[0];
    intituleActeur = acteur.prenomNom;
  }
</script>

<div class="activite">
  <div>
    <Initiales
      valeur={acteur.initiales}
      resumeNiveauDroit={autorisation?.resumeNiveauDroit}
    />
  </div>
  <div class="contenu">
    <div class="titre">{titre}</div>
    <div class="infos">
      <span>{intituleActeur}</span> &bull;
      <span>{formatteDateHeureFr(activite.date)}</span>
    </div>
    <div>
      <ActiviteAjoutPriorite {activite} {priorites} />
    </div>
  </div>
</div>

<style>
  .activite {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  .contenu {
    display: flex;
    flex-direction: column;
  }

  .titre {
    font-weight: bold;
    font-size: 14px;
    color: var(--texte-fonce);
  }

  .infos {
    font-size: 12px;
    color: var(--texte-clair);
    margin-bottom: 4px;
  }
</style>
