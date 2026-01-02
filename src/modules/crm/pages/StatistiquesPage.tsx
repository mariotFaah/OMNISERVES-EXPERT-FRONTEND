// src/modules/crm/pages/StatistiquesPage.tsx
import React, { useState, useEffect } from 'react';
import { crmApi } from '../services/api';
import type { Client, Devis, Relance} from '../types';
import './StatistiquesPage.css';

const StatistiquesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [filtre, setFiltre] = useState<'mois' | 'trimestre' | 'annee'>('mois');

  useEffect(() => {
    loadStatistiquesData();
  }, [filtre]);

  const loadStatistiquesData = async () => {
    try {
      setLoading(true);
      const [clientsData, devisData, relancesData] = await Promise.all([
        crmApi.getClients(),
        crmApi.getDevis(),
        crmApi.getRelances(),
      ]);

      setClients(clientsData);
      setDevis(devisData);
      setRelances(relancesData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculs statistiques avancés
  const calculerKPIs = () => {
    const clientsActifs = clients.filter(c => c.categorie === 'client');
    const devisAcceptes = devis.filter(d => d.statut === 'accepte');
    const devisEnvoyes = devis.filter(d => d.statut === 'envoye');
    
    return {
      // Performance commerciale
      tauxConversion: (devisAcceptes.length / Math.max(devisEnvoyes.length, 1)) * 100,
      valeurMoyenneDevis: devis.length > 0 ? devis.reduce((sum, d) => sum + d.montant_ht, 0) / devis.length : 0,
      delaiMoyenReponse: 2.5, // jours - à calculer avec données réelles
      
      // Engagement client
      activitesParClient: clientsActifs.length > 0 ? 
        clientsActifs.reduce((sum, client) => sum + (client.stats?.total_activites || 0), 0) / clientsActifs.length : 0,
      
      // Efficacité relances
      tauxReponseRelances: relances.length > 0 ? 
        (relances.filter(r => r.statut === 'traitee').length / relances.length) * 100 : 0
    };
  };

  const kpis = calculerKPIs();

  if (loading) {
    return (
      <div className="statistiques-container">
        <div className="loading">Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="statistiques-container">
      <div className="statistiques-header">
        <h1>Analytics & Statistiques</h1>
        <div className="filtres">
          <button 
            className={`filtre-btn ${filtre === 'mois' ? 'active' : ''}`}
            onClick={() => setFiltre('mois')}
          >
            Mois
          </button>
          <button 
            className={`filtre-btn ${filtre === 'trimestre' ? 'active' : ''}`}
            onClick={() => setFiltre('trimestre')}
          >
            Trimestre
          </button>
          <button 
            className={`filtre-btn ${filtre === 'annee' ? 'active' : ''}`}
            onClick={() => setFiltre('annee')}
          >
            Année
          </button>
        </div>
      </div>

      {/* KPI Principaux */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon performance">
            <i className="icon-trending-up"></i>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">{kpis.tauxConversion.toFixed(1)}%</h3>
            <p className="kpi-label">Taux de Conversion</p>
            <div className="kpi-trend positive">
              <span>+5.2% vs période précédente</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon revenue">
            <i className="icon-euro"></i>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">{kpis.valeurMoyenneDevis.toLocaleString()} €</h3>
            <p className="kpi-label">Valeur Moyenne Devis</p>
            <div className="kpi-trend positive">
              <span>+8.1% vs période précédente</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card">
          <div className="kpi-icon engagement">
            <i className="icon-activity"></i>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">{kpis.activitesParClient.toFixed(1)}</h3>
            <p className="kpi-label">Activités/Client</p>
            <div className="kpi-trend neutral">
              <span>Stable</span>
            </div>
          </div>
        </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon response">
            <i className="icon-clock"></i>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">{kpis.delaiMoyenReponse}j</h3>
            <p className="kpi-label">Délai Réponse Moyen</p>
            <div className="kpi-trend negative">
              <span>-1.2j vs période précédente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses détaillées */}
      <div className="analytics-grid">
        {/* Répartition des devis */}
        <div className="analytics-card">
          <h3>Répartition des Devis</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {['brouillon', 'envoye', 'accepte', 'refuse', 'expire'].map(statut => {
                const count = devis.filter(d => d.statut === statut).length;
                const percentage = (count / Math.max(devis.length, 1)) * 100;
                
                return (
                  <div key={statut} className="bar-item">
                    <div className="bar-label">{statut}</div>
                    <div className="bar-track">
                      <div 
                        className={`bar-fill ${statut}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="bar-value">{count} ({percentage.toFixed(1)}%)</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance par canal de relance */}
        <div className="analytics-card">
          <h3>Performance des Relances par Canal</h3>
          <div className="canal-stats">
            {['email', 'telephone', 'courrier', 'sms'].map(canal => {
              const relancesCanal = relances.filter(r => r.canal === canal);
              const tauxReponse = relancesCanal.length > 0 ? 
                (relancesCanal.filter(r => r.statut === 'traitee').length / relancesCanal.length) * 100 : 0;
              
              return (
                <div key={canal} className="canal-item">
                  <div className="canal-info">
                    <span className="canal-name">{canal}</span>
                    <span className="canal-count">{relancesCanal.length} relances</span>
                  </div>
                  <div className="canal-performance">
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ width: `${tauxReponse}%` }}
                      ></div>
                    </div>
                    <span className="performance-value">{tauxReponse.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top produits/services */}
        <div className="analytics-card">
          <h3>Types de Contrats les Plus Demandés</h3>
          <div className="contrats-stats">
            {['Maintenance', 'Consulting', 'Formation', 'Support'].map(type => {
              // Simulation - à remplacer par données réelles
              const count = Math.floor(Math.random() * 20) + 5;
              
              return (
                <div key={type} className="contrat-item">
                  <span className="contrat-type">{type}</span>
                  <div className="contrat-bar">
                    <div 
                      className="contrat-fill"
                      style={{ width: `${(count / 25) * 100}%` }}
                    ></div>
                  </div>
                  <span className="contrat-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tendances temporelles */}
        <div className="analytics-card">
          <h3>Évolution du Chiffre d'Affaires</h3>
          <div className="trend-chart">
            {/* Graphique simplifié - à remplacer par une librairie de charts */}
            <div className="trend-bars">
              {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'].map(mois => {
                const montant = Math.floor(Math.random() * 100000) + 50000;
                return (
                  <div key={mois} className="trend-bar">
                    <div 
                      className="trend-fill"
                      style={{ height: `${(montant / 150000) * 100}%` }}
                    ></div>
                    <span className="trend-label">{mois}</span>
                    <span className="trend-value">{(montant / 1000).toFixed(0)}k</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="insights-card">
        <h3>Insights & Recommandations</h3>
        <div className="insights-list">
          <div className="insight-item positive">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Performance Excellente</h4>
              <p>Votre taux de conversion a augmenté de 5.2% cette période.</p>
            </div>
          </div>
          <div className="insight-item warning">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <h4>Délais à Améliorer</h4>
              <p>Le délai de réponse moyen pourrait être réduit pour améliorer la satisfaction client.</p>
            </div>
          </div>
          <div className="insight-item info">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>Opportunité Détectée</h4>
              <p>Les relances téléphoniques ont un taux de réponse 30% plus élevé que les emails.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesPage;