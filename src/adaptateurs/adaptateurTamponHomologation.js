import pug from 'pug';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { lanceNavigateur } from './adaptateurTamponHomologation.puppeteer.js';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';
import {
  instructionsTamponHomologation,
  configurationsDispositifs,
} from './adaptateurTamponHomologation.configuration.js';

const genereTamponHomologation = async (donnees) => {
  let navigateur = null;
  try {
    navigateur = await lanceNavigateur();
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
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const { tailleDispositif, largeur } of configurationsDispositifs) {
      const corps = pug.compileFile(
        'src/tamponHomologation/modeles/tamponHomologation.pug'
      )({
        ...donnees,
        tailleDispositif,
      });

      const page = await navigateur.newPage();
      await page.setContent(corps);
      await page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 4,
      });
      const elementHtml = await page.$('.tampon-homologation');
      const screenshotBase64 = await elementHtml.screenshot({
        encoding: 'base64',
        type: 'png',
        omitBackground: true,
      });

      const bufferImage = Buffer.from(screenshotBase64, 'base64');
      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.png`,
        buffer: bufferImage,
      });

      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.html`,
        buffer: compileImageEnHTMLBase64(bufferImage, largeur),
      });
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */
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
  } finally {
    if (navigateur !== null) await navigateur.close();
  }
};

export { genereTamponHomologation };
