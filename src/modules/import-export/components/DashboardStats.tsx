import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClipboardList, 
  FaDollarSign, 
  FaDownload, 
  FaUpload, 
  FaClock, 
  FaTruck, 
  FaBox, 
  FaReceipt,
  FaExclamationTriangle
} from 'react-icons/fa';
import type { Commande } from '../types';
import './DashboardStats.css';

interface DashboardStatsProps {
  commandes: Commande[];
  loading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ commandes, loading }) => {
  const [showAll, setShowAll] = useState(false);

  // Filtrer les commandes valides (avec lignes et CA > 0)
  const commandesValides = commandes.filter(commande => 
    commande.lignes && 
    commande.lignes.length > 0 && 
    parseFloat(commande.montant_total.toString()) > 0
  );

  if (loading) {
    return (
      <div className="dashboard-stats loading">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="stat-skeleton"></div>
        ))}
      </div>
    );
  }

  // Calcul des statistiques
  const stats = {
    total: commandesValides.length,
    import: commandesValides.filter(c => c.type === 'import').length,
    export: commandesValides.filter(c => c.type === 'export').length,
    brouillon: commandesValides.filter(c => c.statut === 'brouillon').length,
    confirmee: commandesValides.filter(c => c.statut === 'confirmée').length,
    expediee: commandesValides.filter(c => c.statut === 'expédiée').length,
    livree: commandesValides.filter(c => c.statut === 'livrée').length,
    annulee: commandesValides.filter(c => c.statut === 'annulée').length,
    chiffreAffaires: commandesValides.reduce((sum, c) => sum + parseFloat(c.montant_total.toString()), 0),
    avecExpedition: commandesValides.filter(c => c.expedition).length,
    avecCouts: commandesValides.filter(c => 
      c.couts_logistiques && 
      (parseFloat(c.couts_logistiques.fret_maritime?.toString() || '0') > 0 ||
       parseFloat(c.couts_logistiques.fret_aerien?.toString() || '0') > 0 ||
       parseFloat(c.couts_logistiques.assurance?.toString() || '0') > 0)
    ).length
  };

  const getDevisePrincipale = () => {
    const devises = commandesValides.reduce((acc, cmd) => {
      acc[cmd.devise] = (acc[cmd.devise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(devises).reduce((a, b) => 
      devises[a] > devises[b] ? a : b, 'EUR'
    );
  };

  const devisePrincipale = getDevisePrincipale();

  const mainStatCards = [
    {
      title: 'Commandes Actives',
      value: stats.total,
      icon: FaClipboardList,
      color: 'blue',
      link: '/import-export/commandes',
      description: 'Commandes avec articles'
    },
    {
      title: 'Chiffre d\'Affaires',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: devisePrincipale,
        minimumFractionDigits: 0,
      }).format(stats.chiffreAffaires),
      icon: FaDollarSign,
      color: 'indigo',
      link: '/import-export/analyses',
      description: `${stats.total} commandes valides`
    },
    {
      title: 'Opérations Import',
      value: stats.import,
      icon: FaDownload,
      color: 'green',
      link: '/import-export/commandes?type=import',
      description: `${stats.import} commandes`
    },
    {
      title: 'Opérations Export',
      value: stats.export,
      icon: FaUpload,
      color: 'purple',
      link: '/import-export/commandes?type=export',
      description: `${stats.export} commandes`
    }
  ];

  const secondaryStatCards = [
    {
      title: 'En Préparation',
      value: stats.brouillon + stats.confirmee,
      icon: FaClock,
      color: 'orange',
      link: '/import-export/commandes?statut=brouillon,confirmée',
      description: `${stats.brouillon} brouillon + ${stats.confirmee} confirmée`
    },
    {
      title: 'Expédiées/Livrées',
      value: stats.expediee + stats.livree,
      icon: FaTruck,
      color: 'teal',
      link: '/import-export/expeditions',
      description: `${stats.expediee} expédiée + ${stats.livree} livrée`
    },
    {
      title: 'Avec Expédition',
      value: stats.avecExpedition,
      icon: FaBox,
      color: 'cyan',
      link: '/import-export/expeditions',
      description: `${Math.round((stats.avecExpedition / stats.total) * 100)}% des commandes`
    },
    {
      title: 'Avec Coûts Logistiques',
      value: stats.avecCouts,
      icon: FaReceipt,
      color: 'amber',
      link: '/import-export/analyses',
      description: 'Coûts enregistrés'
    }
  ];

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h3 className="stats-title">Tableau de Bord Import-Export</h3>
        <p className="stats-subtitle">
          {stats.total} commandes actives • {devisePrincipale}
        </p>
      </div>
      
      <div className="stats-grid main-grid">
        {mainStatCards.map((stat, index) => (
          <Link key={index} to={stat.link} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon className="h-8 w-8" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              {stat.description && (
                <div className="stat-description">{stat.description}</div>
              )}
            </div>
            <div className="stat-arrow">→</div>
          </Link>
        ))}
      </div>

      {showAll && (
        <div className="stats-grid secondary-grid">
          {secondaryStatCards.map((stat, index) => (
            <Link key={index} to={stat.link} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                {stat.description && (
                  <div className="stat-description">{stat.description}</div>
                )}
              </div>
              <div className="stat-arrow">→</div>
            </Link>
          ))}
        </div>
      )}

      <div className="stats-toggle">
        <button 
          className="toggle-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? '▲ Voir moins' : '▼ Voir plus d\'indicateurs'}
        </button>
      </div>

      <div className="stats-alerts">
        {stats.brouillon > 0 && (
          <div className="alert-item warning">
            <FaExclamationTriangle className="h-5 w-5 alert-icon" />
            <span className="alert-text">
              {stats.brouillon} commande(s) en brouillon à finaliser
            </span>
          </div>
        )}
        
        {stats.avecExpedition < stats.total && (
          <div className="alert-item info">
            <FaTruck className="h-5 w-5 alert-icon" />
            <span className="alert-text">
              {stats.total - stats.avecExpedition} commande(s) sans expédition
            </span>
          </div>
        )}

        {stats.annulee > 0 && (
          <div className="alert-item error">
            <FaExclamationTriangle className="h-5 w-5 alert-icon" />
            <span className="alert-text">
              {stats.annulee} commande(s) annulée(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
