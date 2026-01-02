import React, { useState, useEffect } from 'react';
import { importExportApi } from '../../services/api';
import type { Connaissement, ConnaissementFormData, Transporteur } from '../../types';
import { useAlertDialog } from '../../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../../core/components/AlertDialog/AlertDialog';
import './ConnaissementModal.css';

interface ConnaissementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connaissement: Connaissement) => void;
  expeditionId: number;
  connaissementExistant?: Connaissement;
}

const ConnaissementModal: React.FC<ConnaissementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expeditionId,
  connaissementExistant
}) => {
  const [transporteurs, setTransporteurs] = useState<Transporteur[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<ConnaissementFormData>({
    expedition_id: expeditionId,
    transporteur_id: 0,
    type_connaissement: 'maritime',
    type_document: 'original',
    date_emission: '',
    date_embarquement: '',
    port_chargement: '',
    port_dechargement: '',
    consignataire: '',
    destinataire: '',
    statut: 'emis',
    observations: ''
  });

  const { isOpen: isAlertOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    if (isOpen) {
      loadTransporteurs();
      if (connaissementExistant) {
        setFormData({
          expedition_id: expeditionId,
          transporteur_id: connaissementExistant.transporteur_id,
          type_connaissement: connaissementExistant.type_connaissement,
          type_document: connaissementExistant.type_document,
          date_emission: connaissementExistant.date_emission ? connaissementExistant.date_emission.split('T')[0] : '',
          date_embarquement: connaissementExistant.date_embarquement ? connaissementExistant.date_embarquement.split('T')[0] : '',
          port_chargement: connaissementExistant.port_chargement || '',
          port_dechargement: connaissementExistant.port_dechargement || '',
          consignataire: connaissementExistant.consignataire || '',
          destinataire: connaissementExistant.destinataire || '',
          statut: connaissementExistant.statut,
          observations: connaissementExistant.observations || ''
        });
      }
    }
  }, [isOpen, connaissementExistant, expeditionId]);

  const loadTransporteurs = async () => {
    try {
      setLoading(true);
      const transporteursData = await importExportApi.getTransporteurs();
      setTransporteurs(transporteursData);
    } catch (error) {
      console.error('Erreur chargement transporteurs:', error);
      alert('Erreur lors du chargement des transporteurs', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConnaissementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validation
      if (!formData.transporteur_id) {
        alert('Veuillez sélectionner un transporteur', {
          type: 'warning',
          title: 'Champ manquant'
        });
        return;
      }

      let connaissement: Connaissement;
      
      if (connaissementExistant) {
        // Mise à jour
        connaissement = await importExportApi.updateConnaissement(
          connaissementExistant.id, 
          formData
        );
      } else {
        // Création
        connaissement = await importExportApi.createConnaissement(formData);
      }

      alert(
        connaissementExistant 
          ? 'Connaissement mis à jour avec succès!' 
          : 'Connaissement créé avec succès!', 
        {
          type: 'success',
          title: 'Succès'
        }
      );

      onSave(connaissement);
      onClose();
      
    } catch (error) {
      console.error('Erreur sauvegarde connaissement:', error);
      alert('Erreur lors de la sauvegarde du connaissement', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="connaissement-modal-overlay">
      <div className="connaissement-modal">
        <div className="connaissement-modal-header">
          <h2>
            {connaissementExistant ? 'Modifier le' : 'Créer un'} Connaissement
          </h2>
          <button 
            type="button" 
            className="connaissement-modal-close" 
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <div className="connaissement-modal-content">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <div className="connaissement-form">
              <div className="form-grid">
                {/* Transporteur */}
                <div className="form-group">
                  <label>Transporteur *</label>
                  <select
                    value={formData.transporteur_id}
                    onChange={(e) => handleInputChange('transporteur_id', parseInt(e.target.value))}
                    className="form-input"
                    required
                  >
                    <option value={0}>Sélectionnez un transporteur</option>
                    {transporteurs.map(transporteur => (
                      <option key={transporteur.id} value={transporteur.id}>
                        {transporteur.nom} - {transporteur.type_transport}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de connaissement */}
                <div className="form-group">
                  <label>Type de connaissement</label>
                  <select
                    value={formData.type_connaissement}
                    onChange={(e) => handleInputChange('type_connaissement', e.target.value)}
                    className="form-input"
                  >
                    <option value="maritime">Maritime</option>
                    <option value="aerien">Aérien</option>
                    <option value="terrestre">Terrestre</option>
                  </select>
                </div>

                {/* Type de document */}
                <div className="form-group">
                  <label>Type de document</label>
                  <select
                    value={formData.type_document}
                    onChange={(e) => handleInputChange('type_document', e.target.value)}
                    className="form-input"
                  >
                    <option value="original">Original</option>
                    <option value="electronique">Électronique</option>
                    <option value="sea_waybill">Sea Waybill</option>
                  </select>
                </div>

                {/* Statut */}
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => handleInputChange('statut', e.target.value)}
                    className="form-input"
                  >
                    <option value="emis">Émis</option>
                    <option value="embarque">Embarqué</option>
                    <option value="arrive">Arrivé</option>
                    <option value="livre">Livré</option>
                  </select>
                </div>

                {/* Date d'émission */}
                <div className="form-group">
                  <label>Date d'émission</label>
                  <input
                    type="date"
                    value={formData.date_emission}
                    onChange={(e) => handleInputChange('date_emission', e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Date d'embarquement */}
                <div className="form-group">
                  <label>Date d'embarquement</label>
                  <input
                    type="date"
                    value={formData.date_embarquement}
                    onChange={(e) => handleInputChange('date_embarquement', e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Port de chargement */}
                <div className="form-group">
                  <label>Port de chargement</label>
                  <input
                    type="text"
                    value={formData.port_chargement}
                    onChange={(e) => handleInputChange('port_chargement', e.target.value)}
                    className="form-input"
                    placeholder="Port de départ"
                  />
                </div>

                {/* Port de déchargement */}
                <div className="form-group">
                  <label>Port de déchargement</label>
                  <input
                    type="text"
                    value={formData.port_dechargement}
                    onChange={(e) => handleInputChange('port_dechargement', e.target.value)}
                    className="form-input"
                    placeholder="Port d'arrivée"
                  />
                </div>

                {/* Consignataire */}
                <div className="form-group full-width">
                  <label>Consignataire</label>
                  <textarea
                    value={formData.consignataire}
                    onChange={(e) => handleInputChange('consignataire', e.target.value)}
                    className="form-textarea"
                    placeholder="Informations du consignataire..."
                    rows={3}
                  />
                </div>

                {/* Destinataire */}
                <div className="form-group full-width">
                  <label>Destinataire</label>
                  <textarea
                    value={formData.destinataire}
                    onChange={(e) => handleInputChange('destinataire', e.target.value)}
                    className="form-textarea"
                    placeholder="Informations du destinataire..."
                    rows={3}
                  />
                </div>

                {/* Observations */}
                <div className="form-group full-width">
                  <label>Observations</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    className="form-textarea"
                    placeholder="Observations supplémentaires..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="connaissement-modal-actions">
                <button 
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="btn-cancel"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-save"
                >
                  {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        isOpen={isAlertOpen}
        title={title}
        message={message}
        type={type}
        onClose={close}
      />
    </div>
  );
};

export default ConnaissementModal;