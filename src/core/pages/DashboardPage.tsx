import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiX,
  FiChevronRight,
  FiFilter
} from 'react-icons/fi';
import { 
  MdAccountBalance,
  MdOutlineImportExport,
  MdBusiness,
  MdSecurity,
  MdOutlineTrendingUp,
  MdOutlineSettings
} from 'react-icons/md';
import { HiOutlineUserGroup, HiOutlineDocumentText } from 'react-icons/hi';
import { useAuth } from '../../core/contexts/AuthContext';
import './DashboardPage.css';

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'commercial';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Jean Dupont', email: 'jean@aquatiko.com', role: 'admin', status: 'active', lastLogin: '2024-01-15', createdAt: '2024-01-01' },
    { id: 2, name: 'Marie Martin', email: 'marie@aquatiko.com', role: 'commercial', status: 'active', lastLogin: '2024-01-14', createdAt: '2024-01-02' },
    { id: 3, name: 'Pierre Dubois', email: 'pierre@aquatiko.com', role: 'commercial', status: 'inactive', lastLogin: '2024-01-10', createdAt: '2024-01-03' },
    { id: 4, name: 'Sophie Bernard', email: 'sophie@aquatiko.com', role: 'commercial', status: 'pending', lastLogin: '2024-01-12', createdAt: '2024-01-04' },
    { id: 5, name: 'Thomas Moreau', email: 'thomas@aquatiko.com', role: 'commercial', status: 'active', lastLogin: '2024-01-15', createdAt: '2024-01-05' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'commercial' as 'admin' | 'commercial',
    status: 'pending' as 'active' | 'inactive' | 'pending'
  });

  // Stats calculées
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    commercials: users.filter(u => u.role === 'commercial').length,
  };

  // Modules disponibles selon le rôle
  const modules = [
    {
      id: 'comptabilite',
      title: 'Comptabilité',
      description: 'Gestion financière et comptable',
      icon: <MdAccountBalance size={24} />,
      path: '/comptabilite',
      color: '#0078D4',
      bgColor: '#E1F5FE',
      roles: ['admin'],
      isActive: true
    },
    {
      id: 'import-export',
      title: 'Import-Export',
      description: 'Opérations internationales',
      icon: <MdOutlineImportExport size={24} />,
      path: '/import-export',
      color: '#107C10',
      bgColor: '#E8F5E9',
      roles: ['admin', 'commercial'],
      isActive: true
    },
    {
      id: 'crm',
      title: 'CRM',
      description: 'Gestion client et commerciale',
      icon: <HiOutlineUserGroup size={24} />,
      path: '/crm',
      color: '#E3008C',
      bgColor: '#FCE4EC',
      roles: ['admin', 'commercial'],
      isActive: true
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Gestion des contrats',
      icon: <HiOutlineDocumentText size={24} />,
      path: '/documents',
      color: '#FF8C00',
      bgColor: '#FFF3E0',
      roles: ['admin', 'commercial'],
      isActive: true
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Tableaux de bord et rapports',
      icon: <MdOutlineTrendingUp size={24} />,
      path: '/analytics',
      color: '#6B5B95',
      bgColor: '#F3E5F5',
      roles: ['admin', 'commercial'],
      isActive: true
    },
    {
      id: 'parametres',
      title: 'Paramètres',
      description: 'Configuration système',
      icon: <MdOutlineSettings size={24} />,
      path: '/settings',
      color: '#666666',
      bgColor: '#F5F5F5',
      roles: ['admin'],
      isActive: true
    }
  ];

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Fonctions CRUD utilisateurs
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newUserObj: User = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      lastLogin: 'Jamais',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUserObj]);
    setNewUser({ name: '', email: '', role: 'commercial', status: 'pending' });
    setShowAddUserModal(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...newUser }
        : u
    ));
    
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'commercial', status: 'pending' });
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleStatus = (userId: number, newStatus: 'active' | 'inactive') => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  // Redirection vers les modules
  const handleModuleClick = (moduleId: string) => {
    navigate(`/${moduleId}`);
  };

  // Modules accessibles pour l'utilisateur connecté
  const accessibleModules = modules.filter(module => 
    module.roles.includes((user as any)?.role || 'commercial')
  );

  return (
    <div className="sage-dashboard">
      {/* En-tête principal */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            Tableau de bord
          </h1>
          <p className="dashboard-subtitle">
            Gestion des utilisateurs et des accès
          </p>
        </div>
        
        {(user as any)?.role === 'admin' && (
          <button 
            className="sage-btn sage-btn-primary"
            onClick={() => setShowAddUserModal(true)}
          >
            <FiUserPlus className="btn-icon" />
            <span>Ajouter un utilisateur</span>
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="sage-stats-grid">
        <div className="sage-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper total">
              <FiUsers />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total utilisateurs</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
            <div className="stat-trend">
              <span className="trend-positive">+12%</span>
            </div>
          </div>
        </div>
        
        <div className="sage-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper active">
              <FiUserCheck />
            </div>
            <div className="stat-details">
              <span className="stat-label">Utilisateurs actifs</span>
              <span className="stat-value">{stats.activeUsers}</span>
            </div>
            <div className="stat-trend">
              <span className="trend-positive">+8%</span>
            </div>
          </div>
        </div>
        
        <div className="sage-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper admin">
              <MdSecurity />
            </div>
            <div className="stat-details">
              <span className="stat-label">Administrateurs</span>
              <span className="stat-value">{stats.admins}</span>
            </div>
            <div className="stat-trend">
              <span className="trend-neutral">0%</span>
            </div>
          </div>
        </div>
        
        <div className="sage-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper commercial">
              <MdBusiness />
            </div>
            <div className="stat-details">
              <span className="stat-label">Commerciaux</span>
              <span className="stat-value">{stats.commercials}</span>
            </div>
            <div className="stat-trend">
              <span className="trend-positive">+15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules d'accès rapide */}
      <div className="sage-modules-section">
        <div className="section-header">
          <h2 className="section-title" id='gest'>Applications</h2>
          <p className="section-subtitle">
            Accédez à toutes vos fonctionnalités
          </p>
        </div>
        
        <div className="sage-modules-grid">
          {accessibleModules.map((module) => (
            <div 
              key={module.id}
              className="sage-module-card"
              onClick={() => handleModuleClick(module.id)}
            >
              <div className="module-icon-wrapper" style={{ backgroundColor: module.bgColor, color: module.color }}>
                {module.icon}
              </div>
              <div className="module-content">
                <h3 className="module-title">{module.title}</h3>
                <p className="module-description">{module.description}</p>
              </div>
              <FiChevronRight className="module-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Gestion des utilisateurs (Admin seulement) */}
      {(user as any)?.role === 'admin' && (
        <div className="sage-users-section">
          <div className="section-header">
            <h2 className="section-title" id='gest'>Gestion des utilisateurs</h2>
            <div className="section-actions">
              <div className="sage-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <FiFilter className="filter-icon" />
                <select 
                  className="sage-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="commercial">Commerciaux</option>
                </select>
                
                <select 
                  className="sage-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="sage-table-container">
            <table className="sage-table">
              <thead>
                <tr>
                  <th className="user-name">Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-id">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">{user.email}</div>
                    </td>
                    <td>
                      <span className={`sage-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Admin' : 'Commercial'}
                      </span>
                    </td>
                    <td>
                      <span className={`sage-badge status-${user.status}`}>
                        {user.status === 'active' ? 'Actif' : 
                         user.status === 'inactive' ? 'Inactif' : 'En attente'}
                      </span>
                    </td>
                    <td>
                      <div className="last-login">{user.lastLogin}</div>
                      <div className="created-date">Créé le {user.createdAt}</div>
                    </td>
                    <td>
                      <div className="sage-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        
                        {user.status === 'active' ? (
                          <button 
                            className="action-btn deactivate-btn"
                            onClick={() => handleToggleStatus(user.id, 'inactive')}
                            title="Désactiver"
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button 
                            className="action-btn activate-btn"
                            onClick={() => handleToggleStatus(user.id, 'active')}
                            title="Activer"
                          >
                            <FiUserCheck />
                          </button>
                        )}
                        
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="sage-empty-state">
                <FiUsers className="empty-icon" />
                <h3>Aucun utilisateur trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
                <button 
                  className="sage-btn sage-btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
            
            {filteredUsers.length > 0 && (
              <div className="sage-table-footer">
                <div className="table-summary">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition utilisateur */}
      {showAddUserModal && (
        <div className="sage-modal-overlay">
          <div className="sage-modal">
            <div className="sage-modal-header">
              <h3>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({ name: '', email: '', role: 'commercial', status: 'pending' });
                }}
              >
                <FiX />
              </button>
            </div>
            
            <div className="sage-modal-body">
              <div className="sage-form-group">
                <label className="sage-form-label">
                  <span>Nom complet</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="sage-input"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div className="sage-form-group">
                <label className="sage-form-label">
                  <span>Adresse email</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="sage-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jean@aquatiko.com"
                />
              </div>
              
              <div className="form-row">
                <div className="sage-form-group">
                  <label className="sage-form-label">Rôle</label>
                  <select
                    className="sage-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'commercial'})}
                  >
                    <option value="commercial">Commercial</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                
                <div className="sage-form-group">
                  <label className="sage-form-label">Statut</label>
                  <select
                    className="sage-select"
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value as 'active' | 'inactive' | 'pending'})}
                  >
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="sage-modal-footer">
              <button 
                className="sage-btn sage-btn-secondary"
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({ name: '', email: '', role: 'commercial', status: 'pending' });
                }}
              >
                Annuler
              </button>
              <button 
                className="sage-btn sage-btn-primary"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                disabled={!newUser.name || !newUser.email}
              >
                {editingUser ? 'Mettre à jour' : 'Ajouter l\'utilisateur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;