<script lang="ts">
  import ActiviteAjoutPriorite from './ActiviteAjoutPriorite.svelte';
  import type { ActiviteMesure } from '../../mesure.d';
  import type {
    ReferentielPriorite,
    ResumeNiveauDroit,
  } from '../../../ui/types';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';
  import Initiales from '../../../ui/Initiales.svelte';
  import { storeAutorisations } from '../../../gestionContributeurs/stores/autorisations.store';
  import { formatteDateHeureFr } from '../../../formatDate/formatDate';
  import ActiviteMiseAJourPriorite from './ActiviteMiseAJourPriorite.svelte';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  let titre: string;
  let composantContenu: any;
  if (activite.type === 'ajoutPriorite') {
    titre = 'Priorité';
    composantContenu = ActiviteAjoutPriorite;
  } else {
    titre = 'Modification de la priorité';
    composantContenu = ActiviteMiseAJourPriorite;
  }

  type Acteur = {
    intitule: string;
    initiales: string;
    resumeNiveauDroit?: ResumeNiveauDroit;
  };
  let acteur: Acteur;

  $: {
    const contributeursTrouves = $contributeurs.filter(
      (c) => c.id === activite.idActeur
    );
    acteur =
      contributeursTrouves.length === 0
        ? {
            intitule: 'Utilisateur·rice',
            initiales: '',
          }
        : {
            ...contributeursTrouves[0],
            intitule: contributeursTrouves[0].prenomNom,
            resumeNiveauDroit:
              $storeAutorisations.autorisations[activite.idActeur]
                ?.resumeNiveauDroit,
          };
  }
</script>

<div class="activite">
  <div>
    <Initiales
      valeur={acteur.initiales}
      resumeNiveauDroit={acteur.resumeNiveauDroit}
    />
  </div>
  <div class="contenu">
    <div class="titre">{titre}</div>
    <div class="infos">
      <span>{acteur.intitule}</span> &bull;
      <span>{formatteDateHeureFr(activite.date)}</span>
    </div>
    <div>
      <svelte:component this={composantContenu} {activite} {priorites} />
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
