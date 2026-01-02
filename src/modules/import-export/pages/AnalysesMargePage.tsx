import React, { useState, useEffect } from 'react';
import { importExportApi } from '../services/api';
import type { Commande, CalculMarge } from '../types';
import './AnalysesMargePage.css';

interface AnalyseData {
  commandes: Commande[];
  marges: Map<number, CalculMarge>;
  loading: boolean;
}

const AnalysesMargePage: React.FC = () => {
  const [analyseData, setAnalyseData] = useState<AnalyseData>({
    commandes: [],
    marges: new Map(),
    loading: true
  });
  const [filtres, setFiltres] = useState({
    periode: '30j',
    type: 'tous'
  });

  useEffect(() => {
    chargerDonnees();
  }, [filtres]);

  // Ajoutez ce useEffect APRÈS vos autres useEffect
useEffect(() => {
  console.log('🔍 [STATE] analyseData.marges:', analyseData.marges);
  console.log('🔍 [STATE] Taille du Map:', analyseData.marges.size);
  console.log('🔍 [STATE] Commandes avec marge:', 
    Array.from(analyseData.marges.entries()).map(([id, marge]) => ({ 
      id, 
      marge,
      hasCouts: marge.total_couts > 0
    }))
  );
}, [analyseData.marges]);

  const chargerDonnees = async () => {
    try {
      setAnalyseData(prev => ({ ...prev, loading: true }));
      
      const commandes = await importExportApi.getCommandes();
      const marges = new Map<number, CalculMarge>();

      // Charger uniquement les marges des commandes valides
      for (const commande of commandes) {
        if (commande.lignes && commande.lignes.length > 0 && parseFloat(commande.montant_total.toString()) > 0) {
          try {
            const marge = await importExportApi.calculerMarge(commande.id);
            marges.set(commande.id, marge);
          } catch (error) {
            console.warn(`Marge non disponible pour ${commande.numero_commande}`);
          }
        }
      }

      setAnalyseData({
        commandes: filtrerCommandes(commandes),
        marges,
        loading: false
      });
    } catch (error) {
      console.error('Erreur chargement analyses:', error);
      setAnalyseData(prev => ({ ...prev, loading: false }));
    }
  };

  const filtrerCommandes = (commandes: Commande[]): Commande[] => {
    return commandes.filter(commande => {
      // Exclure les commandes invalides
      if (!commande.lignes || commande.lignes.length === 0 || parseFloat(commande.montant_total.toString()) === 0) {
        return false;
      }

      // Filtre par type
      if (filtres.type !== 'tous' && commande.type !== filtres.type) {
        return false;
      }
      
      // Filtre par période
      if (filtres.periode !== 'tous') {
        const dateCommande = new Date(commande.date_commande);
        const maintenant = new Date();
        const differenceJours = (maintenant.getTime() - dateCommande.getTime()) / (1000 * 3600 * 24);
        
        switch (filtres.periode) {
          case '7j': return differenceJours <= 7;
          case '30j': return differenceJours <= 30;
          case '90j': return differenceJours <= 90;
          default: return true;
        }
      }
      
      return true;
    });
  };

  // Calculs focalisés sur la marge
  const calculerStatistiques = () => {
    const { commandes, marges } = analyseData;
    
    let totalCA = 0;
    let totalCouts = 0;
    let totalMarge = 0;
    let commandesRentables = 0;
    let commandesPerdantes = 0;

    commandes.forEach(commande => {
      const marge = marges.get(commande.id);
      if (marge && marge.chiffre_affaires > 0) {
        totalCA += marge.chiffre_affaires;
        totalCouts += marge.total_couts;
        totalMarge += marge.marge_brute;

        if (marge.marge_brute > 0) {
          commandesRentables++;
        } else {
          commandesPerdantes++;
        }
      }
    });

    return {
      totalCommandes: commandes.length,
      totalCA,
      totalCouts,
      totalMarge,
      tauxMargeMoyen: totalCA > 0 ? (totalMarge / totalCA) * 100 : 0,
      commandesRentables,
      commandesPerdantes
    };
  };

  const stats = calculerStatistiques();

  if (analyseData.loading) {
    return (
      <div className="analyses-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analyse des marges en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analyses-container">
      <div className="analyses-content">
        
        

        {/* Filtres simplifiés */}
        <div className="filtres-section">
          <div className="filtres-grid">
            <div className="filtre-group">
              <label>Période</label>
              <select
                value={filtres.periode}
                onChange={(e) => setFiltres(prev => ({ ...prev, periode: e.target.value }))}
              >
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">90 derniers jours</option>
                <option value="tous">Toute période</option>
              </select>
            </div>

            <div className="filtre-group">
              <label>Type d'opération</label>
              <select
                value={filtres.type}
                onChange={(e) => setFiltres(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="tous">Toutes les opérations</option>
                <option value="import">Import</option>
                <option value="export">Export</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI essentiels */}
        <div className="kpi-section">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📊</div>
              <div className="kpi-content">
                <div className="kpi-value">{stats.totalCommandes}</div>
                <div className="kpi-label">Opérations analysées</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">💰</div>
              <div className="kpi-content">
                <div className="kpi-value">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(stats.totalCA)}
                </div>
                <div className="kpi-label">Chiffre d'affaires</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">📈</div>
              <div className="kpi-content">
                <div className="kpi-value">
                  {stats.tauxMargeMoyen > 0 ? stats.tauxMargeMoyen.toFixed(1) + '%' : '0%'}
                </div>
                <div className="kpi-label">Marge moyenne</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">⚖️</div>
              <div className="kpi-content">
                <div className="kpi-value">
                  {stats.commandesRentables}/{stats.commandesPerdantes}
                </div>
                <div className="kpi-label">Rentables / Perdantes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Détail des opérations - TABLEAU SIMPLIFIÉ */}
        <div className="commandes-section">
          <h3 className="section-title">Détail des Opérations</h3>
          <div className="commandes-table-container">
            <table className="analyses-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client/Fournisseur</th>
                  <th>Type</th>
                  <th>Chiffre d'Affaires</th>
                  <th>Coûts Logistiques</th>
                  <th>Marge</th>
                  <th>Taux</th>
                </tr>
              </thead>
              <tbody>
                {analyseData.commandes.map(commande => {
                  const marge = analyseData.marges.get(commande.id);
                  console.log(`🔍 [RENDER] Commande ${commande.id} (${commande.numero_commande})`);
                  console.log(`🔍 [RENDER] Marge disponible:`, marge);
                  console.log(`🔍 [RENDER] total_couts:`, marge?.total_couts);
                  console.log(`🔍 [RENDER] isValidMarge:`, marge && marge.chiffre_affaires > 0);
                                  const isValidMarge = marge && marge.chiffre_affaires > 0;
                  
                  return (
                    <tr key={commande.id}>
                      <td>
                        <div className="commande-cell">
                          <div className="commande-numero">{commande.numero_commande}</div>
                          <div className="commande-date">
                            {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div><strong>{commande.client?.nom}</strong></div>
                          <div className="text-muted">{commande.fournisseur?.nom}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${commande.type}`}>
                          {commande.type === 'import' ? '📥 Import' : '📤 Export'}
                        </span>
                      </td>
                      <td className="montant">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.devise,
                        }).format(commande.montant_total)}
                      </td>
                      <td className="montant">
                        {isValidMarge ? (
                          new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: commande.devise,
                          }).format(marge.total_couts)
                        ) : '-'}
                      </td>
                      <td className="montant">
                        {isValidMarge ? (
                          <span className={marge.marge_brute >= 0 ? 'positive' : 'negative'}>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: commande.devise,
                            }).format(marge.marge_brute)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="taux">
                        {isValidMarge ? (
                          <span className={`taux-badge ${
                            marge.taux_marge >= 20 ? 'high' : 
                            marge.taux_marge >= 10 ? 'medium' : 
                            marge.taux_marge >= 0 ? 'low' : 'negative'
                          }`}>
                            {marge.taux_marge.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {analyseData.commandes.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h4>Aucune opération analysée</h4>
                <p>Aucune commande valide ne correspond à vos critères.</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights business simplifiés */}
        <div className="insights-section">
          <h3 className="section-title">Synthèse</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h4>Performance Globale</h4>
                <p>
                  {stats.tauxMargeMoyen >= 15 
                    ? `Excellente rentabilité (${stats.tauxMargeMoyen.toFixed(1)}% de marge)`
                    : stats.tauxMargeMoyen >= 5
                    ? `Rentabilité correcte (${stats.tauxMargeMoyen.toFixed(1)}% de marge)`
                    : 'Marge à améliorer'
                  }
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Focus</h4>
                <p>
                  {stats.commandesPerdantes > 0
                    ? `${stats.commandesPerdantes} opération(s) à optimiser`
                    : 'Toutes les opérations sont rentables'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysesMargePage;