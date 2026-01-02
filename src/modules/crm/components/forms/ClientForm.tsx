// src/modules/crm/components/forms/ClientForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import crmApi from '../../services/api';
import './ClientForm.css';

interface ClientFormData {
  // Données de base
  nom: string;
  type_tiers: string;
  raison_sociale: string;
  numero: string;
  adresse: string;
  email: string;
  telephone: string;
  devise_preferee: string;

  // Données CRM étendues
  siret: string;
  forme_juridique: string;
  secteur_activite: string;
  categorie: 'prospect' | 'client' | 'fournisseur' | 'partenaire';
  chiffre_affaires_annuel: number;
  effectif: number;
  notes: string;
  site_web: string;
  responsable_commercial: string;
  date_premier_contact: string;
  date_derniere_activite: string;
}

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClientFormData>({
    // Données de base
    nom: '',
    type_tiers: 'client',
    raison_sociale: '',
    numero: '',
    adresse: '',
    email: '',
    telephone: '',
    devise_preferee: 'MGA',

    // Données CRM étendues
    siret: '',
    forme_juridique: '',
    secteur_activite: '',
    categorie: 'prospect',
    chiffre_affaires_annuel: 0,
    effectif: 0,
    notes: '',
    site_web: '',
    responsable_commercial: '',
    date_premier_contact: new Date().toISOString().split('T')[0],
    date_derniere_activite: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      chargerClient(parseInt(id));
    }
  }, [id]);

  const chargerClient = async (clientId: number) => {
    try {
      setLoading(true);
      const client = await crmApi.getClient(clientId);
      setFormData({
        // Données de base
        nom: client.nom || '',
        type_tiers: client.type_tiers || 'client',
        raison_sociale: client.raison_sociale || '',
        numero: client.numero || '',
        adresse: client.adresse || '',
        email: client.email || '',
        telephone: client.telephone || '',
        devise_preferee: client.devise_preferee || 'MGA',

        // Données CRM étendues
        siret: client.siret || '',
        forme_juridique: client.forme_juridique || '',
        secteur_activite: client.secteur_activite || '',
        categorie: client.categorie || 'prospect',
        chiffre_affaires_annuel: client.chiffre_affaires_annuel || 0,
        effectif: client.effectif || 0,
        notes: client.notes || '',
        site_web: client.site_web || '',
        responsable_commercial: client.responsable_commercial || '',
        date_premier_contact: client.date_premier_contact || new Date().toISOString().split('T')[0],
        date_derniere_activite: client.date_derniere_activite || new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Erreur lors du chargement du client');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (id) {
        // Utiliser updateClientCRM pour les données CRM uniquement
        const crmData = {
          siret: formData.siret,
          forme_juridique: formData.forme_juridique,
          secteur_activite: formData.secteur_activite,
          categorie: formData.categorie,
          chiffre_affaires_annuel: formData.chiffre_affaires_annuel,
          effectif: formData.effectif,
          notes: formData.notes,
          site_web: formData.site_web,
          responsable_commercial: formData.responsable_commercial,
          date_premier_contact: formData.date_premier_contact,
          date_derniere_activite: formData.date_derniere_activite
        };
        await crmApi.updateClientCRM(parseInt(id), crmData);
      } else {
        // Pour la création, utiliser toutes les données
        await crmApi.createClient(formData);
      }
      navigate('/crm/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'chiffre_affaires_annuel' || name === 'effectif' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const categories = [
    { value: 'prospect', label: '🔍 Prospect', icon: '🔍' },
    { value: 'client', label: '💼 Client', icon: '💼' },
    { value: 'fournisseur', label: '🚚 Fournisseur', icon: '🚚' },
    { value: 'partenaire', label: '🤝 Partenaire', icon: '🤝' }
  ];

  const typesTiers = [
    { value: 'client', label: '👥 Client' },
    { value: 'fournisseur', label: '🚚 Fournisseur' },
    { value: 'autre', label: '🏢 Autre' }
  ];

  const devises = [
    { value: 'MGA', label: '🇲🇬 Ariary Malgache (MGA)' },
    { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
    { value: 'USD', label: '🇺🇸 Dollar US (USD)' }
  ];

  const formesJuridiques = [
    'SARL', 'SAS', 'SASU', 'SA', 'SNC', 'SCP', 'EI', 'EURL', 'Auto-entrepreneur', 'Association', 'Autre'
  ];

  const secteursActivite = [
    'Informatique & Digital',
    'Commerce & Retail',
    'Industrie & Manufacturing',
    'Santé & Médical',
    'Finance & Assurance',
    'Immobilier',
    'Construction & BTP',
    'Transport & Logistique',
    'Restauration & Hôtellerie',
    'Consulting & Services',
    'Éducation & Formation',
    'Autre'
  ];

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement du client...</span>
      </div>
    );
  }

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <button 
            className="ms-crm-back-button"
            onClick={() => navigate('/crm/clients')}
            type="button"
          >
            <span className="ms-crm-back-icon">←</span>
            Retour aux clients
          </button>
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">
              {id ? '✏️ Modifier le client' : '👥 Nouveau client'}
            </h1>
            {error && (
              <div className="ms-crm-error-banner">
                <span className="ms-crm-error-icon">⚠</span>
                {error}
              </div>
            )}
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <button 
            type="button" 
            onClick={() => navigate('/crm/clients')}
            className="ms-crm-btn ms-crm-btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="client-form"
            className="ms-crm-btn ms-crm-btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="ms-crm-spinner-small"></span>
                Sauvegarde...
              </>
            ) : (
              id ? '💾 Mettre à jour' : '➕ Créer le client'
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        <form id="client-form" onSubmit={handleSubmit} className="ms-crm-form">
          <div className="ms-crm-form-layout">
            
            {/* Left Column - Main Form */}
            <div className="ms-crm-form-main">
              
              {/* Informations de base Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">🏢 Informations de base</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-form-grid">
                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="nom">
                        Nom <span className="ms-crm-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        className="ms-crm-input"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Nom du client"
                        required
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="raison_sociale">
                        Raison sociale
                      </label>
                      <input
                        type="text"
                        id="raison_sociale"
                        name="raison_sociale"
                        className="ms-crm-input"
                        value={formData.raison_sociale}
                        onChange={handleChange}
                        placeholder="Raison sociale complète"
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="type_tiers">
                        Type de tiers
                      </label>
                      <select
                        id="type_tiers"
                        name="type_tiers"
                        className="ms-crm-select"
                        value={formData.type_tiers}
                        onChange={handleChange}
                      >
                        {typesTiers.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="numero">
                        Numéro de référence
                      </label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        className="ms-crm-input"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="Référence interne"
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="email">
                        📧 Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="ms-crm-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@entreprise.com"
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="telephone">
                        📞 Téléphone
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        className="ms-crm-input"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="+261 34 12 345 67"
                      />
                    </div>

                    <div className="ms-crm-field-group ms-crm-field-full">
                      <label className="ms-crm-label" htmlFor="adresse">
                        📍 Adresse
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        name="adresse"
                        className="ms-crm-input"
                        value={formData.adresse}
                        onChange={handleChange}
                        placeholder="Adresse complète"
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="devise_preferee">
                        💰 Devise préférée
                      </label>
                      <select
                        id="devise_preferee"
                        name="devise_preferee"
                        className="ms-crm-select"
                        value={formData.devise_preferee}
                        onChange={handleChange}
                      >
                        {devises.map(devise => (
                          <option key={devise.value} value={devise.value}>
                            {devise.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catégorisation CRM Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">📊 Catégorisation CRM</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-form-grid">
                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="categorie">
                        Catégorie CRM <span className="ms-crm-required">*</span>
                      </label>
                      <select
                        id="categorie"
                        name="categorie"
                        className="ms-crm-select"
                        value={formData.categorie}
                        onChange={handleChange}
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="responsable_commercial">
                        👤 Responsable commercial
                      </label>
                      <input
                        type="text"
                        id="responsable_commercial"
                        name="responsable_commercial"
                        className="ms-crm-input"
                        value={formData.responsable_commercial}
                        onChange={handleChange}
                        placeholder="Nom du responsable"
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="date_premier_contact">
                        📅 Premier contact
                      </label>
                      <input
                        type="date"
                        id="date_premier_contact"
                        name="date_premier_contact"
                        className="ms-crm-input"
                        value={formData.date_premier_contact}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="date_derniere_activite">
                        📅 Dernière activité
                      </label>
                      <input
                        type="date"
                        id="date_derniere_activite"
                        name="date_derniere_activite"
                        className="ms-crm-input"
                        value={formData.date_derniere_activite}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations légales Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">⚖️ Informations légales</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-form-grid">
                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="siret">
                        🏷️ SIRET
                      </label>
                      <input
                        type="text"
                        id="siret"
                        name="siret"
                        className="ms-crm-input"
                        value={formData.siret}
                        onChange={handleChange}
                        placeholder="123 456 789 01234"
                        maxLength={14}
                      />
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="forme_juridique">
                        📝 Forme juridique
                      </label>
                      <select
                        id="forme_juridique"
                        name="forme_juridique"
                        className="ms-crm-select"
                        value={formData.forme_juridique}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez une forme</option>
                        {formesJuridiques.map(forme => (
                          <option key={forme} value={forme}>{forme}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="secteur_activite">
                        🏭 Secteur d'activité
                      </label>
                      <select
                        id="secteur_activite"
                        name="secteur_activite"
                        className="ms-crm-select"
                        value={formData.secteur_activite}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez un secteur</option>
                        {secteursActivite.map(secteur => (
                          <option key={secteur} value={secteur}>{secteur}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="site_web">
                        🌐 Site web
                      </label>
                      <input
                        type="url"
                        id="site_web"
                        name="site_web"
                        className="ms-crm-input"
                        value={formData.site_web}
                        onChange={handleChange}
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Données commerciales Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">💼 Données commerciales</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-form-grid">
                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="chiffre_affaires_annuel">
                        💰 Chiffre d'affaires annuel
                      </label>
                      <div className="ms-crm-currency-input">
                        <input
                          type="number"
                          id="chiffre_affaires_annuel"
                          name="chiffre_affaires_annuel"
                          className="ms-crm-input"
                          value={formData.chiffre_affaires_annuel}
                          onChange={handleChange}
                          min="0"
                          step="1000"
                          placeholder="0"
                        />
                        <span className="ms-crm-currency-symbol">{formData.devise_preferee}</span>
                      </div>
                    </div>

                    <div className="ms-crm-field-group">
                      <label className="ms-crm-label" htmlFor="effectif">
                        👥 Effectif
                      </label>
                      <input
                        type="number"
                        id="effectif"
                        name="effectif"
                        className="ms-crm-input"
                        value={formData.effectif}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">📝 Notes</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-field-group">
                    <label className="ms-crm-label" htmlFor="notes">
                      Informations complémentaires
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="ms-crm-textarea"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Notes importantes, informations complémentaires, historique..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="ms-crm-form-sidebar">
              
              {/* Résumé Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h3 className="ms-crm-card-title">📋 Résumé</h3>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-summary">
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">Type:</span>
                      <span className="ms-crm-summary-value">
                        {typesTiers.find(t => t.value === formData.type_tiers)?.label || 'Non défini'}
                      </span>
                    </div>
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">Catégorie:</span>
                      <span className="ms-crm-summary-value">
                        {categories.find(c => c.value === formData.categorie)?.icon} {formData.categorie}
                      </span>
                    </div>
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">Contact:</span>
                      <span className="ms-crm-summary-value">
                        {formData.email || formData.telephone ? '📞 Disponible' : '❌ Non renseigné'}
                      </span>
                    </div>
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">SIRET:</span>
                      <span className="ms-crm-summary-value">
                        {formData.siret ? '✅ Renseigné' : '❌ Manquant'}
                      </span>
                    </div>
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">CA Annuel:</span>
                      <span className="ms-crm-summary-value">
                        {formData.chiffre_affaires_annuel 
                          ? `${formData.chiffre_affaires_annuel.toLocaleString('fr-MG')} ${formData.devise_preferee}`
                          : '💰 Non renseigné'
                        }
                      </span>
                    </div>
                    <div className="ms-crm-summary-item">
                      <span className="ms-crm-summary-label">Effectif:</span>
                      <span className="ms-crm-summary-value">
                        {formData.effectif 
                          ? `${formData.effectif} personne${formData.effectif > 1 ? 's' : ''}`
                          : '👥 Non renseigné'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h3 className="ms-crm-card-title">⚡ Actions rapides</h3>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-quick-actions">
                    <button
                      type="submit"
                      form="client-form"
                      className="ms-crm-btn ms-crm-btn-primary ms-crm-btn-block"
                      disabled={saving}
                    >
                      {saving ? '💾 Sauvegarde...' : (id ? '📝 Mettre à jour' : '➕ Créer le client')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => navigate('/crm/clients')}
                      className="ms-crm-btn ms-crm-btn-secondary ms-crm-btn-block"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Card */}
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h3 className="ms-crm-card-title">✅ Validation</h3>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-validation">
                    <div className="ms-crm-validation-item">
                      <span className={`ms-crm-validation-icon ${formData.nom ? 'valid' : 'invalid'}`}>
                        {formData.nom ? '✅' : '❌'}
                      </span>
                      <span className="ms-crm-validation-text">Nom renseigné</span>
                    </div>
                    <div className="ms-crm-validation-item">
                      <span className={`ms-crm-validation-icon ${formData.categorie ? 'valid' : 'invalid'}`}>
                        {formData.categorie ? '✅' : '❌'}
                      </span>
                      <span className="ms-crm-validation-text">Catégorie sélectionnée</span>
                    </div>
                    <div className="ms-crm-validation-item">
                      <span className={`ms-crm-validation-icon ${formData.email || formData.telephone ? 'valid' : 'warning'}`}>
                        {formData.email || formData.telephone ? '✅' : '⚠️'}
                      </span>
                      <span className="ms-crm-validation-text">Contact renseigné</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;