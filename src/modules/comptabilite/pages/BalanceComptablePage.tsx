// src/modules/comptabilite/pages/BalanceComptablePage.tsx
import React, { useState, useEffect } from 'react';
import rapportApi from '../services/rapportApi';
import MontantDevise from '../components/MontantDevise/MontantDevise';
import './BalanceComptablePage.css';

interface CompteBalance {
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
}

export const BalanceComptablePage: React.FC = () => {
  const [balance, setBalance] = useState<CompteBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: ''
  });

  const loadBalance = async () => {
    setLoading(true);
    try {
      const data = await rapportApi.getBilan(filters.date_fin);
      // Transformer les données pour l'affichage
      const balanceData: CompteBalance[] = Object.entries(data).map(([compte, details]: [string, any]) => ({
        compte,
        libelle: getLibelleCompte(compte),
        debit: details.debit || 0,
        credit: details.credit || 0,
        solde: details.solde || 0
      }));
      setBalance(balanceData);
    } catch (error) {
      console.error('Erreur chargement balance:', error);
      // Données de démo
      setBalance([
        { compte: '701000', libelle: 'Ventes de produits', debit: 0, credit: 1500000, solde: -1500000 },
        { compte: '607000', libelle: 'Achats de marchandises', debit: 800000, credit: 0, solde: 800000 },
        { compte: '411000', libelle: 'Clients', debit: 1200000, credit: 800000, solde: 400000 },
        { compte: '401000', libelle: 'Fournisseurs', debit: 600000, credit: 800000, solde: -200000 },
        { compte: '512000', libelle: 'Banque', debit: 500000, credit: 300000, solde: 200000 },
        { compte: '445710', libelle: 'TVA collectée', debit: 0, credit: 300000, solde: -300000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getLibelleCompte = (compte: string): string => {
    const libelles: { [key: string]: string } = {
      '701000': 'Ventes de produits',
      '607000': 'Achats de marchandises',
      '411000': 'Clients',
      '401000': 'Fournisseurs',
      '512000': 'Banque',
      '445710': 'TVA collectée',
      '445660': 'TVA déductible',
      '530000': 'Caisse',
      '101000': 'Capital social'
    };
    return libelles[compte] || 'Compte divers';
  };

  useEffect(() => {
    if (filters.date_debut || filters.date_fin) {
      loadBalance();
    }
  }, [filters.date_debut, filters.date_fin]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBalance();
  };

  const calculerTotaux = () => {
    const totalDebit = balance.reduce((sum, compte) => sum + compte.debit, 0);
    const totalCredit = balance.reduce((sum, compte) => sum + compte.credit, 0);
    const totalSoldeDebiteur = balance.reduce((sum, compte) => sum + (compte.solde > 0 ? compte.solde : 0), 0);
    const totalSoldeCrediteur = balance.reduce((sum, compte) => sum + (compte.solde < 0 ? Math.abs(compte.solde) : 0), 0);
    
    return { totalDebit, totalCredit, totalSoldeDebiteur, totalSoldeCrediteur };
  };

  const { totalDebit, totalCredit, totalSoldeDebiteur, totalSoldeCrediteur } = calculerTotaux();

  return (
    <div className="balance-comptable-page">
      <div className="page-header">
        <h1>Balance Comptable</h1>
        <p>Balance générale des comptes</p>
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="filters-form">
          <div className="filter-group">
            <label>Date début</label>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => handleFilterChange('date_debut', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date fin</label>
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => handleFilterChange('date_fin', e.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Générer la balance
          </button>
        </form>
      </div>

      {/* Résultats */}
      <div className="results-section">
        {loading ? (
          <div className="loading">Génération de la balance...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="balance-table">
                <thead>
                  <tr>
                    <th>Compte</th>
                    <th>Libellé</th>
                    <th>Débit</th>
                    <th>Crédit</th>
                    <th>Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.map((compte) => (
                    <tr key={compte.compte}>
                      <td className="compte">{compte.compte}</td>
                      <td className="libelle">{compte.libelle}</td>
                      <td className="debit">
                        {compte.debit > 0 && (
                          <MontantDevise montant={compte.debit} devise="MGA" />
                        )}
                      </td>
                      <td className="credit">
                        {compte.credit > 0 && (
                          <MontantDevise montant={compte.credit} devise="MGA" />
                        )}
                      </td>
                      <td className={`solde ${compte.solde >= 0 ? 'debiteur' : 'crediteur'}`}>
                        <MontantDevise 
                          montant={Math.abs(compte.solde)} 
                          devise="MGA" 
                        />
                        <span className="solde-indicator">
                          {compte.solde >= 0 ? 'Débiteur' : 'Créditeur'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="totals-row">
                    <td colSpan={2}>Totaux</td>
                    <td className="total-debit">
                      <MontantDevise montant={totalDebit} devise="MGA" />
                    </td>
                    <td className="total-credit">
                      <MontantDevise montant={totalCredit} devise="MGA" />
                    </td>
                    <td></td>
                  </tr>
                  <tr className="soldes-totals">
                    <td colSpan={2}>Soldes débiteurs / créditeurs</td>
                    <td className="total-solde-debiteur">
                      <MontantDevise montant={totalSoldeDebiteur} devise="MGA" />
                    </td>
                    <td className="total-solde-crediteur">
                      <MontantDevise montant={totalSoldeCrediteur} devise="MGA" />
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Débit</h3>
                <div className="amount">
                  <MontantDevise montant={totalDebit} devise="MGA" />
                </div>
              </div>
              <div className="summary-card">
                <h3>Total Crédit</h3>
                <div className="amount">
                  <MontantDevise montant={totalCredit} devise="MGA" />
                </div>
              </div>
              <div className="summary-card">
                <h3>Équilibre</h3>
                <div className={`amount ${totalDebit === totalCredit ? 'balanced' : 'unbalanced'}`}>
                  {totalDebit === totalCredit ? '✓ Équilibré' : '✗ Déséquilibré'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceComptablePage;