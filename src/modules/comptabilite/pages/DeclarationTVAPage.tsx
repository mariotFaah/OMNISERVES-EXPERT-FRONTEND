// src/modules/comptabilite/pages/DeclarationTVAPage.tsx - VERSION PROFESSIONNELLE
import React, { useState, useEffect } from 'react';
import { rapportApi } from '../services/rapportApi';
import type { RapportTVA } from '../types';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import './DeclarationTVAPage.css';

export const DeclarationTVAPage: React.FC = () => {
  const [tva, setTva] = useState<RapportTVA>({
    tva_collectee: 0,
    tva_deductable: 0,
    tva_a_payer: 0,
    periode: '',
    nombre_ecritures: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date_debut: '2024-01-01',
    date_fin: new Date().toISOString().split('T')[0] // Date du jour par défaut
  });

  const loadTVA = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Chargement déclaration TVA...');
      const data = await rapportApi.getTVA(filters.date_debut, filters.date_fin);
      setTva(data);
      console.log('✅ Déclaration TVA chargée:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur chargement TVA:', errorMessage);
      setError(`Impossible de charger la déclaration TVA: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTVA();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    loadTVA();
  };

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    alert('Fonctionnalité d\'export PDF à implémenter');
  };

  const handleExportExcel = () => {
    // TODO: Implémenter l'export Excel
    alert('Fonctionnalité d\'export Excel à implémenter');
  };

  const getPeriodeDisplay = () => {
    return tva.periode || `${filters.date_debut} à ${filters.date_fin}`;
  };

  const getStatutTVA = () => {
    if (tva.tva_a_payer > 0) return { text: 'À PAYER', type: 'a-payer', color: '#d32f2f' };
    if (tva.tva_a_payer < 0) return { text: 'CRÉDIT TVA', type: 'credit', color: '#2e7d32' };
    return { text: 'ÉQUILIBRÉ', type: 'neutre', color: '#666' };
  };

  const statut = getStatutTVA();

  return (
    <div className="declaration-tva-page">
      {/* EN-TÊTE PROFESSIONNELLE */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1>📋 Déclaration de TVA</h1>
            <p className="subtitle">
              Déclaration fiscale conforme aux normes - Données temps réel
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline" 
              onClick={handleExportPDF}
              disabled={loading}
            >
              📄 Export PDF
            </button>
            <button 
              className="btn btn-outline" 
              onClick={handleExportExcel}
              disabled={loading}
            >
              📊 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* FILTRES AVANCÉS */}
      <div className="filters-section card">
        <h3>🔍 Période de déclaration</h3>
        <form onSubmit={handleGenerate} className="filters-form">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Date de début</label>
              <input
                type="date"
                value={filters.date_debut}
                onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                className="filter-input"
                max={filters.date_fin}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Date de fin</label>
              <input
                type="date"
                value={filters.date_fin}
                onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                className="filter-input"
                min={filters.date_debut}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="filter-actions">
              <button 
                type="submit" 
                className="btn btn-primary generate-button"
                disabled={loading}
              >
                {loading ? '🔄 Génération...' : '🚀 Générer la déclaration'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MESSAGE D'ERREUR */}
      {error && (
        <div className="error-message card">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Erreur de chargement</h4>
            <p>{error}</p>
            <button onClick={loadTVA} className="btn btn-outline">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      {loading ? (
        <div className="loading-container card">
          <div className="loading-spinner"></div>
          <p>Calcul de votre déclaration TVA en cours...</p>
          <small>Récupération des données comptables en temps réel</small>
        </div>
      ) : (
        <div className="tva-content">
          {/* RÉSUMÉ STATISTIQUE */}
          <div className="stats-overview card">
            <div className="stat-item">
              <div className="stat-value">{tva.nombre_ecritures || 0}</div>
              <div className="stat-label">Écritures comptables</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{getPeriodeDisplay()}</div>
              <div className="stat-label">Période analysée</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: statut.color }}>
                {statut.text}
              </div>
              <div className="stat-label">Statut TVA</div>
            </div>
          </div>

          {/* TABLEAU DE BORD TVA */}
          <div className="tva-dashboard">
            {/* TVA COLLECTÉE */}
            <div className="tva-card card collectee-card">
              <div className="card-header">
                <h3>💰 TVA Collectée</h3>
                <div className="card-badge collectee-badge">VENTES</div>
              </div>
              <div className="card-content">
                <div className="tva-amount-main">
                  <MontantDevise montant={tva.tva_collectee} devise="MGA" />
                </div>
                <div className="tva-description">
                  Montant de TVA facturé à vos clients sur la période
                </div>
                <div className="tva-details">
                  <div className="detail-item">
                    <span className="detail-label">Comptes :</span>
                    <span className="detail-value">445710, 445700, 445620</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TVA DÉDUCTIBLE */}
            <div className="tva-card card deductible-card">
              <div className="card-header">
                <h3>📥 TVA Déductible</h3>
                <div className="card-badge deductible-badge">ACHATS</div>
              </div>
              <div className="card-content">
                <div className="tva-amount-main">
                  <MontantDevise montant={tva.tva_deductable} devise="MGA" />
                </div>
                <div className="tva-description">
                  Montant de TVA récupérable sur vos achats et investissements
                </div>
                <div className="tva-details">
                  <div className="detail-item">
                    <span className="detail-label">Comptes :</span>
                    <span className="detail-value">445620, 445600</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RÉSULTAT TVA */}
            <div className={`tva-card card result-card ${statut.type}`}>
              <div className="card-header">
                <h3>⚖️ {statut.text}</h3>
                <div className="card-badge result-badge">RÉSULTAT</div>
              </div>
              <div className="card-content">
                <div className="tva-amount-final" style={{ color: statut.color }}>
                  <MontantDevise montant={Math.abs(tva.tva_a_payer)} devise="MGA" />
                </div>
                <div className="tva-result-description">
                  {tva.tva_a_payer > 0 ? (
                    <>
                      <strong>À reverser à l'administration fiscale</strong>
                      <br />
                      Date limite de paiement : 20 du mois suivant
                    </>
                  ) : tva.tva_a_payer < 0 ? (
                    <>
                      <strong>Crédit de TVA reportable</strong>
                      <br />
                      Imputable sur les déclarations futures
                    </>
                  ) : (
                    <>
                      <strong>Situation équilibrée</strong>
                      <br />
                      Aucun paiement requis pour cette période
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DÉTAILS TECHNIQUES */}
          <div className="technical-details card">
            <h3>🔧 Informations techniques</h3>
            <div className="details-grid">
              <div className="detail-group">
                <h4>Période de déclaration</h4>
                <p>{getPeriodeDisplay()}</p>
              </div>
              <div className="detail-group">
                <h4>Nombre d'opérations</h4>
                <p>{tva.nombre_ecritures || 0} écritures comptables analysées</p>
              </div>
              <div className="detail-group">
                <h4>Comptes utilisés</h4>
                <div className="comptes-list">
                  <span className="compte-badge">445710 - TVA collectée</span>
                  <span className="compte-badge">445700 - TVA à payer</span>
                  <span className="compte-badge">445620 - TVA déductible</span>
                  <span className="compte-badge">445600 - TVA déductible</span>
                </div>
              </div>
              <div className="detail-group">
                <h4>Dernière mise à jour</h4>
                <p>{new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="actions-section">
            <button className="btn btn-primary" onClick={handleExportPDF}>
              📋 Générer le formulaire fiscal
            </button>
            <button className="btn btn-outline" onClick={handleExportExcel}>
              💾 Sauvegarder les données
            </button>
            <button className="btn btn-outline" onClick={loadTVA}>
              🔄 Actualiser les données
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeclarationTVAPage;