import React, { useState, useEffect } from 'react';
import './TiersFormModal.css';
import { comptabiliteApi } from '../services/api';
import type { Tiers, CreateTiersDTO } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';

interface Props {
  tiers: Tiers | null;
  onClose: () => void;
  onSave: () => void;
}

// Type pour les données qu'on envoie à l'API
type TiersFormData = Omit<CreateTiersDTO, 'id_tiers' | 'created_at' | 'updated_at'>;

// Liste des pays avec codes téléphoniques
const countries = [
  { code: 'MG', name: 'Madagascar', phoneCode: '+261', flag: '🇲🇬' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'États-Unis', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Allemagne', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'CN', name: 'Chine', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japon', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'ZA', name: 'Afrique du Sud', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'MU', name: 'Maurice', phoneCode: '+230', flag: '🇲🇺' },
  { code: 'RE', name: 'Réunion', phoneCode: '+262', flag: '🇷🇪' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgique', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225', flag: '🇨🇮' },
  { code: 'ML', name: 'Mali', phoneCode: '+223', flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', phoneCode: '+227', flag: '🇳🇪' },
  { code: 'CM', name: 'Cameroun', phoneCode: '+237', flag: '🇨🇲' },
];

export const TiersFormModal: React.FC<Props> = ({ tiers, onClose, onSave }) => {
  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  // État pour le formulaire - conforme à CreateTiersDTO
  const [form, setForm] = useState<TiersFormData>(
    tiers ? {
      type_tiers: tiers.type_tiers || 'client',
      nom: tiers.nom || '',
      numero: tiers.numero || null,
      siret: tiers.siret || null,
      forme_juridique: tiers.forme_juridique || null,
      secteur_activite: tiers.secteur_activite || null,
      categorie: tiers.categorie || null,
      chiffre_affaires_annuel: tiers.chiffre_affaires_annuel || null,
      effectif: tiers.effectif || null,
      notes: tiers.notes || null,
      site_web: tiers.site_web || null,
      responsable_commercial: tiers.responsable_commercial || null,
      date_premier_contact: tiers.date_premier_contact || null,
      date_derniere_activite: tiers.date_derniere_activite || null,
      adresse: tiers.adresse || null,
      email: tiers.email || null,
      telephone: tiers.telephone || null,
      devise_preferee: tiers.devise_preferee || 'MGA',
    } : {
      type_tiers: 'client',
      nom: '',
      numero: null,
      siret: null,
      forme_juridique: null,
      secteur_activite: null,
      categorie: null,
      chiffre_affaires_annuel: null,
      effectif: null,
      notes: null,
      site_web: null,
      responsable_commercial: null,
      date_premier_contact: null,
      date_derniere_activite: null,
      adresse: null,
      email: null,
      telephone: null,
      devise_preferee: 'MGA',
    }
  );

  const [saving, setSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Madagascar par défaut

  // Initialiser le pays basé sur le numéro existant
  useEffect(() => {
    if (tiers?.telephone) {
      const phone = tiers.telephone;
      // Chercher le pays correspondant au code
      const country = countries.find(c => phone.startsWith(c.phoneCode));
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [tiers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Gestion spéciale pour les champs de type number
    if (type === 'number') {
      const numValue = value === '' ? null : Number(value);
      setForm(prev => ({ ...prev, [name]: numValue }));
    } else {
      // Pour les textes, convertir "" en null
      const cleanedValue = value === '' ? null : value;
      setForm(prev => ({ ...prev, [name]: cleanedValue }));
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = countries.find(c => c.code === countryCode) || countries[0];
    setSelectedCountry(country);
    
    // Si un téléphone existe déjà, on met à jour le préfixe
    if (form.telephone) {
      // Enlever l'ancien préfixe si présent
      let phoneNumber = form.telephone;
      countries.forEach(c => {
        if (phoneNumber?.startsWith(c.phoneCode)) {
          phoneNumber = phoneNumber.substring(c.phoneCode.length).trim();
        }
      });
      
      // Ajouter le nouveau préfixe
      const newPhone = phoneNumber ? `${country.phoneCode} ${phoneNumber}` : country.phoneCode;
      setForm(prev => ({ ...prev, telephone: newPhone }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Si l'utilisateur commence par "+", on recherche le pays correspondant
    if (value.startsWith('+')) {
      const country = countries.find(c => value.startsWith(c.phoneCode));
      if (country) {
        setSelectedCountry(country);
        // On garde le format complet avec espace
        if (value.length === country.phoneCode.length) {
          value = `${country.phoneCode} `;
        }
      }
    }
    
    // Si pas de préfixe, on ajoute celui du pays sélectionné
    if (!value.startsWith('+') && value.trim()) {
      value = `${selectedCountry.phoneCode} ${value}`;
    }
    
    setForm(prev => ({ ...prev, telephone: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis seulement
    if (!form.nom?.trim()) {
      alert('Le nom est obligatoire', {
        type: 'warning',
        title: 'Champ manquant'
      });
      return;
    }

    // Validation de l'email si fourni
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Veuillez saisir une adresse email valide', {
        type: 'warning',
        title: 'Email invalide'
      });
      return;
    }

    // Validation du numéro de téléphone si fourni
    if (form.telephone && !/^\+?\d{1,4}[\s\d-]{6,}$/.test(form.telephone.replace(/\s/g, ''))) {
      alert('Veuillez saisir un numéro de téléphone valide', {
        type: 'warning',
        title: 'Téléphone invalide'
      });
      return;
    }

    // Validation du SIRET si fourni (14 chiffres)
    if (form.siret && !/^\d{14}$/.test(form.siret)) {
      alert('Le SIRET doit contenir exactement 14 chiffres', {
        type: 'warning',
        title: 'SIRET invalide'
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log('📤 Données envoyées:', form);
      
      // Préparer les données pour l'API
      const apiData: any = { ...form };
      
      // Pour la création, certains champs peuvent être null
      if (!tiers) {
        // S'assurer que tous les champs optionnels sont null si vides
        const optionalFields = [
          'numero', 'siret', 'forme_juridique', 'secteur_activite', 'categorie',
          'chiffre_affaires_annuel', 'effectif', 'notes', 'site_web',
          'responsable_commercial', 'date_premier_contact', 'date_derniere_activite',
          'adresse', 'email', 'telephone'
        ];
        
        optionalFields.forEach(field => {
          if (apiData[field] === '' || apiData[field] === undefined) {
            apiData[field] = null;
          }
        });
      }
      
      // Formatage spécial pour les dates
      if (apiData.date_premier_contact && !apiData.date_premier_contact.includes('T')) {
        apiData.date_premier_contact = `${apiData.date_premier_contact}T00:00:00Z`;
      }
      if (apiData.date_derniere_activite && !apiData.date_derniere_activite.includes('T')) {
        apiData.date_derniere_activite = `${apiData.date_derniere_activite}T00:00:00Z`;
      }
      
      if (tiers?.id_tiers) {
        // Pour la mise à jour, on peut utiliser tous les champs
        await comptabiliteApi.updateTiers(tiers.id_tiers, apiData);
        alert('Client/fournisseur modifié avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      } else {
        // Pour la création, on utilise CreateTiersDTO
        await comptabiliteApi.createTiers(apiData);
        alert('Client/fournisseur créé avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      }
      
      // Appeler onSave après un court délai
      setTimeout(async () => {
        try {
          await onSave();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement:', error);
          alert('Les modifications ont été enregistrées mais le rafraîchissement a échoué', {
            type: 'warning',
            title: 'Attention'
          });
        }
      }, 1000);
      
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur inconnue lors de la sauvegarde';
      
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour formater l'affichage du téléphone
  const formatPhoneDisplay = (phone: string | null | undefined) => {
    if (!phone) return '';
    // Retirer le préfixe pour l'affichage dans l'input
    const country = countries.find(c => phone.startsWith(c.phoneCode));
    if (country) {
      return phone.substring(country.phoneCode.length).trim();
    }
    return phone;
  };

  return (
    <div className="tiers-modal-overlay">
      <div className="tiers-modal">
        <div className="tiers-modal-header">
          <h2>{tiers ? 'Modifier' : 'Ajouter'} un client/fournisseur</h2>
          <button 
            type="button" 
            className="tiers-modal-close" 
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Informations de base */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Informations de base</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label required">Type</label>
              <select 
                name="type_tiers" 
                value={form.type_tiers} 
                onChange={handleChange} 
                className="tiers-form-select"
                required
                disabled={saving}
              >
                <option value="client">👤 Client</option>
                <option value="fournisseur">🚚 Fournisseur</option>
              </select>
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label required">Nom</label>
              <input 
                name="nom" 
                value={form.nom || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Nom complet de l'entreprise ou personne"
                required
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Numéro d'identification</label>
              <input 
                name="numero" 
                value={form.numero || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="CLI-001, FRN-001, etc."
                disabled={saving}
              />
            </div>
          </div>

          {/* Coordonnées */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Coordonnées</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">Email</label>
              <input 
                name="email" 
                type="email" 
                value={form.email || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="contact@entreprise.mg"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Téléphone</label>
              <div className="phone-input-container">
                <select 
                  value={selectedCountry.code}
                  onChange={handleCountryChange}
                  className="country-select"
                  disabled={saving}
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.phoneCode})
                    </option>
                  ))}
                </select>
                <input 
                  name="telephone" 
                  value={formatPhoneDisplay(form.telephone)} 
                  onChange={handlePhoneChange} 
                  className="tiers-form-input phone-input"
                  placeholder={`${selectedCountry.phoneCode} XX XX XXX XX`}
                  disabled={saving}
                />
              </div>
              <div className="phone-preview">
                {form.telephone && (
                  <span className="phone-full">
                    📱 Numéro complet: {form.telephone}
                  </span>
                )}
              </div>
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Adresse</label>
              <textarea 
                name="adresse" 
                value={form.adresse || ''} 
                onChange={handleChange} 
                className="tiers-form-textarea"
                placeholder="Adresse complète"
                rows={2}
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Site web</label>
              <input 
                name="site_web" 
                value={form.site_web || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="https://www.entreprise.mg"
                disabled={saving}
              />
            </div>
          </div>

          {/* Informations juridiques (optionnelles) */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Informations juridiques (optionnelles)</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">SIRET/NIF</label>
              <input 
                name="siret" 
                value={form.siret || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="14 chiffres"
                maxLength={14}
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Forme juridique</label>
              <select 
                name="forme_juridique" 
                value={form.forme_juridique || ''} 
                onChange={handleChange} 
                className="tiers-form-select"
                disabled={saving}
              >
                <option value="">Sélectionner...</option>
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                <option value="SAS">SAS</option>
                <option value="SASU">SASU</option>
                <option value="EI">Entreprise Individuelle</option>
                <option value="EURL">EURL</option>
                <option value="SNC">SNC</option>
                <option value="SC">Société Civile</option>
                <option value="association">Association</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Secteur d'activité</label>
              <input 
                name="secteur_activite" 
                value={form.secteur_activite || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Ex: Import-Export, Commerce, Services..."
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Catégorie</label>
              <select 
                name="categorie" 
                value={form.categorie || ''} 
                onChange={handleChange} 
                className="tiers-form-select"
                disabled={saving}
              >
                <option value="">Sélectionner...</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="fournisseur">Fournisseur</option>
                <option value="partenaire">Partenaire</option>
              </select>
            </div>
          </div>

          {/* Informations financières (optionnelles) */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Informations financières (optionnelles)</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">Devise préférée</label>
              <select 
                name="devise_preferee" 
                value={form.devise_preferee || 'MGA'} 
                onChange={handleChange} 
                className="tiers-form-select"
                disabled={saving}
              >
                <option value="MGA">MGA - Ariary Malagasy</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar US</option>
                <option value="GBP">GBP - Livre Sterling</option>
              </select>
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">CA annuel estimé (MGA)</label>
              <input 
                name="chiffre_affaires_annuel" 
                type="number" 
                value={form.chiffre_affaires_annuel || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Ex: 50000000"
                min="0"
                step="1000"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Effectif</label>
              <input 
                name="effectif" 
                type="number" 
                value={form.effectif || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Nombre d'employés"
                min="0"
                disabled={saving}
              />
            </div>
          </div>

          {/* Contacts et suivi (optionnels) */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Contacts et suivi (optionnels)</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">Responsable commercial</label>
              <input 
                name="responsable_commercial" 
                value={form.responsable_commercial || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Nom du contact principal"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Date premier contact</label>
              <input 
                name="date_premier_contact" 
                type="date" 
                value={form.date_premier_contact || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Date dernière activité</label>
              <input 
                name="date_derniere_activite" 
                type="date" 
                value={form.date_derniere_activite || ''} 
                onChange={handleChange} 
                className="tiers-form-input"
                disabled={saving}
              />
            </div>
          </div>

          {/* Notes (optionnelles) */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Notes (optionnelles)</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">Notes internes</label>
              <textarea 
                name="notes" 
                value={form.notes || ''} 
                onChange={handleChange} 
                className="tiers-form-textarea"
                placeholder="Notes, commentaires, informations supplémentaires..."
                rows={3}
                disabled={saving}
              />
            </div>
          </div>

          <div className="tiers-modal-actions">
            <button 
              type="button" 
              className="tiers-cancel-btn" 
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="tiers-save-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="tiers-saving-spinner"></div>
                  {tiers ? 'Modification...' : 'Création...'}
                </>
              ) : (
                tiers ? '💾 Modifier' : '➕ Créer'
              )}
            </button>
          </div>
        </form>
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