// src/modules/comptabilite/pages/TresoreriePage.tsx
import React, { useState, useEffect } from 'react';
import { rapportApi } from '../services/rapportApi';
import type { RapportTresorerie } from '../types';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import './TresoreriePage.css';

export const TresoreriePage: React.FC = () => {
  const [tresorerie, setTresorerie] = useState<RapportTresorerie>({
    entrees: 0,
    sorties_prevues: 0,
    solde_tresorerie: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_debut: '2024-01-01',
    date_fin: '2024-12-31'
  });

  const loadTresorerie = async () => {
    setLoading(true);
    try {
      const data = await rapportApi.getTresorerie(filters.date_debut, filters.date_fin);
      setTresorerie(data);
    } catch (error) {
      console.error('Erreur chargement trésorerie:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTresorerie();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    loadTresorerie();
  };

  return (
    <div className="tresorerie-page">
      <div className="page-header">
        <h1>État de Trésorerie</h1>
        <p>Situation de trésorerie et prévisions - Données réelles du backend</p>
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
            Générer l'état
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Génération de l'état de trésorerie...</div>
      ) : (
        <div className="tresorerie-container">
          <div className="tresorerie-section entrees">
            <h2>ENTRÉES DE TRÉSORERIE</h2>
            <div className="tresorerie-amount positive">
              <MontantDevise montant={tresorerie.entrees} devise="MGA" />
            </div>
            <div className="tresorerie-description">
              Paiements clients reçus
            </div>
          </div>

          <div className="tresorerie-section sorties">
            <h2>SORTIES PRÉVUES</h2>
            <div className="tresorerie-amount negative">
              <MontantDevise montant={tresorerie.sorties_prevues} devise="MGA" />
            </div>
            <div className="tresorerie-description">
              Factures fournisseurs à payer
            </div>
          </div>

          <div className={`tresorerie-solde ${tresorerie.solde_tresorerie >= 0 ? 'positif' : 'negatif'}`}>
            <h2>SOLDE DE TRÉSORERIE</h2>
            <div className="solde-montant">
              <MontantDevise montant={Math.abs(tresorerie.solde_tresorerie)} devise="MGA" />
            </div>
            <div className="solde-indicator">
              {tresorerie.solde_tresorerie >= 0 ? '✅ Excédent' : '❌ Déficit'}
            </div>
          </div>

          <div className="tresorerie-details">
            <h3>Analyse de trésorerie</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Période :</span>
                <span className="detail-value">{filters.date_debut} à {filters.date_fin}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Couverture :</span>
                <span className="detail-value">
                  {tresorerie.sorties_prevues > 0 
                    ? `${((tresorerie.entrees / tresorerie.sorties_prevues) * 100).toFixed(1)}%`
                    : '100%'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Besoin de financement :</span>
                <span className="detail-value">
                  {tresorerie.solde_tresorerie < 0 
                    ? <MontantDevise montant={Math.abs(tresorerie.solde_tresorerie)} devise="MGA" />
                    : 'Aucun'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TresoreriePage;
