const { EOL } = require('os');
const { decode } = require('html-entities');
const { createObjectCsvStringifier } = require('csv-writer');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const SEPARATEUR = ';';

const remplaceSeparateurParEspace = (chaine) =>
  chaine.replaceAll(SEPARATEUR, ' ');
const remplaceBooleen = (booleen) => (booleen ? 'Oui' : 'Non');

const ligneDuService = (service) =>
  [
    remplaceSeparateurParEspace(decode(service.nomService)),
    service.organisationsResponsables
      .map((o) => decode(o))
      .map(remplaceSeparateurParEspace)
      .join(' - '),
    service.nombreContributeurs,
    remplaceBooleen(service.estProprietaire),
    Number(service.indiceCyber) ? service.indiceCyber : '-',
    service.statutHomologation?.libelle ?? '-',
  ].join(SEPARATEUR);

const genereCsvServices = (tableauServices) => {
  try {
    const entete = [
      'Nom du service',
      'Organisations responsables',
      'Nombre de contributeurs',
      'Est propriétaire ?',
      'Indice cyber',
      'Statut homologation',
    ].join(SEPARATEUR);

    const contenu = [entete, ...tableauServices.map(ligneDuService)].join(EOL);

    const avecBOM = '\uFEFF';
    return Buffer.from(`${avecBOM}${contenu}`, 'utf-8');
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

const avecBOM = (...contenus) => `\uFEFF${contenus.join('')}`;

const genereCsvMesures = async (donneesMesures) => {
  const writer = createObjectCsvStringifier({
    // Les `id` correspondent aux noms des propriétés dans notre modèle Mesure
    header: [
      { id: 'description', title: 'Nom de la mesure' },
      { id: 'referentiel', title: 'Référentiel' },
      { id: 'type', title: 'Type' },
      { id: 'categorie', title: 'Catégorie' },
      { id: 'descriptionLongue', title: 'Description' },
    ],
  });

  const { mesuresGenerales } = donneesMesures;
  const donneesCsv = Object.values(mesuresGenerales).map((m) => ({
    ...m,
    type: m.indispensable ? 'Indispensable' : 'Recommandée',
  }));

  const titre = writer.getHeaderString();
  const lignes = writer.stringifyRecords(donneesCsv);
  const csv = avecBOM(titre, lignes);

  return Buffer.from(csv, 'utf-8');
};

module.exports = { genereCsvMesures, genereCsvServices };
