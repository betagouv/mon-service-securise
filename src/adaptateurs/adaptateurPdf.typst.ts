import {
  AdaptateurPdf,
  DonneesPdfSyntheseSecurite,
} from './adaptateurPdf.interface.js';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';

export class AdaptateurPdfTypst implements AdaptateurPdf {
  private readonly compilateur: NodeCompiler;

  constructor() {
    this.compilateur = NodeCompiler.create({
      fontArgs: [{ fontPaths: ['src/vuesPdf/fonts'] }],
    });
  }

  async genereSyntheseSecurite(
    donnees: DonneesPdfSyntheseSecurite
  ): Promise<Buffer<ArrayBuffer>> {
    const res = this.compilateur.pdf({
      mainFilePath: 'src/vuesPdf/syntheseSecurite.typ',
      inputs: { payload: JSON.stringify(donnees) },
    });

    return Buffer.from(res);
  }
}
