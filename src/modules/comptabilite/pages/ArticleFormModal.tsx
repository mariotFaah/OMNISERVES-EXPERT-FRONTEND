// src/modules/comptabilite/pages/ArticleFormModal.tsx
import React, { useState } from 'react';
import './ArticleFormModal.css';
import { comptabiliteApi } from '../services/api';
import type { Article } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';

interface Props {
  article: Article | null;
  nextArticleCode?: string;
  onClose: () => void;
  onSave: () => void;
}

type ArticleFormData = Omit<Article, 'actif' | 'created_at' | 'updated_at'>;

export const ArticleFormModal: React.FC<Props> = ({ article, onClose, onSave }) => {
  

  // Fonction pour générer un code article unique
const generateUniqueArticleCode = async (): Promise<string> => {
  try {
    const articles = await comptabiliteApi.getArticles();
    
    // Trouver le plus grand code numérique existant
    const existingCodes = articles
      .map(article => article.code_article)
      .filter(code => code.startsWith('ART'))
      .map(code => parseInt(code.replace('ART', '')) || 0);
    
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const nextCode = maxCode + 1;
    
    return `ART${nextCode.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Erreur génération code article:', error);
    // Fallback basé sur le timestamp
    return `ART${Date.now().toString().slice(-3)}`;
  }
};

const [form, setForm] = useState<ArticleFormData>(
  article ? {
    code_article: article.code_article,
    description: article.description,
    prix_unitaire: Number(article.prix_unitaire),
    taux_tva: Number(article.taux_tva),
    unite: article.unite,
    quantite_stock: article.quantite_stock ?? 0,
    seuil_alerte: article.seuil_alerte ?? 5,
  } : {
    code_article: '', // Laisser vide initialement
    description: '',
    prix_unitaire: 0,
    taux_tva: 20,
    unite: 'unite',
    quantite_stock: 0,
    seuil_alerte: 5,
  }
);

// Générer le code unique au chargement du composant
React.useEffect(() => {
  if (!article) {
    const generateCode = async () => {
      const uniqueCode = await generateUniqueArticleCode();
      setForm(prev => ({ ...prev, code_article: uniqueCode }));
    };
    generateCode();
  }
}, [article]);

  const [saving, setSaving] = useState(false);
  const [showStockFields, setShowStockFields] = useState(
    (article?.quantite_stock ?? 0) > 0 || (article?.seuil_alerte ?? 0) > 0
  );

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name.includes('prix') || name.includes('tva') || name.includes('quantite') || name.includes('seuil') 
        ? Number(value) 
        : value 
    }));
  };

  // Fonction utilitaire pour obtenir les valeurs de stock
  const getStockValue = (): { quantite: number; seuil: number } => ({
    quantite: form.quantite_stock ?? 0,
    seuil: form.seuil_alerte?? 5
  });

  // Fonction utilitaire pour déterminer le statut du stock
  const getStockStatus = (): 'rupture' | 'stock_faible' | 'disponible' => {
    const { quantite, seuil } = getStockValue();
    if (quantite <= 0) return 'rupture';
    if (quantite <= seuil) return 'stock_faible';
    return 'disponible';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.description.trim()) {
      alert('La description est obligatoire', {
        type: 'warning',
        title: 'Champ manquant'
      });
      return;
    }

    if (form.prix_unitaire < 0) {
      alert('Le prix unitaire ne peut pas être négatif', {
        type: 'warning',
        title: 'Prix invalide'
      });
      return;
    }

    if (form.taux_tva < 0 || form.taux_tva > 100) {
      alert('Le taux de TVA doit être compris entre 0 et 100%', {
        type: 'warning',
        title: 'TVA invalide'
      });
      return;
    }

    const { quantite, seuil } = getStockValue();

    if (showStockFields && quantite < 0) {
      alert('La quantité en stock ne peut pas être négative', {
        type: 'warning',
        title: 'Stock invalide'
      });
      return;
    }

    if (showStockFields && seuil < 0) {
      alert('Le seuil d\'alerte ne peut pas être négatif', {
        type: 'warning',
        title: 'Seuil invalide'
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log('📤 Données envoyées:', form);
      
      // Préparer les données pour l'envoi
      const dataToSend = { ...form };
      
      // Si la gestion de stock n'est pas activée, ne pas envoyer les valeurs de stock
      if (!showStockFields) {
        delete dataToSend.quantite_stock;
        delete dataToSend.seuil_alerte;
      }
      
      if (article) {
        const { code_article, ...updateData } = dataToSend;
        console.log('🔄 Données de modification:', updateData);
        await comptabiliteApi.updateArticle(article.code_article, updateData);
        
        alert('Article modifié avec succès', {
          type: 'success',
          title: 'Succès'
        });
      } else {
        // Création
        await comptabiliteApi.createArticle(dataToSend);
        
        alert('Article créé avec succès', {
          type: 'success',
          title: 'Succès'
        });
      }
      
      setTimeout(() => {
        onSave();
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

  const toggleStockFields = () => {
    setShowStockFields(!showStockFields);
    if (!showStockFields) {
      // Si on active la gestion de stock, initialiser les valeurs
      setForm(prev => ({
        ...prev,
        quantite_stock: prev.quantite_stock ?? 0,
        seuil_alerte: prev.seuil_alerte ?? 5,
      }));
    }
  };

  const { quantite, seuil } = getStockValue();
  const stockStatus = getStockStatus();

  return (
    <div className="article-modal-overlay">
      <div className="article-modal">
        <div className="article-modal-header">
          <h2>{article ? 'Modifier' : 'Ajouter'} un article</h2>
          <button 
            type="button" 
            className="article-modal-close" 
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!article && (
            <div className="article-form-group">
              <label className="article-form-label">Code Article *</label>
              <div className="article-code-display">
                <span className="code-prefix">ART</span>
                <span className="code-number">
                  {form.code_article.replace('ART', '')}
                </span>
                <small className="code-info">(Généré automatiquement)</small>
              </div>
              <input 
                type="hidden"
                name="code_article" 
                value={form.code_article} 
              />
            </div>
          )}

          <div className="article-form-group">
            <label className="article-form-label">Description *</label>
            <input 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              className="article-form-input"
              required 
              placeholder="Description de l'article"
              disabled={saving}
            />
          </div>

          <div className="article-form-row">
            <div className="article-form-group">
              <label className="article-form-label">Prix Unitaire (Ar) *</label>
              <input 
                name="prix_unitaire" 
                type="number" 
                step="0.01"
                min="0"
                value={form.prix_unitaire} 
                onChange={handleChange} 
                className="article-form-input"
                required 
                disabled={saving}
              />
            </div>

            <div className="article-form-group">
              <label className="article-form-label">Taux TVA (%)</label>
              <input 
                name="taux_tva" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                value={form.taux_tva} 
                onChange={handleChange} 
                className="article-form-input"
                disabled={saving}
              />
            </div>
          </div>

          <div className="article-form-group">
            <label className="article-form-label">Unité</label>
            <select 
              name="unite" 
              value={form.unite} 
              onChange={handleChange} 
              className="article-form-select"
              disabled={saving}
            >
              <option value="unite">Unité</option>
              <option value="heure">Heure</option>
              <option value="jour">Jour</option>
              <option value="kg">Kilogramme</option>
              <option value="litre">Litre</option>
              <option value="mètre">Mètre</option>
              <option value="mois">Mois</option>
              <option value="paquet">Paquet</option>
              <option value="carton">Carton</option>
              <option value="boîte">Boîte</option>
            </select>
          </div>

          {/* Section Gestion de Stock */}
          <div className="stock-section">
            <div className="stock-section-header">
              <h3>📦 Gestion de Stock</h3>
              <label className="stock-toggle">
                <input 
                  type="checkbox" 
                  checked={showStockFields}
                  onChange={toggleStockFields}
                  disabled={saving}
                />
                <span className="stock-toggle-slider"></span>
                Activer la gestion de stock
              </label>
            </div>

            {showStockFields && (
              <div className="stock-fields">
                <div className="article-form-row">
                  <div className="article-form-group">
                    <label className="article-form-label">
                      Quantité en stock
                      <span className={`stock-indicator ${stockStatus}`}>
                        {stockStatus === 'rupture' ? '🔴 Rupture' :
                         stockStatus === 'stock_faible' ? '🟡 Faible' : '🟢 Disponible'}
                      </span>
                    </label>
                    <input 
                      name="quantite_stock" 
                      type="number" 
                      step="1"
                      min="0"
                      value={quantite} 
                      onChange={handleChange} 
                      className="article-form-input"
                      disabled={saving}
                      placeholder="0"
                    />
                  </div>

                  <div className="article-form-group">
                    <label className="article-form-label">Seuil d'alerte stock</label>
                    <input 
                      name="seuil_alerte"
                      type="number" 
                      step="1"
                      min="0"
                      value={seuil} 
                      onChange={handleChange} 
                      className="article-form-input"
                      disabled={saving}
                      placeholder="5"
                    />
                    <small className="field-help">
                      Alerte quand stock ≤ ce seuil
                    </small>
                  </div>
                </div>

                <div className="stock-info">
                  <div className="stock-status">
                    <strong>Statut actuel:</strong>
                    <span className={`stock-status-badge ${stockStatus}`}>
                      {stockStatus === 'rupture' ? '🔴 Rupture de stock' :
                       stockStatus === 'stock_faible' ? '🟡 Stock faible' : '🟢 Stock disponible'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="article-modal-actions">
            <button 
              type="button" 
              className="article-cancel-btn" 
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="article-save-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="article-saving-spinner"></div>
                  {article ? 'Modification...' : 'Création...'}
                </>
              ) : (
                article ? '💾 Modifier' : '➕ Créer'
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