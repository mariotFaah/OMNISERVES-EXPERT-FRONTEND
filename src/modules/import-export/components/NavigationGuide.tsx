import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './NavigationGuideTabs.css';

export const NavigationGuideTabs: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Tableau de Bord', 
      href: '/import-export', 
      current: location.pathname === '/import-export' 
    },
    { 
      name: 'Commandes', 
      href: '/import-export/commandes', 
      current: location.pathname.includes('/import-export/commandes') && 
               !location.pathname.includes('/nouvelle') &&
               !location.pathname.match(/\/commandes\/[^\/]+\/edit/) &&
               !location.pathname.match(/\/commandes\/[^\/]+\/marge/) &&
               !location.pathname.match(/\/commandes\/[^\/]+\/couts/)
    },
    { 
      name: 'Expéditions', 
      href: '/import-export/expeditions', 
      current: location.pathname.includes('/import-export/expeditions')
    },
    { 
      name: 'Analyses', 
      href: '/import-export/analyses', 
      current: location.pathname.includes('/import-export/analyses')
    },
  ];

  return (
    <div className="navigation-guide-tabs">
     
      {/* Navigation */}
      <div className="navigation-tabs-container">
        <nav className="navigation-tabs" aria-label="Navigation tabs">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`navigation-tab ${item.current ? 'current' : ''}`}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      <div className="navigation-content">
        <Outlet />
      </div>
    </div>
  );
};

export default NavigationGuideTabs;