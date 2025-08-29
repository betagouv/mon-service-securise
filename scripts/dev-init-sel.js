/* eslint-disable no-console */

import { adaptateurChiffrement } from '../src/adaptateurs/adaptateurChiffrement.js';

const sel = process.argv[2];

if (!sel) {
  console.error('Erreur : veuillez fournir un sel en argument.');
  process.exit(1);
}

adaptateurChiffrement({})
  .hacheBCrypt(sel)
  .then((result) => {
    console.log(result);
  });
