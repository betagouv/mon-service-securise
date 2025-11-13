<script lang="ts">
  import CelluleDonnee from '../../rapportTeleversement/composants/CelluleDonnee.svelte';
  import TagEtat from '../../rapportTeleversement/composants/TagEtat.svelte';
  import TooltipErreursMultiple from '../../rapportTeleversement/composants/TooltipErreursMultiple.svelte';
  import { dateEnFrancais } from '../../outils/date';
  import {
    type ErreurServiceV2,
    MessagesErreurV2,
    type RapportServiceV2,
  } from './rapportTeleversementServicesV2.types';

  export let ligne: RapportServiceV2;

  const donneesService = ligne.service;
  const aUneErreur = ligne.erreurs.length > 0;
  const aDesErreurs = ligne.erreurs.length > 1;

  const contientErreur = (erreur: ErreurServiceV2) =>
    ligne.erreurs.includes(erreur);
</script>

<tr>
  <th scope="row"><TagEtat valide={!aUneErreur} /></th>
  <th scope="row" class="message-erreur" class:aUneErreur>
    <div class="cellule-erreur">
      {aUneErreur
        ? `${MessagesErreurV2[ligne.erreurs[0]]}${aDesErreurs ? '...' : ''}`
        : 'Aucune erreur'}
      {#if aDesErreurs}
        <TooltipErreursMultiple
          erreurs={ligne.erreurs.map((e) => MessagesErreurV2[e])}
        />
      {/if}
    </div>
  </th>
  <CelluleDonnee contenu={ligne.numeroLigne.toString()} />
  <CelluleDonnee
    contenu={donneesService.nom}
    enErreur={contientErreur('NOM_EXISTANT') || contientErreur('NOM_INVALIDE')}
    gras
  />
  <CelluleDonnee
    contenu={donneesService.siret}
    enErreur={contientErreur('SIRET_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.statutDeploiement}
    enErreur={contientErreur('STATUT_DEPLOIEMENT_INVALIDE')}
  />
  <CelluleDonnee
    contenu={new Intl.ListFormat('fr', {
      style: 'long',
      type: 'conjunction',
    }).format(donneesService.typeService)}
    enErreur={contientErreur('TYPE_INVALIDE')}
    large
  />
  <CelluleDonnee
    contenu={donneesService.typeHebergement}
    enErreur={contientErreur('TYPE_HEBERGEMENT_INVALIDE')}
    large
  />
  <CelluleDonnee
    contenu={donneesService.ouvertureSysteme}
    enErreur={contientErreur('OUVERTURE_SYSTEME_INVALIDE')}
    large
  />
  <CelluleDonnee
    contenu={donneesService.audienceCible}
    enErreur={contientErreur('AUDIENCE_CIBLE_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.dureeDysfonctionnementAcceptable}
    enErreur={contientErreur('DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.volumetrieDonneesTraitees}
    enErreur={contientErreur('VOLUMETRIE_DONNEES_TRAITEES_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.localisationDonneesTraitees}
    enErreur={contientErreur('LOCALISATION_INVALIDE')}
  />
  <CelluleDonnee
    contenu={dateEnFrancais(donneesService.dateHomologation)}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DATE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.dureeHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DUREE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonnee
    contenu={donneesService.nomAutoriteHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET')}
    large
  />
  <CelluleDonnee
    contenu={donneesService.fonctionAutoriteHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET')}
  />
</tr>
