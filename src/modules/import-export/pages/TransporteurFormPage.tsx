import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Transporteur } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './TransporteurFormPage.css';

const TransporteurFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Transporteur>>({
    nom: '',
    type_transport: '',
    contact: '',
    email: '',
    telephone: '',
    adresse: '',
    code_transporteur: '',
    actif: true
  });

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    if (isEdit && id) {
      loadTransporteur();
    }
  }, [id, isEdit]);

  const loadTransporteur = async () => {
    try {
      setLoading(true);
      const transporteur = await importExportApi.getTransporteur(parseInt(id!));
      setFormData(transporteur);
    } catch (error) {
      console.error('Erreur chargement transporteur:', error);
      alert('Erreur lors du chargement du transporteur', {
        type: 'error',
        title: 'Erreur'
      });
      navigate('/import-export/transporteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Transporteur, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nom?.trim()) {
      alert('Le nom du transporteur est obligatoire', {
        type: 'warning',
        title: 'Champ manquant'
      });
      return false;
    }

    if (!formData.type_transport) {
      alert('Le type de transport est obligatoire', {
        type: 'warning',
        title: 'Champ manquant'
      });
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      alert('L\'adresse email n\'est pas valide', {
        type: 'warning',
        title: 'Email invalide'
      });
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Suppression de la variable non utilisée
      if (isEdit && id) {
        await importExportApi.updateTransporteur(parseInt(id!), formData);
      } else {
        await importExportApi.createTransporteur(formData);
      }

      alert(
        isEdit 
          ? 'Transporteur modifié avec succès!' 
          : 'Transporteur créé avec succès!', 
        {
          type: 'success',
          title: 'Succès'
        }
      );

      setTimeout(() => {
        navigate('/import-export/transporteurs');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur sauvegarde transporteur:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="transporteur-form-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="transporteur-form-container">
      <div className="transporteur-form-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>{isEdit ? 'Modifier le' : 'Nouveau'} Transporteur</h1>
            <p>
              {isEdit 
                ? 'Modifiez les informations du transporteur' 
                : 'Ajoutez un nouveau transporteur partenaire'
              }
            </p>
          </div>
          <div className="header-actions">
            <Link to="/import-export/transporteurs" className="btn-secondary">
              ← Retour à la liste
            </Link>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2>Informations du Transporteur</h2>
            
            <div className="form-grid">
              {/* Nom */}
              <div className="form-group">
                <label className="form-label">Nom du transporteur *</label>
                <input
                  type="text"
                  value={formData.nom || ''}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="form-input"
                  placeholder="Ex: Maersk Line, CMA CGM, DHL..."
                  required
                  disabled={saving}
                />
                <small className="field-help">
                  Nom complet du transporteur
                </small>
              </div>

              {/* Type de transport */}
              <div className="form-group">
                <label className="form-label">Type de transport *</label>
                <select
                  value={formData.type_transport || ''}
                  onChange={(e) => handleInputChange('type_transport', e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="maritime">Maritime</option>
                  <option value="aerien">Aérien</option>
                  <option value="terrestre">Terrestre</option>
                  <option value="multimodal">Multimodal</option>
                </select>
                <small className="field-help">
                  Principal mode de transport utilisé
                </small>
              </div>

              {/* Code transporteur */}
              <div className="form-group">
                <label className="form-label">Code transporteur</label>
                <input
                  type="text"
                  value={formData.code_transporteur || ''}
                  onChange={(e) => handleInputChange('code_transporteur', e.target.value)}
                  className="form-input"
                  placeholder="Ex: TRP-0001"
                  disabled={saving || isEdit}
                />
                <small className="field-help">
                  Code unique (généré automatiquement si vide)
                </small>
              </div>

              {/* Contact */}
              <div className="form-group">
                <label className="form-label">Personne contact</label>
                <input
                  type="text"
                  value={formData.contact || ''}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className="form-input"
                  placeholder="Nom du contact principal"
                  disabled={saving}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  placeholder="email@transporteur.com"
                  disabled={saving}
                />
              </div>

              {/* Téléphone */}
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone || ''}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="form-input"
                  placeholder="+261 20 22 123 45"
                  disabled={saving}
                />
              </div>

              {/* Adresse */}
              <div className="form-group full-width">
                <label className="form-label">Adresse</label>
                <textarea
                  value={formData.adresse || ''}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className="form-textarea"
                  placeholder="Adresse complète du transporteur..."
                  rows={3}
                  disabled={saving}
                />
                <small className="field-help">
                  Siège social ou adresse principale
                </small>
              </div>

              {/* Statut actif */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.actif !== false}
                    onChange={(e) => handleInputChange('actif', e.target.checked)}
                    className="checkbox-input"
                    disabled={saving}
                  />
                  <span className="checkbox-custom"></span>
                  Transporteur actif
                </label>
                <small className="field-help">
                  Décochez pour désactiver ce transporteur
                </small>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Link 
                to="/import-export/transporteurs"
                className="btn-cancel"
                onClick={(e) => {
                  if (saving) {
                    e.preventDefault();
                  }
                }}
              >
                Annuler
              </Link>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-save"
              >
                {saving ? (
                  <>
                    <div className="saving-spinner"></div>
                    {isEdit ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  isEdit ? '💾 Modifier' : '➕ Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default TransporteurFormPage;