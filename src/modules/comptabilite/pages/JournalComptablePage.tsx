// src/modules/comptabilite/pages/JournalComptablePage.tsx
import React, { useState, useEffect } from 'react';
import ecritureApi from '../services/ecritureApi';   
import type { EcritureComptable } from '../types';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './JournalComptablePage.css';
import { FaSearch, FaSync, FaTrashAlt } from 'react-icons/fa';

export const JournalComptablePage: React.FC = () => {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    journal: ''
  });

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  const loadEcritures = async () => {
    setLoading(true);
    setSearching(true);
    try {
      const data = await ecritureApi.getEcrituresComptables(filters);  
      setEcritures(data);
      
      if (data.length === 0) {
        alert('Aucune écriture trouvée pour les critères sélectionnés', {
          type: 'info',
          title: 'Aucun résultat'
        });
      }
    } catch (error) {
      console.error('Erreur chargement écritures:', error);
      alert('Erreur lors du chargement des écritures comptables', {
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    loadEcritures();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des dates
    if (filters.date_debut && filters.date_fin && filters.date_debut > filters.date_fin) {
      alert('La date de début ne peut pas être postérieure à la date de fin', {
        type: 'warning',
        title: 'Dates invalides'
      });
      return;
    }
    
    loadEcritures();
  };

  const handleResetFilters = () => {
    setFilters({
      date_debut: '',
      date_fin: '',
      journal: ''
    });
    
    // Recharger sans filtres après un court délai
    setTimeout(() => {
      loadEcritures();
    }, 100);
  };

  const getJournalColor = (journal: string) => {
    const colors: { [key: string]: string } = {
      'ventes': 'journal-ventes',
      'achats': 'journal-achats',
      'banque': 'journal-banque',
      'caisse': 'journal-caisse'
    };
    return colors[journal] || '';
  };

  const calculerTotaux = () => {
    const totalDebit = ecritures.reduce((sum, ecriture) => sum + ecriture.debit, 0);
    const totalCredit = ecritures.reduce((sum, ecriture) => sum + ecriture.credit, 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculerTotaux();

  return (
    <div className="journal-comptable-page">
      <div className="page-header">
        <h1>Journal Comptable</h1>
        <p>Consultation des écritures comptables</p>
      </div>

      {/* Filtres - MODIFIÉ POUR ALIGNEMENT HORIZONTAL */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="filters-form">

          <div className="filter-group">
            <label className="filter-label">Journal</label>
            <select
              value={filters.journal}
              onChange={(e) => handleFilterChange('journal', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="">Tous les journaux</option>
              <option value="ventes">Ventes</option>
              <option value="achats">Achats</option>
              <option value="banque">Banque</option>
              <option value="caisse">Caisse</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Date début</label>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => handleFilterChange('date_debut', e.target.value)}
              className="filter-input"
              disabled={loading}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Date fin</label>
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => handleFilterChange('date_fin', e.target.value)}
              className="filter-input"
              disabled={loading}
            />
          </div>

          

          {/* Boutons dans un groupe de filtre pour alignement horizontal */}
          <div className="filter-group">
            <label className="filter-label" style={{ visibility: 'hidden' }}>Actions</label>
            <div className="filter-actions-horizontal">
              <button 
                type="submit" 
                className="search-button"
                disabled={loading}
              >
                {searching ? (
                  <>
                    <FaSync className="spinning-icon" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <FaSearch className="button-icon" />
                    Rechercher
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="reset-button"
                onClick={handleResetFilters}
                disabled={loading}
              >
                <FaTrashAlt className="button-icon" />
                Réinitialiser
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Résumé rapide */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-number">{ecritures.length}</div>
          <div className="stat-label">Écritures</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            {new Set(ecritures.map(e => e.journal)).size}
          </div>
          <div className="stat-label">Journaux</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            {new Set(ecritures.map(e => e.devise)).size}
          </div>
          <div className="stat-label">Devises</div>
        </div>
      </div>

      {/* Résultats */}
      <div className="results-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Chargement des écritures comptables...</div>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="ecritures-table">
                <thead>
                  <tr>
                    <th>N° Écriture</th>
                    <th>Date</th>
                    <th>Journal</th>
                    <th>Compte</th>
                    <th>Libellé</th>
                    <th>Débit</th>
                    <th>Crédit</th>
                    <th>Devise</th>
                  </tr>
                </thead>
                <tbody>
                  {ecritures.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="no-data">
                        <div className="no-data-content">
                          <div className="no-data-icon">📊</div>
                          <h3>Aucune écriture trouvée</h3>
                          <p>Ajustez vos critères de recherche ou vérifiez vos données.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ecritures.map((ecriture) => (
                      <tr key={ecriture.id_ecriture} className="ecriture-row">
                        <td className="numero">
                          <span className="numero-badge">{ecriture.numero_ecriture}</span>
                        </td>
                        <td className="date">
                          {new Date(ecriture.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td>
                          <span className={`journal-badge ${getJournalColor(ecriture.journal)}`}>
                            {ecriture.journal}
                          </span>
                        </td>
                        <td className="compte">
                          <code>{ecriture.compte}</code>
                        </td>
                        <td className="libelle">{ecriture.libelle}</td>
                        <td className="debit">
                          {ecriture.debit > 0 && (
                            <MontantDevise 
                              montant={ecriture.debit} 
                              devise={ecriture.devise} 
                            />
                          )}
                        </td>
                        <td className="credit">
                          {ecriture.credit > 0 && (
                            <MontantDevise 
                              montant={ecriture.credit} 
                              devise={ecriture.devise} 
                            />
                          )}
                        </td>
                        <td className="devise">
                          <span className="devise-badge">{ecriture.devise}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="totals-row">
                    <td colSpan={5} className="totals-label">
                      <strong>Totaux généraux</strong>
                    </td>
                    <td className="total-debit">
                      <strong>
                        <MontantDevise montant={totalDebit} devise="MGA" />
                      </strong>
                    </td>
                    <td className="total-credit">
                      <strong>
                        <MontantDevise montant={totalCredit} devise="MGA" />
                      </strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">📥</div>
                <h3>Total Débit</h3>
                <div className="amount debit">
                  <MontantDevise montant={totalDebit} devise="MGA" />
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📤</div>
                <h3>Total Crédit</h3>
                <div className="amount credit">
                  <MontantDevise montant={totalCredit} devise="MGA" />
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  {totalDebit === totalCredit ? '⚖️' : '⚠️'}
                </div>
                <h3>Équilibre</h3>
                <div className={`amount ${totalDebit === totalCredit ? 'balanced' : 'unbalanced'}`}>
                  {totalDebit === totalCredit ? '✓ Équilibré' : '✗ Déséquilibré'}
                  {totalDebit !== totalCredit && (
                    <div className="balance-difference">
                      Différence: <MontantDevise 
                        montant={Math.abs(totalDebit - totalCredit)} 
                        devise="MGA" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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

export default JournalComptablePage;