export const calculs = {
  calculerMargeBrute: (chiffreAffaires: number, coutsLogistiques: number): number => {
    return chiffreAffaires - coutsLogistiques;
  },

  calculerTauxMarge: (margeBrute: number, chiffreAffaires: number): number => {
    if (chiffreAffaires === 0) return 0;
    return (margeBrute / chiffreAffaires) * 100;
  },

  calculerTotalCouts: (couts: {
    fret_maritime: number;
    fret_aerien: number;
    assurance: number;
    droits_douane: number;
    frais_transit: number;
    transport_local: number;
    autres_frais: number;
  }): number => {
    return Object.values(couts).reduce((sum, cout) => sum + cout, 0);
  },

  evaluerRentabilite: (tauxMarge: number): 'excellente' | 'bonne' | 'faible' | 'deficitaire' => {
    if (tauxMarge < 0) return 'deficitaire';
    if (tauxMarge < 10) return 'faible';
    if (tauxMarge < 25) return 'bonne';
    return 'excellente';
  }
};