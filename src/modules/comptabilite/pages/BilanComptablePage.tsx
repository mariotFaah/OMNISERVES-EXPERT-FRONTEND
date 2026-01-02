// src/modules/comptabilite/pages/BilanComptablePage.tsx - VERSION FINALE
import React, { useState, useEffect } from 'react';
import { rapportApi } from '../services/rapportApi';
import type { RapportBilan } from '../types';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import './BilanComptablePage.css';

export const BilanComptablePage: React.FC = () => {
  const [bilan, setBilan] = useState<RapportBilan>({});
  const [loading, setLoading] = useState(false);
  const [dateBilan, setDateBilan] = useState(new Date().toISOString().split('T')[0]);

  const loadBilan = async () => {
    setLoading(true);
    try {
      const data = await rapportApi.getBilan(dateBilan);
      setBilan(data);
    } catch (error) {
      console.error('Erreur chargement bilan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilan();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateBilan(e.target.value);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    loadBilan();
  };

  const getLibelleCompte = (compte: string): string => {
    const libelles: { [key: string]: string } = {
      '101000': 'Capital social',
      '102000': 'Réserves',
      '103000': 'Report à nouveau',
      '211000': 'Immobilisations corporelles',
      '213000': 'Immobilisations incorporelles',
      '215000': 'Immobilisations financières',
      '311000': 'Stocks de marchandises',
      '312000': 'Stocks de matières premières',
      '313000': 'Stocks de produits finis',
      '401000': 'Fournisseurs',
      '411000': 'Clients',
      '412000': 'Clients douteux',
      '445620': 'TVA déductible',
      '445710': 'TVA collectée',
      '511000': 'Banque principale',
      '512000': 'Banque secondaire',
      '513000': 'Autres comptes bancaires'
    };
    return libelles[compte] || `Compte ${compte}`;
  };

  const classerComptes = () => {
    const actif: Array<{compte: string, libelle: string, solde: number}> = [];
    const passif: Array<{compte: string, libelle: string, solde: number}> = [];

    Object.entries(bilan).forEach(([compte, details]) => {
      const libelle = getLibelleCompte(compte);
      
      // ACTIF = soldes DÉBITEURS (positifs)
      if (details.solde > 0) {
        actif.push({ compte, libelle, solde: details.solde });
      }
      // PASSIF = soldes CRÉDITEURS (négatifs)
      else if (details.solde < 0) {
        passif.push({ compte, libelle, solde: Math.abs(details.solde) });
      }
    });

    return { actif, passif };
  };

  const { actif, passif } = classerComptes();

  const totalActif = actif.reduce((total, compte) => total + compte.solde, 0);
  const totalPassif = passif.reduce((total, compte) => total + compte.solde, 0);

  return (
    <div className="bilan-comptable-page">
      <div className="page-header">
        <h1>Bilan Comptable</h1>
        
      </div>

      <div className="filters-section">
        <form onSubmit={handleGenerate} className="filters-form">
          <div className="filter-group">
            <label>Date du bilan</label>
            <input
              type="date"
              value={dateBilan}
              onChange={handleDateChange}
            />
          </div>
          <button type="submit" className="generate-button">
            Générer le bilan
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Génération du bilan...</div>
      ) : (
        <div className="bilan-container">
          <div className="bilan-section">
            <h2>ACTIF (Ce que l'entreprise possède)</h2>
            <div className="comptes-list">
              {actif.length > 0 ? (
                <>
                  {actif.map(({ compte, libelle, solde }) => (
                    <div key={compte} className="compte-line">
                      <span className="compte-number">{compte}</span>
                      <span className="compte-libelle">{libelle}</span>
                      <span className="compte-solde actif">
                        <MontantDevise montant={solde} devise="MGA" />
                      </span>
                    </div>
                  ))}
                  <div className="compte-total">
                    <span className="total-label">TOTAL ACTIF</span>
                    <span className="total-amount">
                      <MontantDevise montant={totalActif} devise="MGA" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">Aucun compte actif</div>
              )}
            </div>
          </div>

          <div className="bilan-section">
            <h2>PASSIF (Ce que l'entreprise doit)</h2>
            <div className="comptes-list">
              {passif.length > 0 ? (
                <>
                  {passif.map(({ compte, libelle, solde }) => (
                    <div key={compte} className="compte-line">
                      <span className="compte-number">{compte}</span>
                      <span className="compte-libelle">{libelle}</span>
                      <span className="compte-solde passif">
                        <MontantDevise montant={solde} devise="MGA" />
                      </span>
                    </div>
                  ))}
                  <div className="compte-total">
                    <span className="total-label">TOTAL PASSIF</span>
                    <span className="total-amount">
                      <MontantDevise montant={totalPassif} devise="MGA" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">Aucun compte passif</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`bilan-equilibre ${totalActif === totalPassif ? 'equilibre' : 'desequilibre'}`}>
        {totalActif === totalPassif ? (
          <div className="equilibre-message">
            ✅ Bilan équilibré : Actif = Passif
          </div>
        ) : (
          <div className="desequilibre-message">
            ⚠️ Bilan déséquilibré : Actif ({totalActif.toLocaleString()} MGA) ≠ Passif ({totalPassif.toLocaleString()} MGA)
          </div>
        )}
      </div>
    </div>
  );
};

export default BilanComptablePage;
