import pug from 'pug';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { Resvg } from '@resvg/resvg-js';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';
import {
  instructionsTamponHomologation,
  configurationsDispositifs,
} from './adaptateurTamponHomologation.configuration.js';

const compilateurTypst = NodeCompiler.create({
  fontArgs: [{ fontPaths: ['src/vuesPdf/fonts'] }],
});

const formatteDateFrancaise = Intl.DateTimeFormat('fr-FR').format;

const texteTronque = (texte, tailleLimite) => {
  const longueurInitiale = texte.length;
  const resultat = texte.substring(0, tailleLimite);
  return resultat.length < longueurInitiale ? `${resultat}…` : resultat;
};

const insereEspaceInvisible = (texte) =>
  texte.replace(/(\p{Ll})(\p{Lu})/gu, '$1​$2');

const genereImageEncartHomologation = ({
  service,
  dossier,
  referentiel,
  tailleDispositif,
  largeur,
}) => {
  const payload = {
    tailleDispositif,
    largeur,
    nomService: texteTronque(insereEspaceInvisible(service.nomService()), 60),
    organisationResponsable: texteTronque(
      service.descriptionService.organisationResponsable.nom || '',
      67
    ),
    dateHomologation: formatteDateFrancaise(
      new Date(dossier.decision.dateHomologation)
    ),
    dureeEtEcheance: `${referentiel.descriptionEcheanceRenouvellement(dossier.decision.dureeValidite)} | ${formatteDateFrancaise(dossier.dateProchaineHomologation())}`,
  };

  const svg = compilateurTypst.plainSvg({
    mainFilePath: 'src/tamponHomologation/modeles/tamponHomologation.typ',
    inputs: { payload: JSON.stringify(payload) },
  });

  const rasterizeur = new Resvg(svg, {
    fitTo: { mode: 'width', value: largeur * 4 },
  });

  return rasterizeur.render().asPng();
};

const genereTamponHomologation = async (donnees) => {
  try {
    const compileImageEnHTMLBase64 = (buffer, largeur) =>
      Buffer.from(
        pug.compileFile(
          'src/tamponHomologation/modeles/tamponHomologation.base64.pug'
        )({
          ...donnees,
          base64: buffer.toString('base64'),
          largeur,
        }),
        'utf-8'
      );

    const fichiers = [];
    configurationsDispositifs.forEach(({ tailleDispositif, largeur }) => {
      const bufferImage = genereImageEncartHomologation({
        ...donnees,
        tailleDispositif,
        largeur,
      });

      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.png`,
        buffer: bufferImage,
      });

      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.html`,
        buffer: compileImageEnHTMLBase64(bufferImage, largeur),
      });
    });

    fichiers.push({
      nom: 'instructions.txt',
      buffer: instructionsTamponHomologation,
    });

    const imageTamponHomologation = await readFile(
      join(process.cwd(), '/public/assets/images/tampon_homologation.png')
    );
    fichiers.push({
      nom: 'tamponHomologation.png',
      buffer: imageTamponHomologation,
    });
    fichiers.push({
      nom: `tamponHomologation.html`,
      buffer: compileImageEnHTMLBase64(imageTamponHomologation, 226, 226),
    });

    return fichiers;
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

export { genereTamponHomologation };
