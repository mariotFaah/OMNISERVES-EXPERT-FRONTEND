import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import {
  FiHome,
  FiDollarSign,
  FiGlobe,
  FiUsers,
  FiSettings,
  FiTrendingUp,
  FiFileText,
  FiUser,
  FiPackage,
  FiCheckSquare,
  FiBook,
  FiBarChart2,
  FiFile,
  FiList,
  FiTruck,
  FiPieChart,
  FiUserCheck,
  FiFilePlus,
  FiFileMinus,
  FiCalendar,
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiRefreshCw
} from 'react-icons/fi';
import './Sidebar.css';



interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Définir les interfaces pour les types de menu
interface MenuItemBase {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | null;
  requiredRole?: ('admin' | 'comptable' | 'commercial')[];
}

interface MenuItemWithChildren extends MenuItemBase {
  children: MenuItemBase[];
}

interface MenuItemWithoutChildren extends MenuItemBase {
  children?: undefined;
}

type MenuItem = MenuItemWithChildren | MenuItemWithoutChildren;

// Type guard pour vérifier si un item a des enfants
const hasChildren = (item: MenuItem): item is MenuItemWithChildren => {
  return Array.isArray((item as MenuItemWithChildren).children);
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    crm: location.pathname.startsWith('/crm'),
    comptabilite: location.pathname.startsWith('/comptabilite'),
    importExport: location.pathname.startsWith('/import-export'),
    admin: location.pathname.startsWith('/admin')
  });

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const hasAccess = (item: MenuItemBase): boolean => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    
    // Admin a accès à tout
    if (user.role === 'admin') return true;
    
    // Vérifier si l'utilisateur a un des rôles requis
    return item.requiredRole.includes(user.role);
  };

  const menuItems: MenuItem[] = [
    { 
      name: 'Tableau de Bord', 
      path: '/', 
      icon: <FiHome size={20} />,
      badge: null
    },
    {
      name: 'Comptabilité',
      path: '/comptabilite',
      icon: <FiDollarSign size={20} />,
      
      requiredRole: ['admin', 'comptable'],
      children: [
        { name: 'Vue générale', path: '/comptabilite', icon: <FiTrendingUp size={16} /> },
        { name: 'Factures', path: '/comptabilite/factures', icon: <FiFileText size={16} /> },
        { name: 'Tiers', path: '/comptabilite/tiers', icon: <FiUsers size={16} /> },
        { name: 'Articles', path: '/comptabilite/articles', icon: <FiPackage size={16} /> },
        { name: 'Suivi Paiements', path: '/comptabilite/suivi-paiements', icon: <FiCheckSquare size={16} /> },
        { name: 'Journal', path: '/comptabilite/journal', icon: <FiBook size={16} /> },
        { name: 'Balance', path: '/comptabilite/balance', icon: <FiBarChart2 size={16} /> }, // Remplacé FiScale par FiBarChart2
        { name: 'Bilan', path: '/comptabilite/bilan', icon: <FiBarChart2 size={16} /> },
        { name: 'Declaration TVA', path: '/comptabilite/tva', icon: <FiFile size={16} /> },
        { name: 'Taux Change', path: '/comptabilite/taux-change', icon: <FiRefreshCw size={16} /> } // Remplacé par FiRefreshCw
      ],
    },
    {
      name: 'Import-Export',
      path: '/import-export',
      icon: <FiGlobe size={20} />,
      
      requiredRole: ['admin', 'commercial'],
      children: [
        { name: 'Vue générale', path: '/import-export', icon: <FiTrendingUp size={16} /> },
        { name: 'Commandes', path: '/import-export/commandes', icon: <FiList size={16} /> },
        { name: 'Expéditions', path: '/import-export/expeditions', icon: <FiTruck size={16} /> },
        { name: 'Transporteurs', path: '/import-export/transporteurs', icon: <FiTruck size={16} /> },
        { name: 'Analyses', path: '/import-export/analyses', icon: <FiPieChart size={16} /> },
      ],
    },
    {
      name: 'CRM',
      path: '/crm',
      icon: <FiUserCheck size={20} />,
      
      requiredRole: ['admin', 'commercial'],
      children: [
        { name: 'Vue générale', path: '/crm', icon: <FiTrendingUp size={16} /> },
        { name: 'Clients', path: '/crm/clients', icon: <FiUsers size={16} /> },
        { name: 'Devis', path: '/crm/devis', icon: <FiFilePlus size={16} /> },
        { name: 'Contrats', path: '/crm/contrats', icon: <FiFileMinus size={16} /> },
        { name: 'Activités', path: '/crm/activites', icon: <FiCalendar size={16} /> },
        { name: 'Contacts', path: '/crm/contacts', icon: <FiUser size={16} /> },
        { name: 'Relances', path: '/crm/relances', icon: <FiBell size={16} /> },
      ],
    },
    {
      name: 'Administration',
      path: '/admin',
      icon: <FiSettings size={20} />,
      badge: null,
      requiredRole: ['admin'],
      children: [
        { name: 'Gestion Utilisateurs', path: '/admin/users', icon: <FiUsers size={16} /> },
      ],
    },
  ];

  // Filtrer les menus selon les permissions
  const filteredMenuItems = menuItems.filter(hasAccess);

  const getUserDisplayName = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    return user?.nom || user?.email || 'Utilisateur';
  };

  const getUserRoleDisplay = () => {
    const roleMap = {
      'admin': 'Administrateur',
      'comptable': 'Comptable', 
      'commercial': 'Commercial'
    };
    return roleMap[user?.role as keyof typeof roleMap] || user?.role || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;
    }
    return user?.nom?.charAt(0) || user?.email?.charAt(0) || 'U';
  };

  const logoImage = '/omniserve-experts.jpeg';

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isOpen && (
            <div className="sidebar-brand">
              <img src={logoImage} alt="Omniserve Experts Logo" className="brand-logo-img" />
              <br />
              
            </div>

          )}
          
          <button onClick={onToggle} className="sidebar-toggle inside">
            {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
        </div>

        {/* Container scrollable pour le contenu */}
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {filteredMenuItems.map((item) => (
              <div key={item.path} className="sidebar-menu">
                {hasChildren(item) ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`sidebar-link ${
                        location.pathname.startsWith(item.path) ? 'active' : ''
                      }`}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="sidebar-text">{item.name}</span>
                          <div className="sidebar-right">
                            {item.badge && (
                              <span className="sidebar-badge">{item.badge}</span>
                            )}
                            <span className="sidebar-arrow">
                              {openSubmenus[item.name] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                            </span>
                          </div>
                        </>
                      )}
                    </button>
                    
                    {openSubmenus[item.name] && isOpen && (
                      <div className="sidebar-submenu">
                        {item.children
                          .filter(hasAccess)
                          .map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`sidebar-submenu-link ${
                              location.pathname === child.path ? 'active' : ''
                            }`}
                          >
                            <span className="submenu-icon">{child.icon}</span>
                            <span className="submenu-text">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`sidebar-link ${
                      location.pathname === item.path ? 'active' : ''
                    }`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="sidebar-text">{item.name}</span>
                        {item.badge && (
                          <span className="sidebar-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User profile section */}
          {isOpen && user && (
            <div className="sidebar-footer">
              <div className="user-profile">
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <div className="user-info">
                  <div className="user-name">{getUserDisplayName()}</div>
                  <div className="user-role">{getUserRoleDisplay()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};