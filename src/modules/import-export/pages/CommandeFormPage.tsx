import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import { comptabiliteApi } from '../../comptabilite/services/api';
import type { CommandeFormData, LigneCommandeFormData, Article } from '../types';
import type { Tiers as ComptabiliteTiers } from '../../comptabilite/types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import {
  FiPlus,
  FiMinus,
  FiSave,
  FiX,
  FiArrowLeft,
  FiDownload,
  
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiFileText,
  FiXCircle
} from 'react-icons/fi';
import './CommandeFormPage.css';

// Interface unifiée pour résoudre le conflit
interface UnifiedTiers {
  id: number;
  nom: string;
  type_tiers: 'client' | 'fournisseur';
  email?: string;
  telephone?: string;
  adresse?: string;
}

// Types de statuts selon la documentation
type StatutCommande = 'brouillon' | 'confirmée' | 'expédiée' | 'livrée' | 'annulée';

const CommandeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState<UnifiedTiers[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();
  
  const [formData, setFormData] = useState<CommandeFormData & { statut: StatutCommande }>({
    type: 'import',
    client_id: 0,
    fournisseur_id: 0,
    date_commande: new Date().toISOString().split('T')[0],
    devise: 'EUR',
    statut: 'brouillon',
    lignes: []
  });

  const [lignes, setLignes] = useState<LigneCommandeFormData[]>([
    {
      article_id: '',
      description: '',
      quantite: 1,
      prix_unitaire: 0,
      taux_tva: 20
    }
  ]);

  // Charger les données
  useEffect(() => {
    loadDonnees();
  }, []);

  const loadDonnees = async () => {
    try {
      const [tiersData, articlesData] = await Promise.all([
        comptabiliteApi.getTiers(),
        comptabiliteApi.getArticles()
      ]);
      
      const adaptedTiers: UnifiedTiers[] = tiersData
        .filter((tier): tier is ComptabiliteTiers & { id_tiers: number, type_tiers: 'client' | 'fournisseur' } => 
          typeof tier.id_tiers === 'number' && 
          typeof tier.nom === 'string' && 
          (tier.type_tiers === 'client' || tier.type_tiers === 'fournisseur')
        )
        .map(tier => ({
          id: tier.id_tiers,
          nom: tier.nom,
          type_tiers: tier.type_tiers,
          email: tier.email || undefined,
          telephone: tier.telephone || undefined,
          adresse: tier.adresse || undefined
        }));
      
      setTiers(adaptedTiers);
      setArticles(articlesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données', {
        type: 'error',
        title: 'Erreur'
      });
    }
  };

  // Gestion des changements du formulaire principal
  const handleInputChange = (field: keyof (CommandeFormData & { statut: StatutCommande }), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion des lignes de commande
  const handleLigneChange = (index: number, field: keyof LigneCommandeFormData, value: any) => {
    const nouvellesLignes = [...lignes];
    nouvellesLignes[index] = {
      ...nouvellesLignes[index],
      [field]: value
    };
    
    if (field === 'article_id' && value) {
      const article = articles.find(a => a.code_article === value);
      if (article) {
        nouvellesLignes[index].description = article.description;
        nouvellesLignes[index].prix_unitaire = article.prix_unitaire || 0;
        nouvellesLignes[index].taux_tva = article.taux_tva || 20;
      }
    }
    
    setLignes(nouvellesLignes);
  };

  const ajouterLigne = () => {
    setLignes(prev => [
      ...prev,
      {
        article_id: '',
        description: '',
        quantite: 1,
        prix_unitaire: 0,
        taux_tva: 20
      }
    ]);
  };

  const supprimerLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Calcul des totaux
  const calculerTotaux = () => {
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    lignes.forEach(ligne => {
      const montantHT = ligne.quantite * ligne.prix_unitaire;
      const montantTVA = montantHT * (ligne.taux_tva / 100);
      const montantTTC = montantHT + montantTVA;

      totalHT += montantHT;
      totalTVA += montantTVA;
      totalTTC += montantTTC;
    });

    return { totalHT, totalTVA, totalTTC };
  };

  // Validation des données avant soumission
  const validerFormulaire = (): string | null => {
    if (!formData.client_id || !formData.fournisseur_id) {
      return 'Veuillez sélectionner un client et un fournisseur';
    }

    const lignesValides = lignes.filter(l => l.article_id && l.quantite > 0);
    if (lignesValides.length === 0) {
      return 'Veuillez ajouter au moins une ligne de commande valide';
    }

    const { totalTTC } = calculerTotaux();
    if (formData.statut === 'confirmée' && totalTTC === 0) {
      return 'Une commande confirmée doit avoir un montant total supérieur à 0';
    }

    return null;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const erreurValidation = validerFormulaire();
    if (erreurValidation) {
      alert(erreurValidation, {
        type: 'warning',
        title: 'Validation requise'
      });
      return;
    }

    setLoading(true);

    try {
      const commandeData = {
        ...formData,
        lignes: lignes.filter(l => l.article_id && l.quantite > 0)
      };
      
      await importExportApi.createCommande(commandeData);
      
      alert(`Commande créée avec succès avec le statut "${formData.statut}"!`, {
        type: 'success',
        title: 'Succès'
      });
      
      setTimeout(() => {
        navigate('/import-export/commandes');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur création commande:', error);
      
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la commande';
      alert(errorMessage, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const { totalHT, totalTVA, totalTTC } = calculerTotaux();

  // Filtrage des tiers par type
  const clients = tiers.filter(t => t.type_tiers === 'client');
  const fournisseurs = tiers.filter(t => t.type_tiers === 'fournisseur');

  // Texte du bouton selon le statut
  const getBoutonText = () => {
    switch (formData.statut) {
      case 'brouillon':
        return 'Enregistrer comme Brouillon';
      case 'confirmée':
        return 'Confirmer la Commande';
      case 'expédiée':
        return 'Marquer comme Expédiée';
      case 'livrée':
        return 'Marquer comme Livrée';
      case 'annulée':
        return 'Annuler la Commande';
      default:
        return 'Créer la Commande';
    }
  };

  const getStatutIcon = () => {
    switch (formData.statut) {
      case 'brouillon':
        return <FiFileText className="statut-form-icon" />;
      case 'confirmée':
        return <FiCheckCircle className="statut-form-icon" />;
      case 'expédiée':
        return <FiTruck className="statut-form-icon" />;
      case 'livrée':
        return <FiPackage className="statut-form-icon" />;
      case 'annulée':
        return <FiXCircle className="statut-form-icon" />;
      default:
        return <FiFileText className="statut-form-icon" />;
    }
  };

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">
              <FiShoppingCart className="page-title-icon" />
              Nouvelle Commande
            </h1>
            <p className="ms-crm-subtitle">Créer une nouvelle commande d'import/export</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to="/import-export/commandes"
            className="ms-crm-btn ms-crm-btn-secondary"
          >
            <FiArrowLeft className="ms-crm-icon" />
            Retour aux commandes
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        <div className="ms-crm-card">
          <form onSubmit={handleSubmit} className="ms-crm-form">
            
            {/* Informations générales */}
            <div className="ms-crm-form-section">
              <div className="ms-crm-section-header">
                <h2 className="ms-crm-section-title">
                  <FiBriefcase className="section-icon" />
                  Informations Générales
                </h2>
              </div>
              
              <div className="ms-crm-form-grid">
                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    <FiDownload className="form-label-icon" />
                    Type de commande
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="ms-crm-form-select"
                    required
                  >
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                  </select>
                </div>

                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    {getStatutIcon()}
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => handleInputChange('statut', e.target.value as StatutCommande)}
                    className="ms-crm-form-select"
                    required
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="confirmée">Confirmée</option>
                    <option value="expédiée">Expédiée</option>
                    <option value="livrée">Livrée</option>
                    <option value="annulée">Annulée</option>
                  </select>
                  <div className="ms-crm-form-hint">
                    {formData.statut === 'brouillon' && 'La commande est en cours de préparation'}
                    {formData.statut === 'confirmée' && 'La commande est validée et confirmée'}
                    {formData.statut === 'expédiée' && 'Les marchandises ont été expédiées'}
                    {formData.statut === 'livrée' && 'La commande a été livrée au client'}
                    {formData.statut === 'annulée' && 'La commande a été annulée'}
                  </div>
                </div>

                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    <FiUser className="form-label-icon" />
                    Client
                  </label>
                  <select
                    value={formData.client_id || ''}
                    onChange={(e) => handleInputChange('client_id', parseInt(e.target.value) || 0)}
                    className="ms-crm-form-select"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(tier => (
                      <option key={tier.id} value={tier.id}>
                        {tier.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    <FiBriefcase className="form-label-icon" />
                    Fournisseur
                  </label>
                  <select
                    value={formData.fournisseur_id || ''}
                    onChange={(e) => handleInputChange('fournisseur_id', parseInt(e.target.value) || 0)}
                    className="ms-crm-form-select"
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {fournisseurs.map(tier => (
                      <option key={tier.id} value={tier.id}>
                        {tier.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    <FiCalendar className="form-label-icon" />
                    Date de commande
                  </label>
                  <input
                    type="date"
                    value={formData.date_commande}
                    onChange={(e) => handleInputChange('date_commande', e.target.value)}
                    className="ms-crm-form-input"
                    required
                  />
                </div>

                <div className="ms-crm-form-group">
                  <label className="ms-crm-form-label required">
                    <FiDollarSign className="form-label-icon" />
                    Devise
                  </label>
                  <select
                    value={formData.devise}
                    onChange={(e) => handleInputChange('devise', e.target.value)}
                    className="ms-crm-form-select"
                    required
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dollar US</option>
                    <option value="MGA">MGA - Ariary Malgache</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lignes de commande */}
            <div className="ms-crm-form-section">
              <div className="ms-crm-section-header">
                <h2 className="ms-crm-section-title">
                  <FiPackage className="section-icon" />
                  Articles Commandés
                </h2>
              </div>
              
              <div className="ms-crm-lignes-container">
                <div className="ms-crm-ligne-header">
                  <div className="ms-crm-ligne-col-article">Article</div>
                  <div className="ms-crm-ligne-col-description">Description</div>
                  <div className="ms-crm-ligne-col-qte">Quantité</div>
                  <div className="ms-crm-ligne-col-prix">Prix Unitaire</div>
                  <div className="ms-crm-ligne-col-tva">TVA %</div>
                  <div className="ms-crm-ligne-col-montant">Montant HT</div>
                  <div className="ms-crm-ligne-col-action"></div>
                </div>

                {lignes.map((ligne, index) => {
                  const montantHT = ligne.quantite * ligne.prix_unitaire;

                  return (
                    <div key={index} className="ms-crm-ligne-item">
                      <div className="ms-crm-ligne-col-article">
                        <select
                          value={ligne.article_id}
                          onChange={(e) => handleLigneChange(index, 'article_id', e.target.value)}
                          className="ms-crm-ligne-select"
                          required
                        >
                          <option value="">Sélectionner</option>
                          {articles.map(article => (
                            <option key={article.code_article} value={article.code_article}>
                              {article.code_article}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="ms-crm-ligne-col-description">
                        <input
                          type="text"
                          value={ligne.description}
                          onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                          className="ms-crm-ligne-input"
                          placeholder="Description"
                          required
                        />
                      </div>

                      <div className="ms-crm-ligne-col-qte">
                        <input
                          type="number"
                          value={ligne.quantite}
                          onChange={(e) => handleLigneChange(index, 'quantite', parseFloat(e.target.value) || 0)}
                          className="ms-crm-ligne-input"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="ms-crm-ligne-col-prix">
                        <input
                          type="number"
                          value={ligne.prix_unitaire}
                          onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                          className="ms-crm-ligne-input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="ms-crm-ligne-col-tva">
                        <input
                          type="number"
                          value={ligne.taux_tva}
                          onChange={(e) => handleLigneChange(index, 'taux_tva', parseFloat(e.target.value) || 0)}
                          className="ms-crm-ligne-input"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>

                      <div className="ms-crm-ligne-col-montant">
                        <div className="ms-crm-ligne-montant">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: formData.devise 
                          }).format(montantHT)}
                        </div>
                      </div>

                      <div className="ms-crm-ligne-col-action">
                        <button
                          type="button"
                          onClick={() => supprimerLigne(index)}
                          className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-danger"
                          disabled={lignes.length === 1}
                          title="Supprimer cette ligne"
                        >
                          <FiMinus className="action-icon" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="ms-crm-ligne-actions">
                  <button
                    type="button"
                    onClick={ajouterLigne}
                    className="ms-crm-btn ms-crm-btn-secondary"
                  >
                    <FiPlus className="ms-crm-icon" />
                    Ajouter une ligne
                  </button>
                </div>
              </div>
            </div>

            {/* Totaux */}
            <div className="ms-crm-form-section">
              <div className="ms-crm-section-header">
                <h2 className="ms-crm-section-title">
                  <FiDollarSign className="section-icon" />
                  Récapitulatif
                </h2>
              </div>
              
              <div className="ms-crm-totaux-grid">
                <div className="ms-crm-total-item">
                  <div className="ms-crm-total-label">Total HT:</div>
                  <div className="ms-crm-total-value">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: formData.devise 
                    }).format(totalHT)}
                  </div>
                </div>

                <div className="ms-crm-total-item">
                  <div className="ms-crm-total-label">Total TVA:</div>
                  <div className="ms-crm-total-value ms-crm-total-tva">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: formData.devise 
                    }).format(totalTVA)}
                  </div>
                </div>

                <div className="ms-crm-total-item">
                  <div className="ms-crm-total-label">Total TTC:</div>
                  <div className="ms-crm-total-value ms-crm-total-ttc">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: formData.devise 
                    }).format(totalTTC)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ms-crm-form-actions">
              <Link 
                to="/import-export/commandes" 
                className="ms-crm-btn ms-crm-btn-secondary"
              >
                <FiX className="ms-crm-icon" />
                Annuler
              </Link>
              <button 
                type="submit" 
                className={`ms-crm-btn ms-crm-btn-primary ${formData.statut === 'annulée' ? 'ms-crm-btn-warning' : ''}`}
                disabled={loading}
              >
                <FiSave className="ms-crm-icon" />
                {loading ? 'Création en cours...' : getBoutonText()}
              </button>
            </div>
          </form>
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

export default CommandeFormPage;