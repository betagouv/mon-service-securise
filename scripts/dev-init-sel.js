const {
  adaptateurChiffrement,
} = require('../src/adaptateurs/adaptateurChiffrement');

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
