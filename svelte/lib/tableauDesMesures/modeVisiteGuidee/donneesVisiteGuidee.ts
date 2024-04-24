import type { Mesures } from '../tableauDesMesures.d';
import { Referentiel } from '../../ui/types.d';

export const mesuresVisiteGuidee: Mesures = {
  mesuresGenerales: {
    exigencesSecurite: {
      description:
        'Fixer et/ou identifier les exigences de sécurité incombant aux prestataires',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>En cas de recours à des prestataires, fixer, dès les clauses contractuelles, les exigences de sécurité à respecter. Dans le cas où ces exigences ne peuvent pas être fixées a priori (ex. produit obtenu sur étagère), identifier l'ensemble des exigences de sécurité que s'engagent à respecter les prestataires.</p><p>Cette mesure permet d'éclairer la sélection des prestataires en fonction des garanties de sécurité que ces derniers s'engagent à respecter.</p>",
      referentiel: Referentiel.ANSSI,
      statut: 'fait',
      modalites: '',
    },
    registreTraitements: {
      description: 'Remplir le registre des traitements et le tenir à jour',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: '',
      referentiel: Referentiel.CNIL,
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données importantes à protéger',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: '',
      referentiel: Referentiel.ANSSI,
    },
    listeEquipements: {
      description:
        "Disposer d'une liste à jour des équipements et des applicatifs contribuant au fonctionnement du service numérique",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: '',
      referentiel: Referentiel.ANSSI,
    },
    limitationInterconnexions: {
      description:
        "Limiter et connaître les interconnexions entre le service numérique et d'autres systèmes d'information",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: '',
      referentiel: Referentiel.ANSSI,
    },
  },
  mesuresSpecifiques: [],
};
