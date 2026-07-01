import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import fs from 'fs';

const compiler = NodeCompiler.create({
  // fontArgs: [{ fontPaths: ['fonts'] }],
});

function genererDossier() {
  const res = compiler.pdf({
    mainFilePath: 'helloWorld.typ',
    // inputs: { payload: JSON.stringify(payload) },
  });
  return Buffer.from(res);
}

fs.writeFileSync('output.pdf', genererDossier());
console.log('Fichier généré.');
