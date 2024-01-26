const { decode } = require('html-entities');
const { createObjectCsvStringifier } = require('csv-writer');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const remplaceBooleen = (booleen) => (booleen ? 'Oui' : 'Non');
const avecBOM = (...contenus) => `\uFEFF${contenus.join('')}`;

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
      organisations: s.organisationsResponsables
        .map((o) => decode(o))
        .join(' - '),
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
