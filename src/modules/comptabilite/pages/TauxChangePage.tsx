// src/modules/comptabilite/pages/TauxChangePage.tsx
import React, { useState, useEffect } from 'react';
import { deviseApi } from '../services/deviseApi';
import type { TauxChange, TauxReelTime, ComparisonData } from '../types';
import TauxChangeCalculator from '../components/TauxChangeCalculator/TauxChangeCalculator';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import { 
  RefreshCw, 
  Edit2, 
  Plus, 
  DollarSign, 
  Euro,
  TrendingUp,
  Info,
  CheckCircle,
  AlertCircle,
  Calendar,
  Save,
  X
} from 'lucide-react';
import './TauxChangePage.css';

export const TauxChangePage: React.FC = () => {
  const [tauxChanges, setTauxChanges] = useState<TauxChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTaux, setEditingTaux] = useState<TauxChange | null>(null);
  const [tauxReelTime, setTauxReelTime] = useState<TauxReelTime | null>(null);
  const [loadingTauxReel, setLoadingTauxReel] = useState(false);
  const [comparaison, setComparaison] = useState<ComparisonData[]>([]);
  
  const [formData, setFormData] = useState({
    devise_source: 'USD',
    devise_cible: 'MGA',
    taux: 0,
    date_effet: new Date().toISOString().split('T')[0]
  });

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  const loadTauxChanges = async () => {
    setLoading(true);
    try {
      const data = await deviseApi.getTauxChange();
      setTauxChanges(data);
    } catch (error) {
      console.error('Erreur chargement taux change:', error);
      alert('Chargement des taux échoué', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAndCompareTaux = async () => {
    setLoadingTauxReel(true);
    try {
      const tauxReel = await deviseApi.getTauxReelTime();
      setTauxReelTime(tauxReel);
      
      const comparisons: ComparisonData[] = [];
      
      // Comparaison USD→MGA (prioritaire)
      const tauxLocalUSDMGA = tauxChanges.find(t => 
        t.devise_source === 'USD' && t.devise_cible === 'MGA'
      );
      if (tauxLocalUSDMGA && tauxReel.USD) {
        comparisons.push({
          paire: 'USD/MGA',
          tauxLocal: tauxLocalUSDMGA.taux,
          tauxReel: 1 / tauxReel.USD, // Conversion inverse (MGA→USD vers USD→MGA)
          ecart: tauxLocalUSDMGA.taux - (1 / tauxReel.USD),
          pourcentageEcart: ((tauxLocalUSDMGA.taux - (1 / tauxReel.USD)) / (1 / tauxReel.USD)) * 100
        });
      }
      
      // Comparaison EUR→MGA (prioritaire)
      const tauxLocalEURMGA = tauxChanges.find(t => 
        t.devise_source === 'EUR' && t.devise_cible === 'MGA'
      );
      if (tauxLocalEURMGA && tauxReel.EUR) {
        comparisons.push({
          paire: 'EUR/MGA',
          tauxLocal: tauxLocalEURMGA.taux,
          tauxReel: 1 / tauxReel.EUR, // Conversion inverse (MGA→EUR vers EUR→MGA)
          ecart: tauxLocalEURMGA.taux - (1 / tauxReel.EUR),
          pourcentageEcart: ((tauxLocalEURMGA.taux - (1 / tauxReel.EUR)) / (1 / tauxReel.EUR)) * 100
        });
      }
      
      setComparaison(comparisons);
      
    } catch (error) {
      console.error('Erreur récupération taux réel:', error);
      alert('Impossible de récupérer les taux en temps réel', {
        type: 'error',
        title: 'Erreur API'
      });
    } finally {
      setLoadingTauxReel(false);
    }
  };

  useEffect(() => {
    loadTauxChanges();
  }, []);

  useEffect(() => {
    if (tauxChanges.length > 0) {
      fetchAndCompareTaux();
    }
  }, [tauxChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    
    // Utilisez createTauxChange au lieu de updateTaux
    await deviseApi.createTauxChange({
      devise_source: formData.devise_source,
      devise_cible: formData.devise_cible,
      taux: formData.taux,
      date_effet: formData.date_effet,
      actif: true
    });
    
    alert(editingTaux ? 'Taux modifié avec succès' : 'Taux ajouté avec succès', {
      type: 'success',
      title: 'Succès'
    });
    
    setShowForm(false);
    setEditingTaux(null);
    loadTauxChanges();
    
  } catch (error: any) {
    alert(error.message || 'Erreur lors de l\'opération', {
      type: 'error',
      title: 'Erreur'
    });
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (taux: TauxChange) => {
    setEditingTaux(taux);
    setFormData({
      devise_source: taux.devise_source,
      devise_cible: taux.devise_cible,
      taux: taux.taux,
      date_effet: new Date(taux.date_effet).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTaux(null);
    setFormData({
      devise_source: 'USD',
      devise_cible: 'MGA',
      taux: 0,
      date_effet: new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  // Filtrer pour prioriser USD→MGA et EUR→MGA
  const tauxPrioritaires = tauxChanges.filter(t => 
    (t.devise_source === 'USD' && t.devise_cible === 'MGA') || 
    (t.devise_source === 'EUR' && t.devise_cible === 'MGA')
  );

  const tauxAutres = tauxChanges.filter(t => 
    !((t.devise_source === 'USD' && t.devise_cible === 'MGA') || 
      (t.devise_source === 'EUR' && t.devise_cible === 'MGA'))
  );

  return (
    <div className="taux-change-page sage-style">
      <div className="page-header sage-header">
        <div className="header-content">
          <h1><TrendingUp className="header-icon" /> Gestion des Taux de Change</h1>
          <p className="header-subtitle">Configuration et suivi des taux de change multi-devises</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleAddNew}
          >
            <Plus size={16} /> Nouveau Taux
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Section des taux prioritaires */}
        <div className="card-section">
          <div className="section-header">
            <h2><DollarSign className="section-icon" /> Taux Principaux (Madagascar)</h2>
            <div className="section-info">
              <Info size={16} />
              <span>Devises étrangères vers Ariary (MGA)</span>
            </div>
          </div>
          
          <div className="taux-grid-prioritaires">
            {tauxPrioritaires.map((taux) => (
              <div key={taux.id_taux} className="taux-card-prioritaire">
                <div className="card-header">
                  <div className="pair-header">
                    {taux.devise_source === 'USD' ? (
                      <DollarSign className="currency-icon usd" />
                    ) : (
                      <Euro className="currency-icon eur" />
                    )}
                    <div className="pair-title">
                      <span className="pair-name">
                        1 {taux.devise_source} → {taux.devise_cible}
                      </span>
                      <span className="pair-label">Taux de change</span>
                    </div>
                  </div>
                  <button 
                    className="btn-icon-edit"
                    onClick={() => handleEdit(taux)}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                
                <div className="card-body">
                  <div className="taux-value-main">
                    {taux.taux.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} <span className="currency">{taux.devise_cible}</span>
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-item">
                      <Calendar size={12} />
                      <span>Effet: {new Date(taux.date_effet).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className={`status-badge ${taux.actif ? 'active' : 'inactive'}`}>
                      {taux.actif ? (
                        <>
                          <CheckCircle size={12} /> Actif
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} /> Inactif
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculateur et cours réel */}
        <div className="grid-2-col">
          <div className="card-section">
            <div className="section-header">
              <h2>Calculateur de Conversion</h2>
            </div>
            <TauxChangeCalculator />
          </div>
          
          <div className="card-section">
            <div className="section-header">
              <h2>Cours en Temps Réel</h2>
              <button 
                className="btn-icon"
                onClick={fetchAndCompareTaux}
                disabled={loadingTauxReel}
              >
                <RefreshCw size={16} className={loadingTauxReel ? 'spinning' : ''} />
              </button>
            </div>

            {loadingTauxReel ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Chargement des cours...</span>
              </div>
            ) : tauxReelTime ? (
              <div className="realtime-content">
                <div className="realtime-rates">
                  <div className="rate-card-realtime">
                    <div className="rate-header">
                      <DollarSign className="rate-icon" />
                      <span className="rate-title">USD → MGA</span>
                    </div>
                    <div className="rate-value">
                      1 USD = {(1 / (tauxReelTime.USD || 1)).toLocaleString('fr-FR')} MGA
                    </div>
                  </div>
                  
                  <div className="rate-card-realtime">
                    <div className="rate-header">
                      <Euro className="rate-icon" />
                      <span className="rate-title">EUR → MGA</span>
                    </div>
                    <div className="rate-value">
                      1 EUR = {(1 / (tauxReelTime.EUR || 1)).toLocaleString('fr-FR')} MGA
                    </div>
                  </div>
                </div>
                
                {comparaison.length > 0 && (
                  <div className="comparison-section">
                    <h4>Comparaison avec vos taux</h4>
                    {comparaison.map((comp, index) => (
                      <div key={index} className="comparison-item">
                        <div className="comparison-pair">{comp.paire}</div>
                        <div className="comparison-values">
                          <div className="value-group">
                            <span className="label">Votre taux:</span>
                            <span className="value">{comp.tauxLocal.toLocaleString('fr-FR')} MGA</span>
                          </div>
                          <div className="value-group">
                            <span className="label">Marché:</span>
                            <span className="value">{comp.tauxReel.toLocaleString('fr-FR')} MGA</span>
                          </div>
                        </div>
                        <div className={`comparison-diff ${Math.abs(comp.pourcentageEcart) > 5 ? 'diff-high' : 'diff-low'}`}>
                          Écart: {comp.pourcentageEcart > 0 ? '+' : ''}{comp.pourcentageEcart.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="error-state">
                <AlertCircle className="error-icon" />
                <span>Données non disponibles</span>
              </div>
            )}
          </div>
        </div>

        {/* Autres taux */}
        <div className="card-section">
          <div className="section-header">
            <h2>Tous les Taux de Change</h2>
            <span className="badge-count">{tauxAutres.length} taux</span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Chargement...</span>
            </div>
          ) : tauxAutres.length > 0 ? (
            <div className="taux-table-container">
              <table className="taux-table">
                <thead>
                  <tr>
                    <th>Paire</th>
                    <th>Taux</th>
                    <th>Date d'effet</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tauxAutres.map((taux) => (
                    <tr key={taux.id_taux}>
                      <td>
                        <div className="pair-cell">
                          <span className="source-currency">1 {taux.devise_source}</span>
                          <span className="arrow">→</span>
                          <span className="target-currency">{taux.devise_cible}</span>
                        </div>
                      </td>
                      <td>
                        <span className="taux-cell">
                          {taux.taux.toLocaleString('fr-FR', {
                            minimumFractionDigits: 6,
                            maximumFractionDigits: 6
                          })}
                        </span>
                      </td>
                      <td>
                        {new Date(taux.date_effet).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`status-cell ${taux.actif ? 'active' : 'inactive'}`}>
                          {taux.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-icon-small"
                          onClick={() => handleEdit(taux)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Info className="empty-icon" />
              <span>Aucun autre taux configuré</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal sage-modal">
            <div className="modal-header">
              <h3>
                {editingTaux ? 'Modifier le Taux' : 'Nouveau Taux de Change'}
              </h3>
              <button 
                className="btn-icon-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingTaux(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Devise Source</label>
                  <select
                    value={formData.devise_source}
                    onChange={(e) => handleInputChange('devise_source', e.target.value)}
                    className="sage-select"
                    required
                  >
                    <option value="USD">USD ($) - Dollar américain</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="MGA">MGA (Ar) - Ariary malgache</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Devise Cible</label>
                  <select
                    value={formData.devise_cible}
                    onChange={(e) => handleInputChange('devise_cible', e.target.value)}
                    className="sage-select"
                    required
                  >
                    <option value="MGA">MGA (Ar) - Ariary malgache</option>
                    <option value="USD">USD ($) - Dollar américain</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Taux de Change</label>
                  <div className="input-with-hint">
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.taux}
                      onChange={(e) => handleInputChange('taux', parseFloat(e.target.value))}
                      placeholder="0.000000"
                      className="sage-input"
                      required
                    />
                    <div className="input-hint">
                      1 {formData.devise_source} = {formData.taux || 0} {formData.devise_cible}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Date d'effet</label>
                  <input
                    type="date"
                    value={formData.date_effet}
                    onChange={(e) => handleInputChange('date_effet', e.target.value)}
                    className="sage-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingTaux(null);
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingTaux ? 'Modifier' : 'Enregistrer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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