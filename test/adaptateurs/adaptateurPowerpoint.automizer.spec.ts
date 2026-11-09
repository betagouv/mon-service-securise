import JSZip from 'jszip';
import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';

const lisFichier = (archive: JSZip, chemin: string) =>
  archive.file(chemin)!.async('string');

const contenuSlide = async (pptx: Buffer, position: number) => {
  const archive = await JSZip.loadAsync(pptx);
  const presentation = await lisFichier(archive, 'ppt/presentation.xml');
  const relations = await lisFichier(
    archive,
    'ppt/_rels/presentation.xml.rels'
  );

  const idsRelationsDesSlides = [
    ...presentation.matchAll(/<p:sldId [^>]*r:id="([^"]+)"/g),
  ].map(([, idRelation]) => idRelation);
  const idRelation = idsRelationsDesSlides[position - 1];
  const [, cible] = relations.match(
    new RegExp(`Id="${idRelation}"[^>]*Target="([^"]+)"`)
  )!;

  return lisFichier(archive, `ppt/${cible}`);
};

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const adaptateur = new AdaptateurPowerpointAutomizer();

  describe('quand il génère le support de commission d’homologation', () => {
    it('écrit le nom du service sur la slide de couverture', async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        nomService: 'Mon super service',
        dateCreation: new Date(2026, 10, 9),
      });

      expect(await contenuSlide(pptx, 1)).toContain(
        '<a:t>Mon super service</a:t>'
      );
    });
  });
});
