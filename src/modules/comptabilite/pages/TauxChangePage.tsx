// src/modules/comptabilite/pages/TauxChangePage.tsx
import React, { useState, useEffect } from 'react';
import { deviseApi } from '../services/deviseApi';
import type { TauxChange, TauxReelTime, ComparisonData } from '../types';
import TauxChangeCalculator from '../components/TauxChangeCalculator/TauxChangeCalculator';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './TauxChangePage.css';

export const TauxChangePage: React.FC = () => {
  const [tauxChanges, setTauxChanges] = useState<TauxChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tauxReelTime, setTauxReelTime] = useState<TauxReelTime | null>(null);
  const [loadingTauxReel, setLoadingTauxReel] = useState(false);
  const [comparaison, setComparaison] = useState<ComparisonData[]>([]);
  
  const [formData, setFormData] = useState({
    devise_source: 'MGA',
    devise_cible: 'USD',
    taux: 0,
    date_effet: new Date().toISOString().split('T')[0]
  });

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  const loadTauxChanges = async () => {
    setLoading(true);
    try {
      const data = await deviseApi.getTauxChange();
      setTauxChanges(data);
    } catch (error) {
      console.error('Erreur chargement taux change:', error);
      alert('Chargement des taux échoué, affichage des données de démo', {
        type: 'warning',
        title: 'Avertissement'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer et comparer les taux en temps réel
  const fetchAndCompareTaux = async () => {
    setLoadingTauxReel(true);
    try {
      // 1. Récupérer les taux en temps réel
      const tauxReel = await deviseApi.getTauxReelTime();
      setTauxReelTime(tauxReel);
      
      // 2. Comparer avec vos taux locaux
      const comparisons: ComparisonData[] = [];
      
      // Comparaison MGA→USD
      const tauxLocalUSD = tauxChanges.find(t => 
        t.devise_source === 'MGA' && t.devise_cible === 'USD'
      );
      if (tauxLocalUSD) {
        comparisons.push({
          paire: 'MGA/USD',
          tauxLocal: tauxLocalUSD.taux,
          tauxReel: tauxReel.USD,
          ecart: tauxLocalUSD.taux - tauxReel.USD,
          pourcentageEcart: ((tauxLocalUSD.taux - tauxReel.USD) / tauxReel.USD) * 100
        });
      }
      
      // Comparaison MGA→EUR
      const tauxLocalEUR = tauxChanges.find(t => 
        t.devise_source === 'MGA' && t.devise_cible === 'EUR'
      );
      if (tauxLocalEUR) {
        comparisons.push({
          paire: 'MGA/EUR',
          tauxLocal: tauxLocalEUR.taux,
          tauxReel: tauxReel.EUR,
          ecart: tauxLocalEUR.taux - tauxReel.EUR,
          pourcentageEcart: ((tauxLocalEUR.taux - tauxReel.EUR) / tauxReel.EUR) * 100
        });
      }
      
      setComparaison(comparisons);
      
    } catch (error) {
      console.error('Erreur récupération taux réel:', error);
      alert('Impossible de récupérer les taux en temps réel. Vérifiez votre connexion internet.', {
        type: 'error',
        title: 'Erreur API'
      });
    } finally {
      setLoadingTauxReel(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadTauxChanges();
    };
    
    loadData();
  }, []);

  // Charger les taux réels après que les taux locaux soient chargés
  useEffect(() => {
    if (tauxChanges.length > 0) {
      fetchAndCompareTaux();
    }
  }, [tauxChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Désactivation de l'ajout manuel
    alert('Les taux de change sont gérés automatiquement. La modification manuelle est désactivée.', {
      type: 'info',
      title: 'Information'
    });
    
    setShowForm(false);
    return;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const devises = ['MGA', 'USD', 'EUR'];

  return (
    <div className="taux-change-page">
      <div className="page-header">
        <h1>Gestion des Taux de Change</h1>
        <p>Configuration des taux de change multi-devises avec cours en temps réel</p>
      </div>

      <div className="page-layout">
        {/* Calculateur + Temps Réel */}
        <div className="top-sections">
          <div className="calculator-section">
            <TauxChangeCalculator />
          </div>
          
          <div className="realtime-section">
            <div className="section-header">
              <h2>📈 Cours en Temps Réel</h2>
              <button 
                className="refresh-button"
                onClick={fetchAndCompareTaux}
                disabled={loadingTauxReel}
              >
                {loadingTauxReel ? '🔄...' : '🔄 Actualiser'}
              </button>
            </div>

            {loadingTauxReel ? (
              <div className="loading-realtime">
                <div className="spinner"></div>
                <span>Chargement des cours en direct...</span>
              </div>
            ) : tauxReelTime ? (
              <div className="realtime-content">
                <div className="current-rates">
                  <div className="rate-card">
                    <div className="rate-pair">🇲🇬 MGA → 🇺🇸 USD</div>
                    <div className="rate-value">1 MGA = {tauxReelTime.USD.toFixed(6)} USD</div>
                  </div>
                  <div className="rate-card">
                    <div className="rate-pair">🇲🇬 MGA → 🇪🇺 EUR</div>
                    <div className="rate-value">1 MGA = {tauxReelTime.EUR.toFixed(6)} EUR</div>
                  </div>
                </div>
                
                {comparaison.length > 0 && (
                  <div className="comparison">
                    <h4>🔄 Comparaison avec vos taux</h4>
                    {comparaison.map((comp, index) => (
                      <div key={index} className="comparison-item">
                        <div className="pair">{comp.paire}</div>
                        <div className="rates">
                          <span>Votre taux: {comp.tauxLocal.toFixed(6)}</span>
                          <span>Marché: {comp.tauxReel.toFixed(6)}</span>
                        </div>
                        <div className={`ecart ${Math.abs(comp.pourcentageEcart) > 5 ? 'high' : 'low'}`}>
                          Écart: {comp.pourcentageEcart.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="api-info">
                  <small>Source: Frankfurter API • Dernière mise à jour: {tauxReelTime.date}</small>
                </div>
              </div>
            ) : (
              <div className="error-realtime">
                <p>❌ Impossible de charger les cours</p>
                <button onClick={fetchAndCompareTaux}>Réessayer</button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des taux */}
        <div className="taux-list-section">
          <div className="section-header">
            <h2>Taux de Change Configurés</h2>
            {/* Bouton désactivé */}
            {/* <button 
              className="add-button"
              onClick={() => setShowForm(true)}
            >
              + Ajouter un taux
            </button> */}
          </div>

          {loading ? (
            <div className="loading">Chargement des taux de change...</div>
          ) : (
            <div className="taux-grid">
              {tauxChanges.map((taux) => (
                <div key={taux.id_taux} className="taux-card">
                  <div className="taux-pair">
                    <span className="devise-source">1 {taux.devise_source}</span>
                    <span className="equals">=</span>
                    <span className="taux-value">
                      {taux.taux.toFixed(6)}
                    </span>
                    <span className="devise-cible">{taux.devise_cible}</span>
                  </div>
                  <div className="taux-meta">
                    <span className="date">Effet: {new Date(taux.date_effet).toLocaleDateString('fr-FR')}</span>
                    <span className={`status ${taux.actif ? 'actif' : 'inactif'}`}>
                      {taux.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout (caché) */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nouveau Taux de Change</h3>
              <button 
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="taux-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Devise Source</label>
                  <select
                    value={formData.devise_source}
                    onChange={(e) => handleInputChange('devise_source', e.target.value)}
                    required
                  >
                    {devises.map(devise => (
                      <option key={devise} value={devise}>{devise}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Devise Cible</label>
                  <select
                    value={formData.devise_cible}
                    onChange={(e) => handleInputChange('devise_cible', e.target.value)}
                    required
                  >
                    {devises.map(devise => (
                      <option key={devise} value={devise}>{devise}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Taux de Change</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.taux}
                  onChange={(e) => handleInputChange('taux', parseFloat(e.target.value))}
                  placeholder="0.000000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date d'effet</label>
                <input
                  type="date"
                  value={formData.date_effet}
                  onChange={(e) => handleInputChange('date_effet', e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="cancel-button"
                >
                  Annuler
                </button>
                <button type="submit" className="primary save-button">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Composant AlertDialog */}
      <AlertDialog
        isOpen={isOpen}
        title={title}
        message={message}
        type={type}
        onClose={close}
      />
    </div>
  );
};

export default TauxChangePage;