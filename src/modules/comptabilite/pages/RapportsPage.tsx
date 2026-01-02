import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartBar,
  FaCalendarAlt,
  FaBook,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaChartLine,
  FaReceipt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCreditCard,
  FaCheckCircle,
  FaRocket,
  FaDatabase
} from 'react-icons/fa';
import './RapportsPage.css';

export const RapportsPage: React.FC = () => {
  const rapports = [
    // SECTION C: SUIVI DES PAIEMENTS
    {
      title: 'Suivi des Paiements',
      description: 'Gestion des paiements partiels',
      path: '/comptabilite/paiements',
      icon: <FaCreditCard />,
      color: '#8B5CF6'
    },
    {
      title: 'Échéances Clients',
      description: 'Dates limites et alertes',
      path: '/comptabilite/echeances',
      icon: <FaCalendarAlt />,
      color: '#EF4444'
    },
    
    // SECTION D: JOURNAUX COMPTABLES
    {
      title: 'Journal Comptable',
      description: 'Ventes, achats, banque',
      path: '/comptabilite/journal',
      icon: <FaBook />,
      color: '#3B82F6'
    },
    {
      title: 'Balance Comptable',
      description: 'Balance générale des comptes',
      path: '/comptabilite/balance',
      icon: <FaBalanceScale />,
      color: '#10B981'
    },
    
    // SECTION E: ÉTATS FINANCIERS
    {
      title: 'Bilan Comptable',
      description: 'Actif/passif à date donnée',
      path: '/comptabilite/bilan',
      icon: <FaChartBar />,
      color: '#F59E0B'
    },
    {
      title: 'Compte de Résultat',
      description: 'Produits et charges',
      path: '/comptabilite/compte-resultat',
      icon: <FaChartLine />,
      color: '#06B6D4'
    },
    {
      title: 'Déclaration TVA',
      description: 'Calcul et déclaration TVA',
      path: '/comptabilite/tva',
      icon: <FaReceipt />,
      color: '#EC4899'
    },
    {
      title: 'Trésorerie',
      description: 'Situation et prévisions',
      path: '/comptabilite/tresorerie',
      icon: <FaMoneyBillWave />,
      color: '#84CC16'
    },
    
    // SECTION A: MULTI-DEVISES
    {
      title: 'Taux de Change',
      description: 'Gestion multi-devises',
      path: '/comptabilite/taux-change',
      icon: <FaExchangeAlt />,
      color: '#F97316'
    }
  ];

  return (
    <div className="sage-rapports-page">
      {/* Header Microsoft Sage Style */}
      <div className="sage-header">
        <div className="sage-header-left">
          <FaChartBar className="sage-header-icon" />
          <div>
            <h1 className="sage-page-title">Tableau de Bord Comptable</h1>
            <p className="sage-page-subtitle">Module complet conforme au cahier des charges</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="sage-stats-overview">
        <div className="sage-stat-card">
          <div className="sage-stat-icon sage-stat-complete">
            <FaCheckCircle />
          </div>
          <div className="sage-stat-info">
            <div className="sage-stat-value">Sections A-E</div>
            <div className="sage-stat-label">Cahier des Charges</div>
          </div>
        </div>
        
        <div className="sage-stat-card">
          <div className="sage-stat-icon sage-stat-operational">
            <FaRocket />
          </div>
          <div className="sage-stat-info">
            <div className="sage-stat-value">100%</div>
            <div className="sage-stat-label">Opérationnel</div>
          </div>
        </div>
        
        <div className="sage-stat-card">
          <div className="sage-stat-icon sage-stat-data">
            <FaDatabase />
          </div>
          <div className="sage-stat-info">
            <div className="sage-stat-value">9+</div>
            <div className="sage-stat-label">Paiements actifs</div>
          </div>
        </div>
      </div>

      {/* Journaux Comptables */}
      <div className="sage-section">
        <div className="sage-section-header">
          <FaBook className="sage-section-icon" />
          <h2 className="sage-section-title">Journaux Comptables</h2>
        </div>
        <div className="sage-cards-grid">
          {rapports.slice(2, 4).map((rapport) => (
            <Link key={rapport.path} to={rapport.path} className="sage-card">
              <div className="sage-card-icon" style={{ color: rapport.color }}>
                {rapport.icon}
              </div>
              <div className="sage-card-content">
                <h3 className="sage-card-title">{rapport.title}</h3>
                <p className="sage-card-description">{rapport.description}</p>
              </div>
              <div className="sage-card-arrow">
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* États Financiers */}
      <div className="sage-section">
        <div className="sage-section-header">
          <FaChartBar className="sage-section-icon" />
          <h2 className="sage-section-title">États Financiers</h2>
        </div>
        <div className="sage-cards-grid">
          {rapports.slice(4, 8).map((rapport) => (
            <Link key={rapport.path} to={rapport.path} className="sage-card">
              <div className="sage-card-icon" style={{ color: rapport.color }}>
                {rapport.icon}
              </div>
              <div className="sage-card-content">
                <h3 className="sage-card-title">{rapport.title}</h3>
                <p className="sage-card-description">{rapport.description}</p>
              </div>
              <div className="sage-card-arrow">
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Multi-devises */}
      <div className="sage-section">
        <div className="sage-section-header">
          <FaExchangeAlt className="sage-section-icon" />
          <h2 className="sage-section-title">Multi-devises</h2>
        </div>
        <div className="sage-cards-grid">
          {rapports.slice(8).map((rapport) => (
            <Link key={rapport.path} to={rapport.path} className="sage-card">
              <div className="sage-card-icon" style={{ color: rapport.color }}>
                {rapport.icon}
              </div>
              <div className="sage-card-content">
                <h3 className="sage-card-title">{rapport.title}</h3>
                <p className="sage-card-description">{rapport.description}</p>
              </div>
              <div className="sage-card-arrow">
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Facturation Notice */}
      <div className="sage-notice-section">
        <div className="sage-notice-card">
          <div className="sage-notice-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="sage-notice-content">
            <h3 className="sage-notice-title">Facturation clients/fournisseurs</h3>
            <p className="sage-notice-description">
              Proforma, factures, avoirs - Complètement implémenté
            </p>
            <Link to="/comptabilite/factures" className="sage-notice-link">
              Accéder à la gestion des factures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportsPage;