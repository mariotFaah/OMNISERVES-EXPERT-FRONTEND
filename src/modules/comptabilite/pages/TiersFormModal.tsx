import React, { useState } from 'react';
import './TiersFormModal.css';
import { comptabiliteApi } from '../services/api';
import type { Tiers } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';

interface Props {
  tiers: Tiers | null;
  onClose: () => void;
  onSave: () => void;
}

// Type pour les données qu'on envoie à l'API
type TiersApiData = Omit<Tiers, 'id_tiers' | 'created_at' | 'updated_at'> & {
  [key: string]: any;
};

export const TiersFormModal: React.FC<Props> = ({ tiers, onClose, onSave }) => {
  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  // État pour le formulaire - tous les champs du backend
  const [form, setForm] = useState<TiersApiData>(
    tiers ? {
      type_tiers: tiers.type_tiers || 'client',
      nom: tiers.nom || '',
      numero: tiers.numero || '',
      siret: tiers.siret || '',
      forme_juridique: tiers.forme_juridique || '',
      secteur_activite: tiers.secteur_activite || '',
      categorie: tiers.categorie || '',
      chiffre_affaires_annuel: tiers.chiffre_affaires_annuel || '',
      effectif: tiers.effectif || '',
      notes: tiers.notes || '',
      site_web: tiers.site_web || '',
      responsable_commercial: tiers.responsable_commercial || '',
      date_premier_contact: tiers.date_premier_contact || '',
      date_derniere_activite: tiers.date_derniere_activite || '',
      adresse: tiers.adresse || '',
      email: tiers.email || '',
      telephone: tiers.telephone || '',
      devise_preferee: tiers.devise_preferee || 'MGA',
    } : {
      type_tiers: 'client',
      nom: '',
      numero: '',
      siret: '',
      forme_juridique: '',
      secteur_activite: '',
      categorie: '',
      chiffre_affaires_annuel: '',
      effectif: '',
      notes: '',
      site_web: '',
      responsable_commercial: '',
      date_premier_contact: '',
      date_derniere_activite: '',
      adresse: '',
      email: '',
      telephone: '',
      devise_preferee: 'MGA',
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis seulement
    if (!form.nom.trim()) {
      alert('Le nom est obligatoire', {
        type: 'warning',
        title: 'Champ manquant'
      });
      return;
    }

    // Validation de l'email si fourni
    if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Veuillez saisir une adresse email valide', {
        type: 'warning',
        title: 'Email invalide'
      });
      return;
    }

    // Validation du numéro de téléphone si fourni
    if (form.telephone && form.telephone.trim() && !/^\+?\d{1,4}[\s\d-]{6,}$/.test(form.telephone)) {
      alert('Veuillez saisir un numéro de téléphone valide', {
        type: 'warning',
        title: 'Téléphone invalide'
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log('📤 Données envoyées:', form);
      
      // Nettoyer les champs vides (convertir en null pour l'API)
      const cleanForm: any = { ...form };
      
      // Pour chaque champ non obligatoire, convertir les chaînes vides en null
      const optionalFields = [
        'siret', 'forme_juridique', 'secteur_activite', 'categorie', 
        'chiffre_affaires_annuel', 'effectif', 'notes', 'site_web',
        'responsable_commercial', 'date_premier_contact', 'date_derniere_activite',
        'email', 'telephone', 'adresse', 'devise_preferee', 'reference'
      ];
      
      optionalFields.forEach(field => {
        if (cleanForm[field] === '' || cleanForm[field] === undefined) {
          cleanForm[field] = null;
        }
      });
      
      if (tiers && tiers.id_tiers) {
        await comptabiliteApi.updateTiers(tiers.id_tiers, cleanForm);
        alert('Client/fournisseur modifié avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      } else if (!tiers) {
        await comptabiliteApi.createTiers(cleanForm);
        alert('Client/fournisseur créé avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      } else {
        throw new Error('Identifiant du tiers manquant');
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
                value={form.nom} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Nom complet de l'entreprise ou personne"
                required
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Numéro</label>
              <input 
                name="numero" 
                value={form.numero} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Numéro d'identification (CLI-001, FRN-001)"
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
                value={form.email} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="contact@entreprise.mg"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Téléphone</label>
              <input 
                name="telephone" 
                value={form.telephone} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="+261 XX XX XXX XX"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Adresse</label>
              <input 
                name="adresse" 
                value={form.adresse} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Adresse complète"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Site web</label>
              <input 
                name="site_web" 
                value={form.site_web} 
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
                value={form.siret} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Numéro SIRET ou NIF"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Forme juridique</label>
              <select 
                name="forme_juridique" 
                value={form.forme_juridique} 
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
                value={form.secteur_activite} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Ex: Import-Export, Commerce, Services..."
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Catégorie</label>
              <input 
                name="categorie" 
                value={form.categorie} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Ex: Grand compte, PME, Particulier..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Informations financières (optionnelles) */}
          <div className="tiers-section">
            <h3 className="tiers-section-title">Informations financières (optionnelles)</h3>
            
            <div className="tiers-form-group">
              <label className="tiers-form-label">Devise préférée</label>
              <select 
                name="devise_preferee" 
                value={form.devise_preferee} 
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
              <label className="tiers-form-label">CA annuel estimé</label>
              <input 
                name="chiffre_affaires_annuel" 
                value={form.chiffre_affaires_annuel} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Ex: 50000000"
                disabled={saving}
              />
            </div>

            <div className="tiers-form-group">
              <label className="tiers-form-label">Effectif</label>
              <input 
                name="effectif" 
                value={form.effectif} 
                onChange={handleChange} 
                className="tiers-form-input"
                placeholder="Nombre d'employés"
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
                value={form.responsable_commercial} 
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
                value={form.date_premier_contact} 
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
                value={form.date_derniere_activite} 
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
                value={form.notes} 
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