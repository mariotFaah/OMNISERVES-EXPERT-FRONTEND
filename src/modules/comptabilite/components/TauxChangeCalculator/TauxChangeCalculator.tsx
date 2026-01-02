// src/modules/comptabilite/components/TauxChangeCalculator/TauxChangeCalculator.tsx
import React from 'react';
import { deviseApi } from '../../services/deviseApi';
import './TauxChangeCalculator.css';

interface TauxChangeCalculatorProps {
  onConversion?: (result: { montant: number; deviseSource: string; deviseCible: string; montantConverti: number }) => void;
}

export const TauxChangeCalculator: React.FC<TauxChangeCalculatorProps> = ({ onConversion }) => {
  const [montant, setMontant] = React.useState<number>(0);
  const [deviseSource, setDeviseSource] = React.useState<string>('MGA');
  const [deviseCible, setDeviseCible] = React.useState<string>('USD');
  const [montantConverti, setMontantConverti] = React.useState<number>(0);
  const [tauxChange, setTauxChange] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);
  const [devises, setDevises] = React.useState<string[]>(['MGA', 'USD', 'EUR']);

  React.useEffect(() => {
    const loadDevises = async () => {
      try {
        // Remplacer getDevisesDisponibles() par getTauxChange()
        const tauxChanges = await deviseApi.getTauxChange();
        // Extraire les devises uniques des taux de change
        const devisesUniques = Array.from(
          new Set([
            'MGA', // Devise par défaut
            ...tauxChanges.flatMap(t => [t.devise_source, t.devise_cible])
          ])
        );
        setDevises(devisesUniques);
      } catch (error) {
        console.error('Erreur chargement devises:', error);
      }
    };
    loadDevises();
  }, []);

  const chargerTauxChange = async (source: string, cible: string) => {
    if (source === cible) {
      setTauxChange(1);
      return;
    }

    setLoading(true);
    try {
      // Remplacer getTauxChangeActuel() par convertirDevise()
      const conversion = await deviseApi.convertirDevise(1, source, cible);
      const taux = conversion.taux || 1;
      setTauxChange(taux);
    } catch (error) {
      console.error('Erreur chargement taux change:', error);
      // Fallback avec taux par défaut
      const tauxParDefaut: { [key: string]: number } = {
        'MGA-USD': 0.00022,
        'USD-MGA': 4500,
        'MGA-EUR': 0.00020,
        'EUR-MGA': 5000,
        'USD-EUR': 0.92,
        'EUR-USD': 1.09
      };
      const tauxDefaut = tauxParDefaut[`${source}-${cible}`] || 1;
      setTauxChange(tauxDefaut);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    chargerTauxChange(deviseSource, deviseCible);
  }, [deviseSource, deviseCible]);

  const calculerConversion = () => {
    const taux = typeof tauxChange === 'number' ? tauxChange : 1;
    const resultat = montant * taux;
    setMontantConverti(parseFloat(resultat.toFixed(2)));
    
    if (onConversion) {
      onConversion({
        montant,
        deviseSource,
        deviseCible,
        montantConverti: resultat
      });
    }
  };

  React.useEffect(() => {
    if (montant > 0) {
      calculerConversion();
    }
  }, [montant, tauxChange]);

  const inverserDevises = () => {
    setDeviseSource(deviseCible);
    setDeviseCible(deviseSource);
  };

  const getDeviseSymbol = (devise: string) => {
    const symbols: { [key: string]: string } = {
      'MGA': 'Ar',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[devise] || devise;
  };

  return (
    <div className="taux-change-calculator">
      <h3>Calculateur de Change</h3>
      
      <div className="conversion-inputs">
        <div className="input-group">
          <label>Montant à convertir</label>
          <div className="input-with-devise">
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <select 
              value={deviseSource} 
              onChange={(e) => setDeviseSource(e.target.value)}
            >
              {devises.map(devise => (
                <option key={devise} value={devise}>{devise}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="inverse-button" 
          onClick={inverserDevises}
          type="button"
          title="Inverser les devises"
        >
          ⇄
        </button>

        <div className="input-group">
          <label>Montant converti</label>
          <div className="resultat-conversion">
            <span className="montant-converti">
              {getDeviseSymbol(deviseCible)} {montantConverti.toLocaleString()}
            </span>
          </div>
          <select 
            value={deviseCible} 
            onChange={(e) => setDeviseCible(e.target.value)}
          >
            {devises.map(devise => (
              <option key={devise} value={devise}>{devise}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="taux-loading">Chargement du taux de change...</div>
      ) : (
        <div className="taux-info">
          <small>
            1 {deviseSource} = {typeof tauxChange === 'number' ? tauxChange.toFixed(6) : '1.000000'} {deviseCible}
          </small>
        </div>
      )}
    </div>
  );
};

export default TauxChangeCalculator;