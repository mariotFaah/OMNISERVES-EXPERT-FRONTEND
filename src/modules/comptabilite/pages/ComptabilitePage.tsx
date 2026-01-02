import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './ComptabilitePage.css';

export const ComptabilitePage: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de Bord', href: '/comptabilite', current: location.pathname === '/comptabilite' },
    { name: 'Factures', href: '/comptabilite/factures', current: location.pathname.includes('/comptabilite/factures') },
    { name: 'Tiers', href: '/comptabilite/tiers', current: location.pathname.includes('/comptabilite/tiers') },
    { name: 'Articles', href: '/comptabilite/articles', current: location.pathname.includes('/comptabilite/articles') },
    { name: 'Rapports', href: '/comptabilite/rapports', current: location.pathname.includes('/comptabilite/rapports') },
  ];

  return (
    <div className="comptabilite-page">
    

      {/* Navigation */}
      <div className="comptabilite-nav-container">
        <nav className="comptabilite-nav" aria-label="Tabs">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`comptabilite-nav-link ${item.current ? 'current' : ''}`}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      <div className="comptabilite-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ComptabilitePage;