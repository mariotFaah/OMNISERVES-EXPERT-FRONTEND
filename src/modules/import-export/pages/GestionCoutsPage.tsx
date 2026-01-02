import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande, CoutLogistiqueFormData } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './GestionCoutsPage.css';

const GestionCoutsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CoutLogistiqueFormData>({
    commande_id: parseInt(id!),
    fret_maritime: 0,
    fret_aerien: 0,
    assurance: 0,
    droits_douane: 0,
    frais_transit: 0,
    transport_local: 0,
    autres_frais: 0,
    description_autres_frais: '',
    devise_couts: 'EUR'
  });

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadCommande();
  }, [id]);

  const loadCommande = async () => {
    try {
      const data = await importExportApi.getCommande(parseInt(id!));
      setCommande(data);
      
      // Pré-remplir le formulaire si des coûts existent
      if (data.couts_logistiques) {
        setFormData(prev => ({
          ...prev,
          fret_maritime: data.couts_logistiques!.fret_maritime || 0,
          fret_aerien: data.couts_logistiques!.fret_aerien || 0,
          assurance: data.couts_logistiques!.assurance || 0,
          droits_douane: data.couts_logistiques!.droits_douane || 0,
          frais_transit: data.couts_logistiques!.frais_transit || 0,
          transport_local: data.couts_logistiques!.transport_local || 0,
          autres_frais: data.couts_logistiques!.autres_frais || 0,
          description_autres_frais: data.couts_logistiques!.description_autres_frais || '',
          devise_couts: data.couts_logistiques!.devise_couts || 'EUR'
        }));
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      alert('Erreur lors du chargement de la commande', { 
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CoutLogistiqueFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await importExportApi.updateCoutsLogistiques(formData);
      await loadCommande(); // Recharger pour avoir les données fraîches
      
      // Remplacé l'alert natif par notre AlertDialog personnalisé
      alert('Coûts logistiques enregistrés avec succès!', {
        type: 'success',
        title: 'Sauvegarde réussie'
      });
      
    } catch (error) {
      console.error('Erreur sauvegarde coûts:', error);
      
      // Remplacé l'alert natif par notre AlertDialog personnalisé
      alert('Erreur lors de la sauvegarde des coûts logistiques. Veuillez réessayer.', {
        type: 'error',
        title: 'Erreur de sauvegarde'
      });
      
    } finally {
      setSaving(false);
    }
  };

  const calculerTotalCouts = () => {
    return Object.entries(formData).reduce((total, [key, value]) => {
      if (key.includes('fret') || key.includes('assurance') || key.includes('droits') || 
          key.includes('frais') || key.includes('transport') || key.includes('autres_frais')) {
        return total + (parseFloat(value.toString()) || 0);
      }
      return total;
    }, 0);
  };

  const totalCouts = calculerTotalCouts();

  if (loading) {
    return (
      <div className="couts-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="couts-container">
        <div className="empty-state">
          <h2>Commande non trouvée</h2>
          <Link to="/import-export/commandes" className="btn-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="couts-container">
      <div className="couts-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Gestion des Coûts Logistiques</h1>
            <div className="header-subtitle">
              <span className="commande-ref">{commande.numero_commande}</span>
              <span className="separator">•</span>
              <span className="commande-type">
                {commande.type === 'import' ? '📥 Import' : '📤 Export'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Link 
              to={`/import-export/commandes/${commande.id}/marge`}
              className="btn-secondary"
            >
              📊 Voir la marge
            </Link>
            <Link 
              to={`/import-export/commandes/${commande.id}`}
              className="btn-secondary"
            >
              ← Détails commande
            </Link>
          </div>
        </div>

        <div className="content-layout">
          {/* Formulaire des coûts */}
          <div className="form-section">
            <div className="section-card">
              <h2>Détail des Coûts Logistiques</h2>
              
              <div className="costs-grid">
                {/* Fret Maritime */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">🚢</span>
                    Fret Maritime
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.fret_maritime}
                      onChange={(e) => handleInputChange('fret_maritime', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Fret Aérien */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">✈️</span>
                    Fret Aérien
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.fret_aerien}
                      onChange={(e) => handleInputChange('fret_aerien', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Assurance */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">🛡️</span>
                    Assurance Transport
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.assurance}
                      onChange={(e) => handleInputChange('assurance', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Droits de Douane */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">🏛️</span>
                    Droits de Douane
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.droits_douane}
                      onChange={(e) => handleInputChange('droits_douane', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Frais de Transit */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">🚛</span>
                    Frais de Transit
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.frais_transit}
                      onChange={(e) => handleInputChange('frais_transit', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Transport Local */}
                <div className="cost-item">
                  <label className="cost-label">
                    <span className="cost-icon">🚚</span>
                    Transport Local
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.transport_local}
                      onChange={(e) => handleInputChange('transport_local', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                </div>

                {/* Autres Frais */}
                <div className="cost-item full-width">
                  <label className="cost-label">
                    <span className="cost-icon">📋</span>
                    Autres Frais
                  </label>
                  <div className="cost-input-group">
                    <input
                      type="number"
                      value={formData.autres_frais}
                      onChange={(e) => handleInputChange('autres_frais', parseFloat(e.target.value) || 0)}
                      className="cost-input"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">{formData.devise_couts}</span>
                  </div>
                  <textarea
                    placeholder="Description des autres frais..."
                    value={formData.description_autres_frais}
                    onChange={(e) => handleInputChange('description_autres_frais', e.target.value)}
                    className="cost-description"
                    rows={3}
                  />
                </div>

                {/* Devise */}
                <div className="cost-item">
                  <label className="cost-label">Devise des coûts</label>
                  <select
                    value={formData.devise_couts}
                    onChange={(e) => handleInputChange('devise_couts', e.target.value)}
                    className="currency-select"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dollar US</option>
                    <option value="MGA">MGA - Ariary Malgache</option>
                  </select>
                </div>
              </div>

              {/* Total */}
              <div className="total-section">
                <div className="total-line">
                  <span className="total-label">Total des coûts logistiques:</span>
                  <span className="total-amount">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: formData.devise_couts
                    }).format(totalCouts)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="actions-section">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-save"
                >
                  {saving ? '💾 Enregistrement...' : '💾 Enregistrer les coûts'}
                </button>
                <Link 
                  to={`/import-export/commandes/${commande.id}`}
                  className="btn-cancel"
                >
                  Annuler
                </Link>
              </div>
            </div>
          </div>

          {/* Résumé et impact */}
          <div className="summary-section">
            <div className="summary-card">
              <h3>Impact sur la Marge</h3>
              
              <div className="impact-grid">
                <div className="impact-item">
                  <div className="impact-label">Chiffre d'affaires</div>
                  <div className="impact-value revenue">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: commande.devise
                    }).format(parseFloat(commande.montant_total.toString()))}
                  </div>
                </div>

                <div className="impact-item">
                  <div className="impact-label">Coûts logistiques</div>
                  <div className="impact-value cost">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: formData.devise_couts
                    }).format(totalCouts)}
                  </div>
                </div>

                <div className="impact-item">
                  <div className="impact-label">Marge brute</div>
                  <div className="impact-value margin">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: commande.devise
                    }).format(parseFloat(commande.montant_total.toString()) - totalCouts)}
                  </div>
                </div>

                <div className="impact-item">
                  <div className="impact-label">Taux de marge</div>
                  <div className="impact-value rate">
                    {((parseFloat(commande.montant_total.toString()) - totalCouts) / parseFloat(commande.montant_total.toString()) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="marge-visual">
                <div className="marge-bar">
                  <div 
                    className="marge-fill"
                    style={{ 
                      width: `${Math.min(((parseFloat(commande.montant_total.toString()) - totalCouts) / parseFloat(commande.montant_total.toString()) * 100), 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="marge-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="recommendation-card">
              <h3>Recommandations</h3>
              {totalCouts === 0 ? (
                <p className="recommendation-text">
                  💡 Ajoutez les coûts logistiques pour analyser la rentabilité de cette opération.
                </p>
              ) : totalCouts > parseFloat(commande.montant_total.toString()) * 0.3 ? (
                <p className="recommendation-text warning">
                  ⚠️ Les coûts logistiques représentent plus de 30% du CA. Envisagez de renégocier les tarifs de fret.
                </p>
              ) : (
                <p className="recommendation-text success">
                  ✅ Niveau de coûts logistiques acceptable. La marge est préservée.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default GestionCoutsPage;