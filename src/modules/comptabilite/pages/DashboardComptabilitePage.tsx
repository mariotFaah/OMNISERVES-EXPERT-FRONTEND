// src/modules/comptabilite/pages/DashboardComptabilitePage.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { rapportApi } from '../services/rapportApi';
import { ecritureApi } from '../services/ecritureApi';
import { paiementApi } from '../services/paiementApi';
import type { 
  RapportCompteResultat, 
  RapportTresorerie,
  Paiement,
  EcritureComptable 
} from '../types';
import './DashboardComptabilitePage.css';

// Supprimer l'interface DashboardStats inutilisée
interface FactureEnAttente {
  id: number;
  numero: string;
  client: string;
  montant: number;
  dateEcheance: string;
  joursRetard: number;
}

interface IndicateurCle {
  label: string;
  valeur: string | number;
  variation: number;
  tendance: 'up' | 'down' | 'stable';
  icone: React.ReactNode;
}

interface RealData {
  chiffreAffairesMois: number;
  chiffreAffairesVariation: number;
  tresorerieActuelle: number;
  tresorerieVariation: number;
  facturesImpayeesCount: number;
  montantEnRetard: number;
  tauxEncaissement: number;
  ecrituresMois: number;
  paiementsMois: number;
}

const DashboardComptabilitePage: React.FC = () => {
  const [facturesEnAttente, setFacturesEnAttente] = useState<FactureEnAttente[]>([]);
  const [indicateurs, setIndicateurs] = useState<IndicateurCle[]>([]);
  const [realData, setRealData] = useState<RealData>({
    chiffreAffairesMois: 0,
    chiffreAffairesVariation: 0,
    tresorerieActuelle: 0,
    tresorerieVariation: 0,
    facturesImpayeesCount: 0,
    montantEnRetard: 0,
    tauxEncaissement: 0,
    ecrituresMois: 0,
    paiementsMois: 0
  });
  const [periode, setPeriode] = useState<'semaine' | 'mois' | 'trimestre'>('mois');
  const [loading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    chargerDonneesDashboard();
  }, [periode]);

  const chargerDonneesDashboard = async () => {
    try {
     // setLoading(true);
      setError('');
      
      // Obtenir la date actuelle pour le mois en cours
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const dateDebut = `${year}-${month.toString().padStart(2, '0')}-01`;
      const dateFin = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      
      // Obtenir la date du mois précédent pour les variations
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevDateDebut = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
      const prevDateFin = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${new Date(prevYear, prevMonth, 0).getDate()}`;

      console.log('📊 Chargement données dashboard pour période:', periode);
      console.log('📅 Dates actuelles:', dateDebut, 'à', dateFin);
      console.log('📅 Dates précédentes:', prevDateDebut, 'à', prevDateFin);

      // 1. Charger le compte de résultat pour le CA
      const compteResultat: RapportCompteResultat = await rapportApi.getCompteResultat(dateDebut, dateFin);
      const compteResultatPrecedent: RapportCompteResultat = await rapportApi.getCompteResultat(prevDateDebut, prevDateFin);
      
      // 2. Charger la trésorerie
      const tresorerie: RapportTresorerie = await rapportApi.getTresorerie(dateDebut, dateFin);
      const tresoreriePrecedente: RapportTresorerie = await rapportApi.getTresorerie(prevDateDebut, prevDateFin);
      
      // 3. Charger les écritures du mois
      const ecritures: EcritureComptable[] = await ecritureApi.getEcrituresComptables({
        date_debut: dateDebut,
        date_fin: dateFin
      });
      
      // 4. Charger les paiements du mois
      const paiements: Paiement[] = await paiementApi.getPaiements();
      const paiementsMois = paiements.filter(p => {
        const paiementDate = new Date(p.created_at || '');
        return paiementDate >= new Date(dateDebut) && paiementDate <= new Date(dateFin);
      });
      
      // Calculer les indicateurs
      const chiffreAffairesMois = compteResultat.produits || 0;
      const chiffreAffairesMoisPrecedent = compteResultatPrecedent.produits || 1; // Éviter division par 0
      const chiffreAffairesVariation = ((chiffreAffairesMois - chiffreAffairesMoisPrecedent) / chiffreAffairesMoisPrecedent) * 100;
      
      const tresorerieActuelle = tresorerie.solde_tresorerie || 0;
      const tresoreriePrecedenteVal = tresoreriePrecedente.solde_tresorerie || 1;
      const tresorerieVariation = ((tresorerieActuelle - tresoreriePrecedenteVal) / tresoreriePrecedenteVal) * 100;
      
      // Calculer le taux d'encaissement (simplifié)
      const paiementsValides = paiementsMois.filter(p => p.statut === 'validé').length;
      const tauxEncaissement = paiementsMois.length > 0 ? (paiementsValides / paiementsMois.length) * 100 : 0;
      
      // Compter les factures impayées (simplifié)
      const facturesImpayees = paiementsMois.filter(p => 
        p.statut === 'en_attente' || p.statut === 'annulé'
      ).length;
      
      // Montant total en retard
      const montantEnRetard = paiementsMois
        .filter(p => p.statut === 'en_attente')
        .reduce((sum, p) => sum + (p.montant || 0), 0);
      
      // Préparer les données réelles
      const realData: RealData = {
        chiffreAffairesMois,
        chiffreAffairesVariation,
        tresorerieActuelle,
        tresorerieVariation,
        facturesImpayeesCount: facturesImpayees,
        montantEnRetard,
        tauxEncaissement,
        ecrituresMois: ecritures.length,
        paiementsMois: paiementsMois.length
      };
      
      // Préparer les indicateurs
      const updatedIndicateurs: IndicateurCle[] = [
        {
          label: 'Chiffre d\'affaires',
          valeur: formatMontant(chiffreAffairesMois),
          variation: chiffreAffairesVariation,
          tendance: chiffreAffairesVariation >= 0 ? 'up' : 'down',
          icone: <TrendingUp className="icon" />
        },
        {
          label: 'Trésorerie',
          valeur: formatMontant(tresorerieActuelle),
          variation: tresorerieVariation,
          tendance: tresorerieVariation >= 0 ? 'up' : 'down',
          icone: <DollarSign className="icon" />
        },
        {
          label: 'Factures impayées',
          valeur: facturesImpayees,
          variation: 0,
          tendance: facturesImpayees > 0 ? 'down' : 'stable',
          icone: <AlertTriangle className="icon" />
        },
        {
          label: 'Taux d\'encaissement',
          valeur: `${tauxEncaissement.toFixed(1)}%`,
          variation: 0,
          tendance: tauxEncaissement >= 70 ? 'up' : tauxEncaissement >= 50 ? 'stable' : 'down',
          icone: <BarChart3 className="icon" />
        }
      ];
      
      // Factures en attente (simplifié)
      const facturesEnAttenteData: FactureEnAttente[] = paiementsMois
        .filter(p => p.statut === 'en_attente')
        .slice(0, 3)
        .map((p, index) => ({
          id: p.id_paiement || index,
          numero: `PAY-${p.id_paiement || index}`,
          client: p.reference || 'Client inconnu',
          montant: p.montant || 0,
          dateEcheance: p.date_paiement || new Date().toISOString().split('T')[0],
          joursRetard: Math.max(0, Math.floor((new Date().getTime() - new Date(p.date_paiement || new Date()).getTime()) / (1000 * 3600 * 24)))
        }));
      
      setRealData(realData);
      setIndicateurs(updatedIndicateurs);
      setFacturesEnAttente(facturesEnAttenteData);
      setLastUpdated(new Date().toLocaleTimeString());
      
      console.log('✅ Données réelles chargées:', realData);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement dashboard:', error);
      setError(`Erreur de chargement: ${error.message}`);
      
      // Données de secours
      const fallbackRealData: RealData = {
        chiffreAffairesMois: 0,
        chiffreAffairesVariation: 0,
        tresorerieActuelle: 0,
        tresorerieVariation: 0,
        facturesImpayeesCount: 0,
        montantEnRetard: 0,
        tauxEncaissement: 0,
        ecrituresMois: 0,
        paiementsMois: 0
      };
      
      setRealData(fallbackRealData);
      
    } finally {
      //setLoading(false);
    }
  };

  const formatMontant = (montant: number): string => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M MGA`;
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K MGA`;
    }
    return `${montant.toFixed(0)} MGA`;
  };

  const getCouleurTendance = (tendance: string) => {
    switch (tendance) {
      case 'up': return 'var(--success)';
      case 'down': return 'var(--error)';
      default: return 'var(--warning)';
    }
  };

  const getCouleurJoursRetard = (jours: number) => {
    if (jours <= 5) return 'var(--warning)';
    if (jours <= 15) return 'var(--error-light)';
    return 'var(--error)';
  };

  const getPeriodeLabel = () => {
    switch (periode) {
      case 'semaine': return 'Cette semaine';
      case 'mois': return 'Ce mois';
      case 'trimestre': return 'Ce trimestre';
      default: return 'Cette période';
    }
  };

  /*if (loading) {
    return (
      <div className="dashboard-comptabilite loading">
        <div className="loading-spinner">
          <RefreshCw className="spinner-icon" />
          <p>Chargement des données comptables...</p>
        </div>
      </div>
    );
  }*/

  return (
    <div className="dashboard-comptabilite">
      {/* En-tête du Dashboard */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Tableau de Bord Comptabilité</h1>
          <div className="periode-info">
            <Calendar className="calendar-icon" />
            <span>{getPeriodeLabel()}</span>
            {lastUpdated && (
              <span className="last-updated">
                Dernière mise à jour: {lastUpdated}
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="period-selector">
            <button 
              className={periode === 'semaine' ? 'active' : ''}
              onClick={() => setPeriode('semaine')}
            >
              Semaine
            </button>
            <button 
              className={periode === 'mois' ? 'active' : ''}
              onClick={() => setPeriode('mois')}
            >
              Mois
            </button>
            <button 
              className={periode === 'trimestre' ? 'active' : ''}
              onClick={() => setPeriode('trimestre')}
            >
              Trimestre
            </button>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={chargerDonneesDashboard}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'spinning' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
          <button onClick={chargerDonneesDashboard}>Réessayer</button>
        </div>
      )}

      {/* Indicateurs Clés avec données réelles */}
      <div className="indicateurs-grid">
        {indicateurs.map((indicateur, index) => (
          <div key={index} className="indicateur-card">
            <div className="indicateur-header">
              <div className="indicateur-icon" style={{ color: getCouleurTendance(indicateur.tendance) }}>
                {indicateur.icone}
              </div>
              <div className={`variation ${indicateur.tendance}`}>
                {indicateur.variation > 0 ? '+' : ''}{indicateur.variation.toFixed(1)}%
              </div>
            </div>
            <div className="indicateur-valeur">{indicateur.valeur}</div>
            <div className="indicateur-label">{indicateur.label}</div>
            <div className="indicateur-periode">{getPeriodeLabel()}</div>
          </div>
        ))}
      </div>

      {/* Grille Principale - Réorganisée */}
      <div className="dashboard-grid">
        {/* Carte Trésorerie Réelle */}
        <div className="dashboard-card tresorerie-card">
          <div className="card-header">
            <h3>💳 Trésorerie Actuelle</h3>
            <span className={`statut-badge ${realData.tresorerieVariation >= 0 ? 'positif' : 'negatif'}`}>
              {realData.tresorerieVariation >= 0 ? '+' : ''}{realData.tresorerieVariation.toFixed(1)}%
            </span>
          </div>
          <div className="tresorerie-montant">{formatMontant(realData.tresorerieActuelle)}</div>
          <div className="tresorerie-details">
            <div className="detail-item">
              <span>Chiffre d'affaires mensuel</span>
              <span className="detail-value positive">
                {formatMontant(realData.chiffreAffairesMois)}
              </span>
            </div>
            <div className="detail-item">
              <span>Paiements traités</span>
              <span className="detail-value">{realData.paiementsMois} opérations</span>
            </div>
            <div className="detail-item">
              <span>Écritures comptables</span>
              <span className="detail-value">{realData.ecrituresMois} écritures</span>
            </div>
          </div>
        </div>

        {/* Alertes avec données réelles */}
        <div className="dashboard-card alertes-card">
          <div className="card-header">
            <h3>🚨 Alertes et Surveillance</h3>
            <span className="badge-urgent">{realData.facturesImpayeesCount}</span>
          </div>
          <div className="alertes-list">
            {realData.facturesImpayeesCount > 0 ? (
              <div className="alerte-item urgent">
                <AlertTriangle className="alerte-icon" />
                <div className="alerte-content">
                  <span className="alerte-titre">{realData.facturesImpayeesCount} factures impayées</span>
                  <span className="alerte-sous-titre">
                    {formatMontant(realData.montantEnRetard)} en retard
                  </span>
                </div>
              </div>
            ) : (
              <div className="alerte-item success">
                <CheckCircle className="alerte-icon" />
                <div className="alerte-content">
                  <span className="alerte-titre">Aucune facture impayée</span>
                  <span className="alerte-sous-titre">Tous les paiements sont à jour</span>
                </div>
              </div>
            )}
            
            <div className="alerte-item info">
              <BarChart3 className="alerte-icon" />
              <div className="alerte-content">
                <span className="alerte-titre">Taux d'encaissement: {realData.tauxEncaissement.toFixed(1)}%</span>
                <span className="alerte-sous-titre">
                  {realData.tauxEncaissement >= 80 ? 'Excellent' : 
                   realData.tauxEncaissement >= 60 ? 'Bon' : 
                   'À améliorer'}
                </span>
              </div>
            </div>
            
            <div className="alerte-item warning">
              <Clock className="alerte-icon" />
              <div className="alerte-content">
                <span className="alerte-titre">Surveillance trésorerie</span>
                <span className="alerte-sous-titre">
                  Ratio: {(realData.tresorerieActuelle / Math.max(realData.chiffreAffairesMois, 1) * 100).toFixed(0)}% du CA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Factures en Attente Réelles */}
        <div className="dashboard-card factures-card">
          <div className="card-header">
            <h3>📋 Factures en Retard</h3>
            <span className="badge-attention">{facturesEnAttente.length}</span>
          </div>
          <div className="factures-list">
            {facturesEnAttente.length > 0 ? (
              facturesEnAttente.map(facture => (
                <div key={facture.id} className="facture-item">
                  <div className="facture-info">
                    <div className="facture-numero">{facture.numero}</div>
                    <div className="facture-client">{facture.client}</div>
                  </div>
                  <div className="facture-details">
                    <div 
                      className="jours-retard"
                      style={{ color: getCouleurJoursRetard(facture.joursRetard) }}
                    >
                      +{facture.joursRetard} jours
                    </div>
                    <div className="facture-montant">
                      {formatMontant(facture.montant)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-factures">
                <CheckCircle className="no-factures-icon" />
                <span>Aucune facture en retard</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>⚡ Actions Rapides</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn primary">
              <FileText />
              Nouvelle Facture
            </button>
            <button className="action-btn secondary">
              <Users />
              Ajouter Client
            </button>
            <button className="action-btn success">
              <TrendingUp />
              Voir Rapports
            </button>
            <button className="action-btn warning">
              <Clock />
              Gérer Échéances
            </button>
            <button className="action-btn info">
              <BarChart3 />
              Analyse CA
            </button>
            <button className="action-btn dark">
              <DollarSign />
              Trésorerie
            </button>
          </div>
        </div>

        {/* Section côte à côte : Performance Mensuelle + Vue d'ensemble */}
        <div className="performance-section">
          {/* Graphique CA et Statistiques */}
          <div className="dashboard-card stats-card">
            <div className="card-header">
              <h3>📈 Performance Mensuelle</h3>
              <span className={`statut-badge ${realData.chiffreAffairesVariation >= 0 ? 'positif' : 'negatif'}`}>
                {realData.chiffreAffairesVariation >= 0 ? '+' : ''}{realData.chiffreAffairesVariation.toFixed(1)}%
              </span>
            </div>
            <div className="ca-montant">{formatMontant(realData.chiffreAffairesMois)}</div>
            <div className="stats-details">
              <div className="stat-item">
                <span>Chiffre d'affaires</span>
                <span className="stat-value">{formatMontant(realData.chiffreAffairesMois)}</span>
              </div>
              <div className="stat-item">
                <span>Paiements traités</span>
                <span className="stat-value">{realData.paiementsMois}</span>
              </div>
              <div className="stat-item">
                <span>Écritures validées</span>
                <span className="stat-value">{realData.ecrituresMois}</span>
              </div>
              <div className="stat-item">
                <span>Taux succès paiements</span>
                <span className="stat-value">{realData.tauxEncaissement.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Vue d'ensemble */}
          <div className="dashboard-card vue-ensemble-card">
            <div className="card-header">
              <h3>👁️ Vue d'ensemble</h3>
            </div>
            <div className="vue-content">
              <div className="vue-item">
                <div className="vue-label">État des finances</div>
                <div className={`vue-status ${realData.tresorerieActuelle > 1000000 ? 'good' : 'warning'}`}>
                  {realData.tresorerieActuelle > 1000000 ? 'Sain' : 'À surveiller'}
                </div>
              </div>
              <div className="vue-item">
                <div className="vue-label">Performance CA</div>
                <div className={`vue-status ${realData.chiffreAffairesVariation > 0 ? 'good' : 'critical'}`}>
                  {realData.chiffreAffairesVariation > 0 ? 'Croissant' : 'Décroissant'}
                </div>
              </div>
              <div className="vue-item">
                <div className="vue-label">Gestion recouvrement</div>
                <div className={`vue-status ${realData.facturesImpayeesCount === 0 ? 'good' : 'critical'}`}>
                  {realData.facturesImpayeesCount === 0 ? 'Efficace' : 'À améliorer'}
                </div>
              </div>
              <div className="vue-item">
                <div className="vue-label">Liquidité</div>
                <div className={`vue-status ${(realData.tresorerieActuelle / Math.max(realData.chiffreAffairesMois, 1)) > 0.3 ? 'good' : 'warning'}`}>
                  {(realData.tresorerieActuelle / Math.max(realData.chiffreAffairesMois, 1) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page avec métriques */}
      <div className="dashboard-footer">
        <div className="footer-metrics">
          <div className="metric">
            <span className="metric-label">Données en temps réel</span>
            <span className="metric-value">{lastUpdated || 'Non disponible'}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Période analysée</span>
            <span className="metric-value">{getPeriodeLabel()}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Devise</span>
            <span className="metric-value">MGA (Ariary malgache)</span>
          </div>
        </div>
        <div className="footer-info">
          <span>OMNISERVE EXPERTS - Dashboard Comptabilité</span>
          <span>Données extraites des API comptables</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardComptabilitePage;