import { createObjectCsvStringifier } from 'csv-writer';
import { stripHtml } from 'string-strip-html';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';
import { dateEnFrancais } from '../utilitaires/date.js';

const remplaceBooleen = (booleen) => (booleen ? 'Oui' : 'Non');
const avecBOM = (...contenus) => `\uFEFF${contenus.join('')}`;
const sansRetoursChariots = (texte) =>
  texte ? texte.replaceAll('\n', ' ') : '';
const separesParVirgule = (liste) => liste.join(', ');

const transcoPartieResponsable = {
  Projet: 'Votre équipe projet',
  Presta: 'Votre prestataire',
  Mixte: 'Votre équipe projet et votre prestataire',
};

const creeWriterDeCsv = (headerDuCsv) =>
  createObjectCsvStringifier({ header: headerDuCsv, fieldDelimiter: ';' });

const genereCsvServices = (tableauServices) => {
  try {
    const writer = creeWriterDeCsv([
      // Les `id` correspondent aux noms des propriétés dans notre modèle
      { id: 'service', title: 'Nom du service' },
      { id: 'organisations', title: 'Organisations responsables' },
      { id: 'nombreContributeurs', title: 'Nombre de contributeurs' },
      { id: 'estProprietaire', title: 'Est propriétaire ?' },
      { id: 'indiceCyber', title: 'Indice cyber' },
      { id: 'statut', title: 'Statut homologation' },
    ]);

    const donnnesCsv = tableauServices.map((s) => ({
      service: s.nomService,
      organisations: s.organisationResponsable?.nom,
      nombreContributeurs: s.nombreContributeurs,
      estProprietaire: remplaceBooleen(s.estProprietaire),
      indiceCyber: Number(s.indiceCyber) ? s.indiceCyber : '-',
      statut: s.statutHomologation?.libelle ?? '-',
    }));

    const titre = writer.getHeaderString();
    const lignes = writer.stringifyRecords(donnnesCsv);
    const csv = avecBOM(`${titre}${lignes}`);

    return Buffer.from(csv, 'utf-8');
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

const genereCsvMesures = async (
  donneesMesures,
  contributeurs,
  avecDonneesAdditionnnelles,
  referentiel,
  avecTypeMesure = true
) => {
  const { mesuresGenerales, mesuresSpecifiques } = donneesMesures;

  const avecPartieResponsable = Object.values(mesuresGenerales).some(
    (m) => m.partieResponsable
  );

  // Les `id` doivent correspondrent aux champs des objets dans `donneesCsv`
  const colonnes = [
    { id: 'identifiant', title: 'Identifiant de la mesure' },
    { id: 'description', title: 'Nom de la mesure' },
    { id: 'referentiel', title: 'Référentiel' },
    ...(avecTypeMesure ? [{ id: 'type', title: 'Type' }] : []),
    { id: 'categorie', title: 'Catégorie' },
    ...(avecPartieResponsable
      ? [{ id: 'partieResponsable', title: 'Mesure portée par' }]
      : []),
    { id: 'descriptionLongue', title: 'Description' },
  ];

  if (avecDonneesAdditionnnelles) {
    colonnes.push({ id: 'statut', title: 'Statut' });
    colonnes.push({ id: 'commentaires', title: 'Commentaires' });
    colonnes.push({ id: 'priorite', title: 'Priorité' });
    colonnes.push({ id: 'echeance', title: 'Échéance' });
    colonnes.push({ id: 'responsables', title: 'Responsables' });
  }

  const formatteResponsables = (responsables) =>
    separesParVirgule(
      responsables.map((id) => contributeurs[id]).filter((value) => !!value)
    );

  const donneesCsv = Object.values(mesuresGenerales)
    .map((m) => ({
      identifiant: `#${m.identifiantNumerique}`,
      description: m.description,
      referentiel: m.referentiel,
      type: m.indispensable ? 'Indispensable' : 'Recommandée',
      categorie: referentiel.descriptionCategorie(m.categorie),
      partieResponsable: transcoPartieResponsable[m.partieResponsable],
      descriptionLongue: stripHtml(m.descriptionLongue).result,
      statut: referentiel.descriptionStatutMesure(m.statut),
      commentaires: sansRetoursChariots(m.modalites),
      priorite: referentiel.prioritesMesures()[m.priorite]?.libelleCourt,
      echeance: m.echeance ? dateEnFrancais(m.echeance) : null,
      responsables: m.responsables
        ? formatteResponsables(m.responsables)
        : null,
    }))
    .concat(
      mesuresSpecifiques.map((m) => ({
        identifiant: 'N/A',
        description: m.description,
        referentiel: 'Mesures ajoutées',
        type: '',
        categorie: referentiel.descriptionCategorie(m.categorie),
        descriptionLongue: m.descriptionLongue ? m.descriptionLongue : '',
        statut: referentiel.descriptionStatutMesure(m.statut),
        commentaires: sansRetoursChariots(m.modalites),
        priorite: referentiel.prioritesMesures()[m.priorite]?.libelleCourt,
        echeance: m.echeance ? dateEnFrancais(m.echeance) : null,
      }))
    );

  const writer = creeWriterDeCsv(colonnes);
  const titre = writer.getHeaderString();
  const lignes = writer.stringifyRecords(donneesCsv);
  const csv = avecBOM(titre, lignes);

  return Buffer.from(csv, 'utf-8');
};

export { genereCsvMesures, genereCsvServices };
