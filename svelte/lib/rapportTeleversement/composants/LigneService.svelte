<script lang="ts">
  import {
    MessagesErreur,
    type RapportService,
    type ErreurService,
  } from '../rapportTeleversement.types';
  import CelluleDonneeService from './CelluleDonneeService.svelte';
  import TagEtat from './TagEtat.svelte';
  import TooltipErreursMultiple from './TooltipErreursMultiple.svelte';

  export let service: RapportService;
  export let numeroLigne: number;

  const donneesService = service.service;
  const aUneErreur = service.erreurs.length > 0;
  const aDesErreurs = service.erreurs.length > 1;

  const contientErreur = (erreur: ErreurService) =>
    service.erreurs.includes(erreur);
</script>

<tr>
  <th scope="row"><TagEtat valide={!aUneErreur} /></th>
  <th scope="row" class="message-erreur" class:aUneErreur>
    <div class="cellule-erreur">
      {aUneErreur
        ? `${MessagesErreur[service.erreurs[0]]}${aDesErreurs ? '...' : ''}`
        : 'Aucune erreur'}
      {#if aDesErreurs}
        <TooltipErreursMultiple
          erreurs={service.erreurs.map((e) => MessagesErreur[e])}
        />
      {/if}
    </div>
  </th>
  <CelluleDonneeService contenu={numeroLigne.toString()} />
  <CelluleDonneeService
    contenu={donneesService.nom}
    enErreur={contientErreur('NOM_EXISTANT') || contientErreur('NOM_INVALIDE')}
    gras
  />
  <CelluleDonneeService
    contenu={donneesService.siret}
    enErreur={contientErreur('SIRET_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.nombreOrganisationsUtilisatrices}
    enErreur={contientErreur('NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.type}
    enErreur={contientErreur('TYPE_INVALIDE')}
    large
  />
  <CelluleDonneeService
    contenu={donneesService.provenance}
    enErreur={contientErreur('PROVENANCE_INVALIDE')}
    large
  />
  <CelluleDonneeService
    contenu={donneesService.statut}
    enErreur={contientErreur('STATUT_INVALIDE')}
    large
  />
  <CelluleDonneeService
    contenu={donneesService.localisation}
    enErreur={contientErreur('LOCALISATION_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.delaiAvantImpactCritique}
    enErreur={contientErreur('DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.dateHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DATE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.dureeHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET') ||
      contientErreur('DUREE_HOMOLOGATION_INVALIDE')}
  />
  <CelluleDonneeService
    contenu={donneesService.nomAutoriteHomologation}
    enErreur={contientErreur('DOSSIER_HOMOLOGATION_INCOMPLET')}
    large
  />
  <CelluleDonneeService
    contenu={donneesService.fonctionAutoriteHomologation}
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
    color: #3a3a3a;
  }

  th:first-of-type {
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
  }

  th:last-of-type {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  .cellule-erreur {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .message-erreur {
    min-width: 224px;
    font-weight: normal;

    &.aUneErreur {
      color: var(--erreur-texte);
    }
  }
</style>
