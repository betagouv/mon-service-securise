import os
import re
import sys
import zipfile

template = sys.argv[1]
MOTIF_PARTIE = re.compile(r'(slides/(?:_rels/)?slide|notesSlides/(?:_rels/)?notesSlide)(\d+)(\.xml)')
TYPES = {'slide': r'ppt/slides/slide(\d+)\.xml', 'notesSlide': r'ppt/notesSlides/notesSlide(\d+)\.xml'}

with zipfile.ZipFile(template) as zin:
    noms = zin.namelist()
    correspondances = {}
    for type_partie, motif in TYPES.items():
        numeros = sorted(int(m.group(1)) for nom in noms if (m := re.fullmatch(motif, nom)))
        correspondances[type_partie] = {ancien: nouveau for nouveau, ancien in enumerate(numeros, start=1)}

    def renumerote(texte):
        def remplace(m):
            type_partie = 'notesSlide' if m.group(1).endswith('notesSlide') else 'slide'
            return f'{m.group(1)}{correspondances[type_partie][int(m.group(2))]}{m.group(3)}'
        return MOTIF_PARTIE.sub(remplace, texte)

    tmp = template + '.tmp'
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for entree in zin.infolist():
            contenu = zin.read(entree.filename)
            if entree.filename.endswith('.rels') or entree.filename == '[Content_Types].xml':
                contenu = renumerote(contenu.decode('utf-8')).encode('utf-8')
            if entree.filename.startswith(('ppt/slides/', 'ppt/notesSlides/')):
                entree.filename = renumerote(entree.filename)
            zout.writestr(entree, contenu)
os.replace(tmp, template)
for type_partie, c in correspondances.items():
    print(type_partie, {a: n for a, n in c.items() if a != n})
