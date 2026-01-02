// src/modules/comptabilite/pages/CompteResultatPage.tsx
import React, { useState, useEffect } from 'react';
import { rapportApi } from '../services/rapportApi';
import type { RapportCompteResultat } from '../types';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import './CompteResultatPage.css';

export const CompteResultatPage: React.FC = () => {
  const [compteResultat, setCompteResultat] = useState<RapportCompteResultat>({
    charges: 0,
    produits: 0,
    resultat_net: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_debut: '2024-01-01',
    date_fin: '2024-12-31'
  });

  const loadCompteResultat = async () => {
    setLoading(true);
    try {
      const data = await rapportApi.getCompteResultat(filters.date_debut, filters.date_fin);
      setCompteResultat(data);
    } catch (error) {
      console.error('Erreur chargement compte de résultat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompteResultat();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompteResultat();
  };

  return (
    <div className="compte-resultat-page">
      <div className="page-header">
        <h1>Compte de Résultat</h1>
        <p>Produits et charges sur une période - Données réelles du backend</p>
      </div>

      <div className="filters-section">
        <form onSubmit={handleGenerate} className="filters-form">
          <div className="filter-group">
            <label>Date début</label>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => handleFilterChange('date_debut', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date fin</label>
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => handleFilterChange('date_fin', e.target.value)}
            />
          </div>

          <button type="submit" className="generate-button">
            Générer le compte de résultat
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Génération du compte de résultat...</div>
      ) : (
        <div className="compte-resultat-container">
          <div className="resultat-section produits">
            <h2>PRODUITS</h2>
            <div className="montant-total">
              <MontantDevise montant={compteResultat.produits} devise="MGA" />
            </div>
            <div className="section-subtitle">Ventes de produits et services</div>
          </div>

          <div className="resultat-section charges">
            <h2>CHARGES</h2>
            <div className="montant-total">
              <MontantDevise montant={compteResultat.charges} devise="MGA" />
            </div>
            <div className="section-subtitle">Achats et charges externes</div>
          </div>

          <div className={`resultat-final ${compteResultat.resultat_net >= 0 ? 'benefice' : 'perte'}`}>
            <h2>RÉSULTAT {compteResultat.resultat_net >= 0 ? 'BÉNÉFICIAIRE' : 'DÉFICITAIRE'}</h2>
            <div className="montant-resultat">
              <MontantDevise montant={Math.abs(compteResultat.resultat_net)} devise="MGA" />
            </div>
            <div className="resultat-indicator">
              {compteResultat.resultat_net >= 0 ? '✅ Bénéfice' : '❌ Perte'}
            </div>
          </div>
        </div>
      )}

      <div className="compte-resultat-summary">
        <div className="summary-card">
          <h3>Marge commerciale</h3>
          <div className="summary-amount">
            <MontantDevise montant={compteResultat.produits - compteResultat.charges} devise="MGA" />
          </div>
        </div>
        <div className="summary-card">
          <h3>Taux de marge</h3>
          <div className="summary-percentage">
            {compteResultat.produits > 0 
              ? `${((compteResultat.produits - compteResultat.charges) / compteResultat.produits * 100).toFixed(1)}%`
              : '0%'
            }
          </div>
        </div>
        <div className="summary-card">
          <h3>Période analysée</h3>
          <div className="summary-period">
            {filters.date_debut} à {filters.date_fin}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompteResultatPage;
