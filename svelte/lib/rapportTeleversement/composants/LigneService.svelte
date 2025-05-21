<script lang="ts">
  import {
    MessagesErreur,
    type RapportService,
    type ErreurService,
  } from '../rapportTeleversement.d';
  import CelluleDonneeService from './CelluleDonneeService.svelte';
  import TagEtat from './TagEtat.svelte';

  export let service: RapportService;
  export let numeroLigne: number;

  const donneesService = service.service;
  const aUneErreur = service.erreurs.length > 0;

  const contientErreur = (erreur: ErreurService) =>
    service.erreurs.includes(erreur);
</script>

<tr>
  <th scope="row"><TagEtat valide={!aUneErreur} /></th>
  <th scope="row" class="message-erreur" class:aUneErreur
    >{aUneErreur ? MessagesErreur[service.erreurs[0]] : 'Aucune erreur'}</th
  >
  <CelluleDonneeService donnee={numeroLigne.toString()} />
  <CelluleDonneeService
    donnee={donneesService.nom}
    enErreur={contientErreur('NOM_EXISTANT') || contientErreur('NOM_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.siret}
    enErreur={contientErreur('SIRET_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.type}
    enErreur={contientErreur('TYPE_INVALIDE')}
    large
  />
  <CelluleDonneeService
    donnee={donneesService.provenance}
    enErreur={contientErreur('PROVENANCE_INVALIDE')}
    large
  />
  <CelluleDonneeService
    donnee={donneesService.statut}
    enErreur={contientErreur('STATUT_INVALIDE')}
    large
  />
  <CelluleDonneeService
    donnee={donneesService.localisation}
    enErreur={contientErreur('LOCALISATION_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.delaiAvantImpactCritique}
    enErreur={contientErreur('DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.dateHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DATE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.dureeHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DUREE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonneeService
    donnee={donneesService.nomAutoriteHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET')}
    large
  />
  <CelluleDonneeService
    donnee={donneesService.fonctionAutoriteHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET')}
    dernier
  />
</tr>

<style lang="scss">
  th[scope='row'] {
    padding: 8px 16px;
    max-width: 280px;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.5rem;
    background: var(--fond-pale);
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
  }

  th:first-of-type {
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
  }

  th:last-of-type {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  .message-erreur {
    min-width: 224px;
    font-weight: normal;

    &.aUneErreur {
      color: var(--erreur-texte);
    }
  }
</style>
