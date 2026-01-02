// src/modules/crm/components/forms/RelanceForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi } from '../../services/api';
import type { Relance, RelanceFormData, Client } from '../../types';
import './RelanceForm.css';

interface RelanceFormProps {
  mode?: 'create' | 'edit';
}

const RelanceForm: React.FC<RelanceFormProps> = ({ mode = 'create' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentRelance, setCurrentRelance] = useState<Relance | null>(null);
  
  const [formData, setFormData] = useState<RelanceFormData>({
    tiers_id: 0,
    type_relance: 'commerciale',
    objet: '',
    message: '',
    date_relance: new Date().toISOString().split('T')[0],
    echeance: '',
    canal: 'email',
    facture_id: undefined,
    contrat_id: undefined
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RelanceFormData, string>>>({});

  useEffect(() => {
    loadInitialData();
  }, [id, mode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger la liste des clients
      const clientsData = await crmApi.getClients();
      setClients(clientsData);

      // Si mode édition, charger les données de la relance
      if (mode === 'edit' && id) {
        const relanceData: Relance = await crmApi.getRelance(parseInt(id));
        setCurrentRelance(relanceData);
        setFormData({
          tiers_id: relanceData.tiers_id,
          type_relance: relanceData.type_relance,
          objet: relanceData.objet,
          message: relanceData.message || '',
          date_relance: relanceData.date_relance,
          echeance: relanceData.echeance || '',
          canal: relanceData.canal,
          facture_id: relanceData.facture_id || undefined,
          contrat_id: relanceData.contrat_id || undefined
        });
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RelanceFormData, string>> = {};

    if (!formData.tiers_id || formData.tiers_id === 0) {
      newErrors.tiers_id = 'Le client est requis';
    }

    if (!formData.objet.trim()) {
      newErrors.objet = "L'objet est requis";
    }

    if (!formData.date_relance) {
      newErrors.date_relance = 'La date de relance est requise';
    }

    if (formData.echeance && new Date(formData.echeance) < new Date(formData.date_relance)) {
      newErrors.echeance = "L'échéance ne peut pas être avant la date de relance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      if (mode === 'create') {
        const newRelance: Relance = await crmApi.createRelance(formData);
        console.log('Relance créée:', newRelance);
        alert('Relance créée avec succès!');
      } else if (mode === 'edit' && id) {
        const updatedRelance: Relance = await crmApi.updateRelance(parseInt(id), formData);
        console.log('Relance modifiée:', updatedRelance);
        alert('Relance modifiée avec succès!');
      }

      navigate('/crm/relances');
      
    } catch (error) {
      console.error('Erreur sauvegarde relance:', error);
      alert('Erreur lors de la sauvegarde de la relance');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof RelanceFormData, value: any) => {
    setFormData(prev => {
      let processedValue = value;
      
      // Conversions spécifiques
      if (field === 'tiers_id' || field === 'facture_id' || field === 'contrat_id') {
        processedValue = value ? parseInt(value) || undefined : undefined;
      }
      
      return {
        ...prev,
        [field]: processedValue
      };
    });

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getRelanceInfo = () => {
    if (mode === 'edit' && currentRelance) {
      return (
        <div className="edit-info">
          <p>
            <strong>Relance créée le :</strong> {new Date(currentRelance.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Statut actuel :</strong> 
            <span className={`statut-badge ${currentRelance.statut}`}>
              {currentRelance.statut}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="relance-form-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="relance-form-container">
      <div className="form-header">
        <div className="header-content">
          <h1>{mode === 'create' ? 'Nouvelle Relance' : 'Modifier la Relance'}</h1>
          {getRelanceInfo()}
        </div>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => navigate('/crm/relances')}
        >
          ← Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relance-form">
        <div className="form-grid">
          {/* Client associé */}
          <div className="form-group">
            <label htmlFor="tiers_id" className="required">
              Client
            </label>
            <select
              id="tiers_id"
              value={formData.tiers_id}
              onChange={(e) => handleChange('tiers_id', e.target.value)}
              className={errors.tiers_id ? 'error' : ''}
            >
              <option value={0}>Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id_tiers} value={client.id_tiers}>
                  {client.nom} - {client.email}
                </option>
              ))}
            </select>
            {errors.tiers_id && <span className="error-message">{errors.tiers_id}</span>}
          </div>

          {/* Type de relance */}
          <div className="form-group">
            <label htmlFor="type_relance" className="required">
              Type de relance
            </label>
            <select
              id="type_relance"
              value={formData.type_relance}
              onChange={(e) => handleChange('type_relance', e.target.value)}
            >
              <option value="paiement">Paiement</option>
              <option value="contrat">Contrat</option>
              <option value="echeance">Échéance</option>
              <option value="commerciale">Commerciale</option>
            </select>
          </div>

          {/* Canal */}
          <div className="form-group">
            <label htmlFor="canal" className="required">
              Canal
            </label>
            <select
              id="canal"
              value={formData.canal}
              onChange={(e) => handleChange('canal', e.target.value)}
            >
              <option value="email">Email</option>
              <option value="telephone">Téléphone</option>
              <option value="courrier">Courrier</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          {/* Date de relance */}
          <div className="form-group">
            <label htmlFor="date_relance" className="required">
              Date de relance
            </label>
            <input
              type="date"
              id="date_relance"
              value={formData.date_relance}
              onChange={(e) => handleChange('date_relance', e.target.value)}
              className={errors.date_relance ? 'error' : ''}
            />
            {errors.date_relance && <span className="error-message">{errors.date_relance}</span>}
          </div>

          {/* Échéance */}
          <div className="form-group">
            <label htmlFor="echeance">
              Échéance (optionnel)
            </label>
            <input
              type="date"
              id="echeance"
              value={formData.echeance}
              onChange={(e) => handleChange('echeance', e.target.value)}
              className={errors.echeance ? 'error' : ''}
              min={formData.date_relance}
            />
            {errors.echeance && <span className="error-message">{errors.echeance}</span>}
          </div>

          {/* Références */}
          <div className="form-group">
            <label htmlFor="facture_id">
              Numéro de facture (optionnel)
            </label>
            <input
              type="number"
              id="facture_id"
              value={formData.facture_id || ''}
              onChange={(e) => handleChange('facture_id', e.target.value)}
              placeholder="123"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrat_id">
              ID Contrat (optionnel)
            </label>
            <input
              type="number"
              id="contrat_id"
              value={formData.contrat_id || ''}
              onChange={(e) => handleChange('contrat_id', e.target.value)}
              placeholder="456"
              min="1"
            />
          </div>
        </div>

        {/* Objet */}
        <div className="form-group full-width">
          <label htmlFor="objet" className="required">
            Objet
          </label>
          <input
            type="text"
            id="objet"
            value={formData.objet}
            onChange={(e) => handleChange('objet', e.target.value)}
            className={errors.objet ? 'error' : ''}
            placeholder="Objet de la relance..."
          />
          {errors.objet && <span className="error-message">{errors.objet}</span>}
        </div>

        {/* Message */}
        <div className="form-group full-width">
          <label htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Contenu du message de relance..."
            rows={6}
          />
          <div className="help-text">
            Ce message sera utilisé pour les relances par email ou SMS
          </div>
        </div>

        {/* Aperçu du message */}
        {formData.message && (
          <div className="message-preview">
            <h4>Aperçu du message :</h4>
            <div className="preview-content">
              {formData.message}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/crm/relances')}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : (mode === 'create' ? 'Créer la Relance' : 'Modifier la Relance')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RelanceForm;