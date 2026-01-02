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
type TiersApiData = Omit<Tiers, 'id_tiers' | 'created_at' | 'updated_at'>;

export const TiersFormModal: React.FC<Props> = ({ tiers, onClose, onSave }) => {
  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  // État pour le formulaire - seulement les champs éditables
  const [form, setForm] = useState<TiersApiData>(
    tiers ? {
      type_tiers: tiers.type_tiers,
      nom: tiers.nom,
      numero: tiers.numero,
      adresse: tiers.adresse,
      email: tiers.email,
      telephone: tiers.telephone,
      reference: tiers.reference,
    } : {
      type_tiers: 'client',
      nom: '',
      numero: '',
      adresse: '',
      email: '',
      telephone: '',
      reference: '',
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!form.nom.trim()) {
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
    if (form.telephone && !/^\+?\d{1,4}[\s\d-]{6,}$/.test(form.telephone)) {
      alert('Veuillez saisir un numéro de téléphone valide', {
        type: 'warning',
        title: 'Téléphone invalide'
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log('📤 Données envoyées:', form);
      
      if (tiers && tiers.id_tiers) {
        await comptabiliteApi.updateTiers(tiers.id_tiers, form);
        alert('Client/fournisseur modifié avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      } else if (!tiers) {
        await comptabiliteApi.createTiers(form);
        alert('Client/fournisseur créé avec succès!', {
          type: 'success',
          title: 'Succès'
        });
      } else {
        throw new Error('Identifiant du tiers manquant');
      }
      
      // Appeler onSave après un court délai pour laisser voir le message de succès
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
      
      // Message d'erreur plus spécifique
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
          <div className="tiers-form-group">
            <label className="tiers-form-label">Type *</label>
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
            <label className="tiers-form-label">Nom *</label>
            <input 
              name="nom" 
              value={form.nom} 
              onChange={handleChange} 
              className="tiers-form-input"
              placeholder="Nom complet"
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
              placeholder="Numéro d'identification"
              disabled={saving}
            />
          </div>

          <div className="tiers-form-group">
            <label className="tiers-form-label">Email</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              className="tiers-form-input"
              placeholder="email@exemple.com"
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