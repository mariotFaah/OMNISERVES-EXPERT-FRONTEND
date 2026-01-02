import * as React from 'react';
import type { LigneFacture, Article } from '../../types';
import './LigneFactureRow.css';

interface LigneFactureRowProps {
  ligne: LigneFacture;
  articles: Article[];
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
  disabled?: boolean;
}

export const LigneFactureRow: React.FC<LigneFactureRowProps> = ({
  ligne,
  articles,
  index,
  onChange,
  onRemove,
  showRemove,
  disabled = false
}) => {
  // Filtrer les articles : exclure les ruptures de stock et les articles inactifs
  const articlesDisponibles = articles.filter(article => 
    article.statut_stock !== 'rupture' && 
    article.actif !== false
  );

  // Fonction pour gérer le changement d'article
  const handleArticleChange = (articleCode: string) => {
    const selectedArticle = articles.find(article => article.code_article === articleCode);
    
    if (selectedArticle) {
      // Mettre à jour toutes les propriétés de l'article
      onChange(index, 'code_article', selectedArticle.code_article);
      onChange(index, 'description', selectedArticle.description);
      onChange(index, 'taux_tva', selectedArticle.taux_tva);
      onChange(index, 'prix_unitaire', selectedArticle.prix_unitaire);
      
      // Vérifier la disponibilité du stock
      if (selectedArticle.quantite_stock !== undefined && selectedArticle.quantite_stock <= 0) {
        console.warn(`⚠️ Article ${selectedArticle.code_article} en rupture de stock`);
      }
    } else {
      // Réinitialiser si aucun article sélectionné
      onChange(index, 'code_article', '');
      onChange(index, 'description', '');
      onChange(index, 'taux_tva', 0);
      onChange(index, 'prix_unitaire', 0);
    }
  };

  // Obtenir l'article actuellement sélectionné
  const articleActuel = articles.find(article => article.code_article === ligne.code_article);

  // Vérifier si l'article sélectionné est en rupture
  const articleEnRupture = articleActuel?.statut_stock === 'rupture';

  // Calculer le stock disponible pour l'article actuel
  const stockDisponible = articleActuel?.quantite_stock || 0;

  // Vérifier si la quantité demandée dépasse le stock
  const quantiteExcessive = stockDisponible > 0 && ligne.quantite > stockDisponible;

  return (
    <tr className={`ligne-facture-row ${articleEnRupture ? 'ligne-rupture' : ''} ${quantiteExcessive ? 'ligne-stock-insuffisant' : ''}`}>
      {/* Référence */}
      <td className="ligne-facture-cell">
        <select
          value={ligne.code_article}
          onChange={(e) => handleArticleChange(e.target.value)}
          className={`ligne-article-select ${articleEnRupture ? 'select-rupture' : ''}`}
          disabled={disabled}
        >
          <option value="">Sélectionner un article</option>
          {articlesDisponibles.map(article => (
            <option key={article.code_article} value={article.code_article}>
              {article.code_article} - {article.description}
              {article.quantite_stock !== undefined && ` (Stock: ${article.quantite_stock})`}
              {article.statut_stock === 'stock_faible' && ' ⚠️'}
            </option>
          ))}
        </select>
        
        {/* Message d'alerte si l'article sélectionné est en rupture */}
        {articleEnRupture && (
          <div className="ligne-alerte-rupture">
            ⚠️ Cet article est en rupture de stock
          </div>
        )}
      </td>

      {/* Libellé */}
      <td className="ligne-facture-cell">
        <input
          type="text"
          value={ligne.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          className="ligne-input"
          placeholder="Description de l'article"
          disabled={disabled}
        />
      </td>

      {/* Prix Unitaire */}
      <td className="ligne-facture-cell">
        <input
          type="number"
          value={ligne.prix_unitaire}
          onChange={(e) => onChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
          className="ligne-input"
          min="0"
          step="0.01"
          disabled={disabled}
        />
        {articleActuel && (
          <div className="ligne-prix-reference">
            Ref: {articleActuel.prix_unitaire?.toLocaleString()} Ar
          </div>
        )}
      </td>

      {/* Quantité */}
      <td className="ligne-facture-cell">
        <input
          type="number"
          value={ligne.quantite}
          onChange={(e) => onChange(index, 'quantite', parseFloat(e.target.value) || 0)}
          className={`ligne-input ${quantiteExcessive ? 'input-stock-insuffisant' : ''}`}
          min="0.01"
          step="0.01"
          disabled={disabled}
        />
        
        {/* Informations de stock */}
        {articleActuel && articleActuel.quantite_stock !== undefined && (
          <div className={`ligne-info-stock ${quantiteExcessive ? 'info-stock-insuffisant' : ''}`}>
            Stock: {stockDisponible}
            {quantiteExcessive && (
              <span className="ligne-alerte-quantite">
                ⚠️ Stock insuffisant
              </span>
            )}
          </div>
        )}
      </td>

      {/* Remise */}
      <td className="ligne-facture-cell">
        <input
          type="number"
          value={ligne.remise}
          onChange={(e) => onChange(index, 'remise', parseFloat(e.target.value) || 0)}
          className="ligne-input"
          min="0"
          max="100"
          step="0.01"
          disabled={disabled}
        />
        <div className="ligne-remise-suffix">%</div>
      </td>

      {/* Montant HT (lecture seule) */}
      <td className="ligne-facture-cell">
        <div className="ligne-montant-ht">
          {ligne.montant_ht?.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} Ar
        </div>
      </td>

      {/* TVA - Lecture seule avec taux de l'article */}
      <td className="ligne-facture-cell">
        <div className="ligne-tva-display">
          {ligne.taux_tva}%
        </div>
        {articleActuel && (
          <div className="ligne-tva-reference">
            Taux article
          </div>
        )}
      </td>

      {/* Actions */}
      {!disabled && (
        <td className="ligne-facture-cell">
          {showRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ligne-remove-button"
              title="Supprimer cette ligne"
            >
              ❌
            </button>
          )}
        </td>
      )}
    </tr>
  );
};

export default LigneFactureRow;