<script lang="ts">
  import type {
    ErreurModele,
    ModeleTeleverse,
  } from './rapportTeleversementModelesMesureSpecifique.types';
  import TagEtat from '../../rapportTeleversement/composants/TagEtat.svelte';
  import CelluleDonnee from '../../rapportTeleversement/composants/CelluleDonnee.svelte';
  import { decode } from 'html-entities';

  export let ligne: ModeleTeleverse;

  const aUneErreur = ligne.erreurs.length > 0;

  const contientErreur = (erreur: ErreurModele) =>
    ligne.erreurs.includes(erreur);
</script>

<tr>
  <th scope="row"><TagEtat valide={!aUneErreur} /></th>
  <th scope="row" class="message-erreur" class:aUneErreur>
    <div class="cellule-erreur">TODO DETAIL ERREUR</div>
  </th>
  <CelluleDonnee contenu={ligne.numeroLigne.toString()} />
  <CelluleDonnee
    contenu={decode(ligne.modele.description)}
    enErreur={contientErreur('INTITULE_MANQUANT')}
    gras
  />
  <CelluleDonnee contenu={decode(ligne.modele.descriptionLongue)} />
  <CelluleDonnee
    contenu={ligne.modele.categorie}
    enErreur={contientErreur('CATEGORIE_INCONNUE')}
  />
</tr>
