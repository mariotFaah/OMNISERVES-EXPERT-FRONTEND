// src/modules/crm/components/forms/ContactForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi } from '../../services/api';
import type { Contact, ContactFormData, Client } from '../../types';

interface ContactFormProps {
  mode?: 'create' | 'edit';
}

const ContactForm: React.FC<ContactFormProps> = ({ mode = 'create' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<ContactFormData>({
    tiers_id: 0,
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    principal: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  useEffect(() => {
    loadInitialData();
  }, [id, mode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const clientsData = await crmApi.getClients();
      setClients(clientsData);

      if (mode === 'edit' && id) {
        const contactData: Contact = await crmApi.getContact(parseInt(id));
        setCurrentContact(contactData);
        setFormData({
          tiers_id: contactData.tiers_id,
          nom: contactData.nom,
          prenom: contactData.prenom || '',
          fonction: contactData.fonction || '',
          email: contactData.email || '',
          telephone: contactData.telephone || '',
          principal: contactData.principal,
          notes: contactData.notes || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setErrors({ tiers_id: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.tiers_id || formData.tiers_id === 0) {
      newErrors.tiers_id = 'Le client est requis';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.telephone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
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
      setSuccessMessage('');
      
      const submitData = {
        ...formData,
        tiers_id: formData.tiers_id
      };

      if (mode === 'create') {
        const newContact: Contact = await crmApi.createContact(submitData);
        console.log('Contact créé avec succès:', newContact);
        setSuccessMessage('Contact créé avec succès !');
        
        // Rediriger après un court délai pour montrer le message de succès
        setTimeout(() => {
          navigate('/crm/contacts');
        }, 1500);
        
      } else if (mode === 'edit' && id) {
        const updatedContact: Contact = await crmApi.updateContact(parseInt(id), submitData);
        console.log('Contact modifié avec succès:', updatedContact);
        setSuccessMessage('Contact modifié avec succès !');
        
        // Mettre à jour le contact courant avec les nouvelles données
        setCurrentContact(updatedContact);
        
        // Rediriger après un court délai pour montrer le message de succès
        setTimeout(() => {
          navigate('/crm/contacts');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde contact:', error);
      setErrors({ tiers_id: 'Erreur lors de la sauvegarde du contact' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                      name === 'tiers_id' ? parseInt(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Effacer le message de succès quand l'utilisateur modifie le formulaire
    if (successMessage) {
      setSuccessMessage('');
    }

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getContactInfo = () => {
    if (mode === 'edit' && currentContact) {
      return (
        <div className="ms-edit-info">
          <span className="ms-info-text">
            Créé le {new Date(currentContact.created_at).toLocaleDateString()}
            {currentContact.updated_at !== currentContact.created_at && (
              <> • Modifié le {new Date(currentContact.updated_at).toLocaleDateString()}</>
            )}
          </span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="ms-form-container">
        <div className="ms-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="ms-form-container">
      <div className="ms-form-header">
        <div className="ms-header-left">
          <h1 className="ms-form-title">
            {mode === 'create' ? 'Nouveau contact' : 'Modifier le contact'}
          </h1>
          {getContactInfo()}
        </div>
        <div className="ms-header-actions">
          <button 
            type="button" 
            onClick={() => navigate('/crm/contacts')}
            className="ms-btn ms-btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="contact-form"
            className="ms-btn ms-btn-primary"
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : (mode === 'create' ? 'Créer' : 'Mettre à jour')}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="ms-success-message">
          <span className="ms-success-icon">✓</span>
          {successMessage}
        </div>
      )}

      <form id="contact-form" onSubmit={handleSubmit} className="ms-form">
        <div className="ms-form-sections">
          {/* Section Informations générales */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Informations générales</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="tiers_id">
                    Client <span className="ms-required">*</span>
                  </label>
                  <select
                    id="tiers_id"
                    name="tiers_id"
                    className={`ms-field-input ${errors.tiers_id ? 'ms-field-error' : ''}`}
                    value={formData.tiers_id}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value={0}>Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id_tiers} value={client.id_tiers}>
                        {client.raison_sociale || client.nom} - {client.email}
                      </option>
                    ))}
                  </select>
                  {errors.tiers_id && <div className="ms-error-text">{errors.tiers_id}</div>}
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="fonction">
                    Fonction
                  </label>
                  <input
                    type="text"
                    id="fonction"
                    name="fonction"
                    className="ms-field-input"
                    value={formData.fonction}
                    onChange={handleChange}
                    placeholder="ex: Directeur Commercial, Responsable Achat..."
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="nom">
                    Nom <span className="ms-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    className={`ms-field-input ${errors.nom ? 'ms-field-error' : ''}`}
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Entrez le nom du contact"
                    disabled={saving}
                  />
                  {errors.nom && <div className="ms-error-text">{errors.nom}</div>}
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="prenom">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    className="ms-field-input"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Entrez le prénom du contact"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Coordonnées */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Coordonnées</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`ms-field-input ${errors.email ? 'ms-field-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@entreprise.com"
                    disabled={saving}
                  />
                  {errors.email && <div className="ms-error-text">{errors.email}</div>}
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="telephone">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    className={`ms-field-input ${errors.telephone ? 'ms-field-error' : ''}`}
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+261 34 12 345 67"
                    disabled={saving}
                  />
                  {errors.telephone && <div className="ms-error-text">{errors.telephone}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Section Paramètres */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Paramètres</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <div className="ms-checkbox-field">
                  <label className="ms-checkbox-label">
                    <input
                      type="checkbox"
                      name="principal"
                      checked={formData.principal}
                      onChange={handleChange}
                      className="ms-checkbox-input"
                      disabled={saving}
                    />
                    <span className="ms-checkbox-checkmark"></span>
                    Contact principal
                  </label>
                  <div className="ms-checkbox-help">
                    Ce contact sera utilisé comme interlocuteur principal pour ce client
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Notes */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Notes</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="notes">
                  Informations supplémentaires
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="ms-field-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Informations supplémentaires sur ce contact..."
                  rows={4}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;