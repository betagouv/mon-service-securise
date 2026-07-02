const ANGLE_MIN_DEG = 30;

type SecteurDef = {
  count: number;
  color: string;
  textColor: string;
  offset: number;
  angleDeg: number;
};

function calculeAnglesAvecMinimum(
  enCours: number,
  nonFait: number,
  aLancer: number,
  aRemplir: number,
  fait: number
): SecteurDef[] {
  const total = enCours + nonFait + aLancer + aRemplir + fait;
  if (total === 0) return [];

  function calculeAngle(count: number) {
    return count === 0 ? 0 : Math.max((count / total) * 360, ANGLE_MIN_DEG);
  }

  const secteurs: SecteurDef[] = [
    {
      count: enCours,
      color: '#0A498C',
      textColor: 'white',
      offset: 0,
      angleDeg: calculeAngle(enCours),
    },
    {
      count: nonFait,
      color: '#75A1E8',
      textColor: 'white',
      offset: 0,
      angleDeg: calculeAngle(nonFait),
    },
    {
      count: aLancer,
      color: '#D0E0F6',
      textColor: '#0A498C',
      offset: 0,
      angleDeg: calculeAngle(aLancer),
    },
    {
      count: aRemplir,
      color: '#FFFFFF',
      textColor: '#666666',
      offset: 0,
      angleDeg: calculeAngle(aRemplir),
    },
    {
      count: fait,
      color: '#173B62',
      textColor: 'white',
      offset: 12,
      angleDeg: calculeAngle(fait),
    },
  ];

  let somme = secteurs.reduce((acc, s) => acc + s.angleDeg, 0);
  if (somme > 360 + 0.001) {
    for (let passe = 0; passe < 3 && somme > 360 + 0.001; passe += 1) {
      const excess = somme - 360;
      const reductibles = secteurs.filter(
        (s) => s.angleDeg > ANGLE_MIN_DEG + 0.001
      );
      if (reductibles.length === 0) break;
      const reductionParSecteur = excess / reductibles.length;

      // eslint-disable-next-line no-restricted-syntax
      for (const s of reductibles) {
        s.angleDeg = Math.max(s.angleDeg - reductionParSecteur, ANGLE_MIN_DEG);
      }
      somme = secteurs.reduce((acc, s) => acc + s.angleDeg, 0);
    }
  }

  return secteurs.filter((s) => s.count > 0);
}

export function svgCamembertMesures(statistiques: {
  fait: number;
  enCours: number;
  nonFait: number;
  aLancer: number;
  aRemplir: number;
}): string {
  const { fait, enCours, nonFait, aLancer, aRemplir } = statistiques;
  const total = fait + enCours + nonFait + aLancer + aRemplir;
  const cx = 64;
  const cy = 64;
  const rPie = 51;
  const rMask = 56;
  const rRing = 57;
  const ringW = 3;

  const bgCircle = `<circle cx="${cx}" cy="${cy}" r="${rPie}" fill="white"/>`;

  if (total === 0) {
    return `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${bgCircle}
</svg>`;
  }

  const secteurs = calculeAnglesAvecMinimum(
    enCours,
    nonFait,
    aLancer,
    aRemplir,
    fait
  );

  const faitSecteur = secteurs.find((s) => s.offset > 0);
  const faitAngleDeg = faitSecteur?.angleDeg ?? 0;
  const restantDeg = 360 - faitAngleDeg;
  const circ = 2 * Math.PI * rRing;
  const restantArc = (restantDeg / 360) * circ;
  const dashOffset = (circ / 4).toFixed(1);

  const outerRing =
    restantArc > 0
      ? `<circle cx="${cx}" cy="${cy}" r="${rRing}" fill="none" stroke="#0F7AC7" stroke-width="${ringW}" stroke-dasharray="${restantArc.toFixed(1)} ${(circ - restantArc).toFixed(1)}" stroke-dashoffset="${dashOffset}"/>`
      : '';

  const maskCircle = `<circle cx="${cx}" cy="${cy}" r="${rMask}" fill="#f0f0f0"/>`;

  let angleRad = -Math.PI / 2;
  const paths: string[] = [];
  const texts: string[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const s of secteurs) {
    const sweepRad = s.angleDeg * (Math.PI / 180);
    const startRad = angleRad;
    const endRad = angleRad + sweepRad;
    const midRad = startRad + sweepRad / 2;
    angleRad = endRad;

    const ox = cx + s.offset * Math.cos(midRad);
    const oy = cy + s.offset * Math.sin(midRad);

    const x1 = ox + rPie * Math.cos(startRad);
    const y1 = oy + rPie * Math.sin(startRad);
    const x2 = ox + rPie * Math.cos(endRad);
    const y2 = oy + rPie * Math.sin(endRad);
    const largeArc = sweepRad > Math.PI ? 1 : 0;

    if (sweepRad >= 2 * Math.PI - 0.001) {
      paths.push(
        `<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${rPie}" fill="${s.color}"/>`
      );
    } else {
      paths.push(
        `<path d="M ${ox.toFixed(1)} ${oy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${rPie} ${rPie} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${s.color}" stroke="white" stroke-width="0.5"/>`
      );
    }

    if (s.angleDeg > 10) {
      const textR = rPie * 0.62;
      const tx = ox + textR * Math.cos(midRad);
      const ty = oy + textR * Math.sin(midRad);
      texts.push(
        `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="bold" fill="${s.textColor}">${s.count}</text>`
      );
    }
  }

  return `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${outerRing}
  ${maskCircle}
  ${bgCircle}
  ${paths.join('\n  ')}
  ${texts.join('\n  ')}
</svg>`;
}
