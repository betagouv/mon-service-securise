const instructionsTamponHomologation = Buffer.from(
  `Instructions d'utilisation
------------------------

Vous avez téléchargé une archive .zip sur le site https://www.monservicesecurise.cyber.gouv.fr/.
Cette archive contient des encarts d'homologation personnalisés pour votre service.

Nous vous proposons ces encarts en divers formats, afin de faciliter leur utilisation
sur votre site internet.

- Au format .png
  - 3 images d'encart d'homologation. Pour les formats téléphone, tablette et bureau.
  - 1 image de tampon d'homologation.
- Au format .html
  - 3 fichiers contenant les encarts d'homologation au format « base64 ».
  - 1 fichier contenant le tampon d'homologation au format « base64 ».`,
  'utf-8'
);

const configurationsDispositifs = [
  { tailleDispositif: 'mobile', largeur: 288 },
  { tailleDispositif: 'tablette', largeur: 656 },
  { tailleDispositif: 'desktop', largeur: 996 },
];

export { configurationsDispositifs, instructionsTamponHomologation };
