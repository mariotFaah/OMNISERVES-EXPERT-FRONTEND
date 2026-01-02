import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Facture, Tiers, Article, LigneFacture } from '../types';
import { comptabiliteApi } from '../services/api';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './FactureEditPage.css';

const ENTREPRISE_INFO = {
  nom: 'OMNISERVE EXPERTS',
  adresse: '2239 Ambodisaina Ivondro Tamatave',
  telephone: '+261 32 77 531 69',
  email: 'contact@omniserve.experts'
};

// Définir le type pour formData
interface FormDataState {
  facture: {
    date: string;
    type_facture: 'facture' | 'proforma' | 'avoir';
    id_tiers: number;
    echeance: string;
    reglement: 'virement' | 'cheque' | 'espece' | 'carte';
    statut: Facture['statut'];
    notes: string;
  };
  lignes: Array<{
    code_article: string;
    description: string;
    quantite: number;
    prix_unitaire: number;
    taux_tva: number;
    remise: number;
  }>;
}

// Type pour les lignes avec calculs
interface LigneAvecCalculs {
  code_article: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  remise: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
}

export const FactureEditPage: React.FC = () => {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [tiers, setTiers] = useState<Tiers[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormDataState | null>(null);

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    if (numero) {
      loadData();
    }
  }, [numero]);

  // Fonction pour formater les dates correctement pour l'input date
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [factureData, tiersData, articlesData] = await Promise.all([
        comptabiliteApi.getFacture(parseInt(numero!)),
        comptabiliteApi.getTiers(),
        comptabiliteApi.getArticles()
      ]);

      setFacture(factureData);
      setTiers(tiersData);
      setArticles(articlesData);

      // Initialiser les données du formulaire avec dates formatées
      setFormData({
        facture: {
          date: formatDateForInput(factureData.date),
          type_facture: factureData.type_facture,
          id_tiers: factureData.id_tiers,
          echeance: formatDateForInput(factureData.echeance),
          reglement: factureData.reglement,
          statut: factureData.statut,
          notes: factureData.notes || ''
        },
        lignes: factureData.lignes?.map((ligne: LigneFacture) => ({
          code_article: ligne.code_article,
          description: ligne.description,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          taux_tva: ligne.taux_tva,
          remise: ligne.remise
        })) || []
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données', {
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFactureChange = (field: keyof FormDataState['facture'], value: any) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        facture: { ...prev.facture, [field]: value }
      };
    });
  };

  const handleLigneChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      const newLignes = [...prev.lignes];
      newLignes[index] = { ...newLignes[index], [field]: value };
      
      // Si l'article change, mettre à jour la description et le prix
      if (field === 'code_article' && value) {
        const article = articles.find(a => a.code_article === value);
        if (article) {
          newLignes[index].description = article.description;
          newLignes[index].prix_unitaire = article.prix_unitaire;
          newLignes[index].taux_tva = article.taux_tva;
        }
      }
      
      return { ...prev, lignes: newLignes };
    });
  };

  const addLigne = () => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        lignes: [
          ...prev.lignes,
          {
            code_article: '',
            description: '',
            quantite: 1,
            prix_unitaire: 0,
            taux_tva: 20,
            remise: 0
          }
        ]
      };
    });
  };

  const removeLigne = (index: number) => {
    setFormData(prev => {
      if (!prev || prev.lignes.length <= 1) return prev;
      return {
        ...prev,
        lignes: prev.lignes.filter((_, i) => i !== index)
      };
    });
  };

  // Validation améliorée des lignes
  const validateLignes = (lignes: FormDataState['lignes']) => {
    const errors: string[] = [];
    
    lignes.forEach((ligne, index) => {
      if (!ligne.code_article) {
        errors.push(`Ligne ${index + 1}: Article manquant`);
      }
      if (ligne.quantite <= 0) {
        errors.push(`Ligne ${index + 1}: Quantité invalide`);
      }
      if (ligne.prix_unitaire < 0) {
        errors.push(`Ligne ${index + 1}: Prix unitaire invalide`);
      }
      if (ligne.remise < 0 || ligne.remise > 100) {
        errors.push(`Ligne ${index + 1}: Remise doit être entre 0% et 100%`);
      }
    });
    
    return errors;
  };

  // Calcul des totaux pour l'affichage en temps réel
  const calculateTotals = () => {
    if (!formData) return { totalHT: 0, totalTVA: 0, totalTTC: 0, lignesAvecCalculs: [] as LigneAvecCalculs[] };

    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    const lignesAvecCalculs: LigneAvecCalculs[] = formData.lignes.map((ligne) => {
      const montantHTSansRemise = ligne.prix_unitaire * ligne.quantite;
      const montantRemise = montantHTSansRemise * (ligne.remise / 100);
      const montantHT = montantHTSansRemise - montantRemise;
      const montantTVA = montantHT * (ligne.taux_tva / 100);
      const montantTTC = montantHT + montantTVA;

      totalHT += montantHT;
      totalTVA += montantTVA;
      totalTTC += montantTTC;

      return {
        ...ligne,
        montant_ht: parseFloat(montantHT.toFixed(2)),
        montant_tva: parseFloat(montantTVA.toFixed(2)),
        montant_ttc: parseFloat(montantTTC.toFixed(2))
      };
    });

    return { 
      totalHT: parseFloat(totalHT.toFixed(2)), 
      totalTVA: parseFloat(totalTVA.toFixed(2)), 
      totalTTC: parseFloat(totalTTC.toFixed(2)), 
      lignesAvecCalculs 
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !facture) return;

    // Validation du numéro de facture
    if (!facture.numero_facture) {
      alert('Erreur: Numéro de facture manquant', {
        type: 'error',
        title: 'Erreur'
      });
      return;
    }

    // Validation du tiers
    if (!formData.facture.id_tiers || formData.facture.id_tiers === 0) {
      alert('Veuillez sélectionner un client ou fournisseur', {
        type: 'warning',
        title: 'Sélection requise'
      });
      return;
    }

    // Validation des dates
    if (!formData.facture.date) {
      alert('Veuillez saisir une date de facturation', {
        type: 'warning',
        title: 'Date manquante'
      });
      return;
    }

    if (!formData.facture.echeance) {
      alert('Veuillez saisir une date d\'échéance', {
        type: 'warning',
        title: 'Date manquante'
      });
      return;
    }

    // Validation des lignes
    const lignesValides = formData.lignes.filter((ligne) => 
      ligne.code_article && ligne.quantite > 0 && ligne.prix_unitaire >= 0
    );
    
    if (lignesValides.length === 0) {
      alert('Veuillez ajouter au moins un article avec une quantité valide', {
        type: 'warning',
        title: 'Articles manquants'
      });
      return;
    }

    // Validation améliorée
    const validationErrors = validateLignes(lignesValides);
    if (validationErrors.length > 0) {
      alert(`Erreurs de validation:\n${validationErrors.join('\n')}`, {
        type: 'error',
        title: 'Erreurs de validation'
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData.facture,
        lignes: lignesValides
      };

      console.log('Données de modification envoyées:', payload);

      // 🔥 CORRECTION : Appel API pour mettre à jour la facture
      await comptabiliteApi.updateFacture(facture.numero_facture, payload);
      
      alert('Facture modifiée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      
      // 🔥 CORRECTION : Navigation vers la page de détail pour voir les données fraîches
      navigate(`/comptabilite/factures/${facture.numero_facture}`);
      
    } catch (error: any) {
      console.error('Erreur modification facture:', error);
      alert(`Erreur: ${error.message || 'Erreur lors de la modification'}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setSaving(false);
    }
  };

  const annulerModification = () => {
    if (!facture) return;
    
    // Utilisation de confirm natif pour la confirmation d'annulation
    if (window.confirm('Voulez-vous vraiment annuler les modifications ?')) {
      navigate(`/comptabilite/factures/${facture.numero_facture}`);
    }
  };

  if (loading || !formData) {
    return (
      <div className="facture-edit-loading">
        <div className="facture-edit-loading-text">Chargement de la facture...</div>
        <div className="facture-edit-loading-spinner"></div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="facture-edit-error">
        <div className="facture-edit-error-text">Facture non trouvée</div>
        <Link to="/comptabilite/factures" className="facture-edit-back-button">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const selectedTier = tiers.find(t => t.id_tiers === formData.facture.id_tiers);
  const { totalHT, totalTVA, totalTTC, lignesAvecCalculs } = calculateTotals();

  return (
    <div className="facture-edit-page">
      {/* En-tête de page */}
      <div className="facture-edit-header">
        <div>
          <h1 className="facture-edit-title">
            Modifier la Facture #{facture.numero_facture}
          </h1>
          <p className="facture-edit-subtitle">
            Modifiez les informations de la facture
          </p>
        </div>
        <div className="facture-edit-actions">
          <Link
            to={`/comptabilite/factures/${facture.numero_facture}`}
            className="facture-edit-cancel-button"
          >
            ← Annuler
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="facture-edit-save-button"
          >
            {saving ? (
              <>
                <div className="facture-edit-saving-spinner"></div>
                Sauvegarde...
              </>
            ) : (
              '💾 Sauvegarder'
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="facture-edit-form">
        {/* En-tête Facture */}
        <div className="facture-edit-header-info">
          <div>
            <h2 className="facture-edit-doc-title">FACTURE</h2>
            <div className="facture-edit-info">
              <div><strong>N° Facture:</strong> {facture.numero_facture}</div>
              <div><strong>Statut actuel:</strong> 
                <span className={`facture-edit-statut ${facture.statut}`}>
                  {facture.statut}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="facture-edit-section-title">Entreprise</h3>
            <div className="facture-edit-entreprise-info">
              <div><strong>Nom:</strong> {ENTREPRISE_INFO.nom}</div>
              <div><strong>Adresse:</strong> {ENTREPRISE_INFO.adresse}</div>
              <div><strong>Tel:</strong> {ENTREPRISE_INFO.telephone}</div>
              <div><strong>Email:</strong> {ENTREPRISE_INFO.email}</div>
            </div>
          </div>
          
          <div>
            <h3 className="facture-edit-section-title">
              {selectedTier?.type_tiers === 'fournisseur' ? 'Fournisseur' : 'Client'}
            </h3>
            <select
              value={formData.facture.id_tiers}
              onChange={(e) => handleFactureChange('id_tiers', parseInt(e.target.value))}
              className="facture-edit-client-select"
              required
            >
              <option value={0}>Sélectionner un client/fournisseur</option>
              {tiers.map(tier => (
                <option key={tier.id_tiers} value={tier.id_tiers}>
                  {tier.type_tiers === 'fournisseur' ? '🚚 ' : '👤 '}
                  {tier.nom} - {tier.numero} 
                  ({tier.type_tiers})
                </option>
              ))}
            </select>
            
            {selectedTier && (
              <div className="facture-edit-client-details">
                <div><strong>Type:</strong> {selectedTier.type_tiers}</div>
                <div><strong>Nom:</strong> {selectedTier.nom}</div>
                <div><strong>Adresse:</strong> {selectedTier.adresse}</div>
                <div><strong>Tel:</strong> {selectedTier.telephone}</div>
                <div><strong>Email:</strong> {selectedTier.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Informations facture */}
        <div className="facture-edit-details">
          <div className="facture-edit-field">
            <label className="facture-edit-label">
              Date de facturation *
            </label>
            <input
              type="date"
              value={formData.facture.date}
              onChange={(e) => handleFactureChange('date', e.target.value)}
              className="facture-edit-input"
              required
            />
          </div>
          
          <div className="facture-edit-field">
            <label className="facture-edit-label">
              Type de document
            </label>
            <select
              value={formData.facture.type_facture}
              onChange={(e) => handleFactureChange('type_facture', e.target.value)}
              className="facture-edit-select"
            >
              <option value="facture">Facture</option>
              <option value="proforma">Proforma</option>
              <option value="avoir">Avoir</option>
            </select>
          </div>
          
          <div className="facture-edit-field">
            <label className="facture-edit-label">
              Mode de règlement
            </label>
            <select
              value={formData.facture.reglement}
              onChange={(e) => handleFactureChange('reglement', e.target.value)}
              className="facture-edit-select"
            >
              <option value="virement">Virement</option>
              <option value="cheque">Chèque</option>
              <option value="espece">Espèce</option>
              <option value="carte">Carte</option>
            </select>
          </div>
          
          <div className="facture-edit-field">
            <label className="facture-edit-label">
              Date d'échéance *
            </label>
            <input
              type="date"
              value={formData.facture.echeance}
              onChange={(e) => handleFactureChange('echeance', e.target.value)}
              className="facture-edit-input"
              required
            />
          </div>

          <div className="facture-edit-field">
            <label className="facture-edit-label">
              Statut
            </label>
            <select
              value={formData.facture.statut}
              onChange={(e) => handleFactureChange('statut', e.target.value)}
              className="facture-edit-select"
            >
              <option value="brouillon">Brouillon</option>
              <option value="validee">Validée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="facture-edit-articles-section">
          <div className="facture-edit-articles-header">
            <h3 className="facture-edit-articles-title">Articles et Services</h3>
            <button
              type="button"
              onClick={addLigne}
              className="facture-edit-add-button"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div className="facture-edit-table-container">
            <table className="facture-edit-table">
              <thead>
                <tr>
                  <th>Référence *</th>
                  <th>Libellé</th>
                  <th>PU *</th>
                  <th>Quantité *</th>
                  <th>Remise %</th>
                  <th>Montant HT</th>
                  <th>TVA %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lignesAvecCalculs.map((ligne, index) => (
                  <tr key={index} className="facture-edit-ligne">
                    <td className="facture-edit-cell">
                      <select
                        value={ligne.code_article}
                        onChange={(e) => handleLigneChange(index, 'code_article', e.target.value)}
                        className="facture-edit-article-select"
                        required
                      >
                        <option value="">Sélectionner</option>
                        {articles.map(article => (
                          <option key={article.code_article} value={article.code_article}>
                            {article.code_article} - {article.description}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="facture-edit-cell">
                      <input
                        type="text"
                        value={ligne.description}
                        onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                        className="facture-edit-input"
                        placeholder="Description de l'article"
                        required
                      />
                    </td>

                    <td className="facture-edit-cell">
                      <input
                        type="number"
                        value={ligne.prix_unitaire}
                        onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                        className="facture-edit-input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>

                    <td className="facture-edit-cell">
                      <input
                        type="number"
                        value={ligne.quantite}
                        onChange={(e) => handleLigneChange(index, 'quantite', parseFloat(e.target.value) || 0)}
                        className="facture-edit-input"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </td>

                    <td className="facture-edit-cell">
                      <input
                        type="number"
                        value={ligne.remise}
                        onChange={(e) => handleLigneChange(index, 'remise', parseFloat(e.target.value) || 0)}
                        className="facture-edit-input"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>

                    <td className="facture-edit-cell">
                      <div className="facture-edit-montant-ht">
                        {ligne.montant_ht.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} Ar
                      </div>
                    </td>

                    <td className="facture-edit-cell">
                      <select
                        value={ligne.taux_tva}
                        onChange={(e) => handleLigneChange(index, 'taux_tva', parseFloat(e.target.value))}
                        className="facture-edit-tva-select"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                      </select>
                    </td>

                    <td className="facture-edit-cell">
                      {formData.lignes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLigne(index)}
                          className="facture-edit-remove-button"
                          title="Supprimer cette ligne"
                        >
                          ❌
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="facture-edit-totals">
          <div className="facture-edit-totals-grid">
            <div className="facture-edit-total-group">
              <div className="facture-edit-total-row">
                <span>Total HT:</span>
                <span className="facture-edit-total-value">
                  {totalHT.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Ar
                </span>
              </div>
              
              <div className="facture-edit-total-row">
                <span>Total TVA:</span>
                <span className="facture-edit-total-value">
                  {totalTVA.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Ar
                </span>
              </div>
              
              <div className="facture-edit-total-row facture-edit-total-ttc">
                <span>Total TTC:</span>
                <span className="facture-edit-total-value">
                  {totalTTC.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Ar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="facture-edit-notes">
          <label className="facture-edit-label">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.facture.notes}
            onChange={(e) => handleFactureChange('notes', e.target.value)}
            className="facture-edit-textarea"
            placeholder="Notes supplémentaires..."
            rows={3}
          />
        </div>

        {/* Boutons d'action */}
        <div className="facture-edit-form-actions">
          <button
            type="button"
            onClick={annulerModification}
            className="facture-edit-cancel-form-button"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="facture-edit-submit-button"
          >
            {saving ? (
              <>
                <div className="facture-edit-saving-spinner"></div>
                Sauvegarde en cours...
              </>
            ) : (
              'Sauvegarder les modifications'
            )}
          </button>
        </div>
      </form>

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

export default FactureEditPage;