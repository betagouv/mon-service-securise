const { decode } = require('html-entities');
const { createObjectCsvStringifier } = require('csv-writer');
const { stripHtml } = require('string-strip-html');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');
const { featureFlag } = require('./adaptateurEnvironnement');
const { dateEnFrancais } = require('../utilitaires/date');

const remplaceBooleen = (booleen) => (booleen ? 'Oui' : 'Non');
const avecBOM = (...contenus) => `\uFEFF${contenus.join('')}`;
const sansRetoursChariots = (texte) => texte.replaceAll('\n', ' ');

const genereCsvServices = (tableauServices) => {
  try {
    const writer = createObjectCsvStringifier({
      // Les `id` correspondent aux noms des propriétés dans notre modèle
      header: [
        { id: 'service', title: 'Nom du service' },
        { id: 'organisations', title: 'Organisations responsables' },
        { id: 'nombreContributeurs', title: 'Nombre de contributeurs' },
        { id: 'estProprietaire', title: 'Est propriétaire ?' },
        { id: 'indiceCyber', title: 'Indice cyber' },
        { id: 'statut', title: 'Statut homologation' },
      ],
    });

    const donnnesCsv = tableauServices.map((s) => ({
      service: decode(s.nomService),
      organisations: decode(s.organisationResponsable?.nom),
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
  avecDonneesAdditionnnelles,
  referentiel
) => {
  // Les `id` doivent correspondrent aux champs des objets dans `donneesCsv`
  const colonnes = [
    { id: 'identifiant', title: 'Identifiant de la mesure' },
    { id: 'description', title: 'Nom de la mesure' },
    { id: 'referentiel', title: 'Référentiel' },
    { id: 'type', title: 'Type' },
    { id: 'categorie', title: 'Catégorie' },
    { id: 'descriptionLongue', title: 'Description' },
  ];

  if (avecDonneesAdditionnnelles) {
    colonnes.push({ id: 'statut', title: 'Statut' });
    colonnes.push({ id: 'commentaires', title: 'Commentaires' });

    if (featureFlag().avecPlanAction()) {
      colonnes.push({ id: 'priorite', title: 'Priorité' });
      colonnes.push({ id: 'echeance', title: 'Échéance' });
    }
  }

  const { mesuresGenerales, mesuresSpecifiques } = donneesMesures;
  const donneesCsv = Object.values(mesuresGenerales)
    .map((m) => ({
      identifiant: `#${m.identifiantNumerique}`,
      description: m.description,
      referentiel: m.referentiel,
      type: m.indispensable ? 'Indispensable' : 'Recommandée',
      categorie: referentiel.descriptionCategorie(m.categorie),
      descriptionLongue: stripHtml(m.descriptionLongue).result,
      statut: referentiel.descriptionStatutMesure(m.statut),
      commentaires: sansRetoursChariots(decode(m.modalites)),
      priorite: referentiel.prioritesMesures()[m.priorite]?.libelleCourt,
      echeance: m.echeance ? dateEnFrancais(m.echeance) : null,
    }))
    .concat(
      mesuresSpecifiques.map((m) => ({
        identifiant: 'N/A',
        description: decode(m.description),
        referentiel: 'Mesures ajoutées',
        type: '',
        categorie: referentiel.descriptionCategorie(m.categorie),
        descriptionLongue: '',
        statut: referentiel.descriptionStatutMesure(m.statut),
        commentaires: sansRetoursChariots(decode(m.modalites)),
        priorite: referentiel.prioritesMesures()[m.priorite]?.libelleCourt,
        echeance: m.echeance ? dateEnFrancais(m.echeance) : null,
      }))
    );

  const writer = createObjectCsvStringifier({ header: colonnes });
  const titre = writer.getHeaderString();
  const lignes = writer.stringifyRecords(donneesCsv);
  const csv = avecBOM(titre, lignes);

  return Buffer.from(csv, 'utf-8');
};

module.exports = { genereCsvMesures, genereCsvServices };
