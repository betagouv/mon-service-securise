<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';
  import type {
    ReferentielPriorite,
    ReferentielStatut,
    ResumeNiveauDroit,
  } from '../../../ui/types';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';
  import Initiales from '../../../ui/Initiales.svelte';
  import { storeAutorisations } from '../../../gestionContributeurs/stores/autorisations.store';
  import { formatteDateHeureFr } from '../../../formatDate/formatDate';
  import { obtientVisualisation } from './visualisation';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;
  export let statuts: ReferentielStatut;

  const visualisation = obtientVisualisation(activite);

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
  const proprietes: {
    activite: ActiviteMesure;
    statuts?: ReferentielStatut;
    priorites?: ReferentielPriorite;
  } = {
    activite,
  };
  if (visualisation.aBesoinPriorites) {
    proprietes.priorites = priorites;
  }
  if (visualisation.aBesoinStatuts) {
    proprietes.statuts = statuts;
  }
</script>

<div class="activite">
  <div>
    <div class="cartouche">
      <Initiales
        valeur={acteur.initiales}
        resumeNiveauDroit={acteur.resumeNiveauDroit}
      />
    </div>
  </div>
  <div class="contenu">
    <div class="titre">{visualisation.titre}</div>
    <div class="infos">
      <span>{acteur.intitule}</span> &bull;
      <span>{formatteDateHeureFr(activite.date)}</span>
    </div>
    <div class="description">
      <svelte:component this={visualisation.composantContenu} {...proprietes} />
    </div>
  </div>
</div>

<style>
  .cartouche {
    display: flex;
    flex-direction: column;
    height: calc(100% + 12px);
  }

  .activite:not(:last-child) .cartouche:after {
    content: '';
    border-left: solid 1px #eff6ff;
    transform: translateX(50%) translateY(4px);
    height: 100%;
  }

  .activite {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  .contenu {
    display: flex;
    flex-direction: column;
  }

  .description {
    line-height: 18px;
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
