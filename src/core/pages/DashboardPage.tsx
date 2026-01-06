// frontend/src/core/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
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
  FiFilter,
  FiAlertCircle,
  FiRefreshCw
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

// Types adaptés aux données de l'API
interface DashboardUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'comptable' | 'commercial';
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  name?: string; // Pour la compatibilité
  status?: 'active' | 'inactive'; // Calculé à partir de is_active
}

// Types pour les modules
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  roles: ('admin' | 'comptable' | 'commercial')[];
  isActive: boolean;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    fetchUsers, 
    createUser, 
    updateUser, 
    toggleUserStatus 
  } = useAuth();
  
  // États
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'commercial' as 'admin' | 'comptable' | 'commercial',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Charger les utilisateurs au montage
  useEffect(() => {
    loadUsers();
  }, []);

  // Fonction pour charger les utilisateurs depuis l'API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await fetchUsers();
      
      // Transformer les données de l'API
      const transformedUsers = fetchedUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        name: `${user.nom} ${user.prenom}`,
        status: user.is_active ? 'active' as const : 'inactive' as const
      }));
      
      setUsers(transformedUsers);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des utilisateurs');
      console.error('Erreur loadUsers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculées
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    commercials: users.filter(u => u.role === 'commercial').length,
    comptables: users.filter(u => u.role === 'comptable').length,
  };

  // Modules disponibles selon le rôle
  const modules: Module[] = [
    {
      id: 'comptabilite',
      title: 'Comptabilité',
      description: 'Gestion financière et comptable',
      icon: <MdAccountBalance size={24} />,
      path: '/comptabilite',
      color: '#0078D4',
      bgColor: '#E1F5FE',
      roles: ['admin', 'comptable'],
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
      roles: ['admin', 'commercial', 'comptable'],
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
    const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Fonction pour créer un utilisateur
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.nom || !newUser.prenom) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setActionLoading(true);
    try {
      const userData = {
        email: newUser.email,
        password: newUser.password,
        nom: newUser.nom,
        prenom: newUser.prenom,
        role: newUser.role,
      };

      await createUser(userData);
      await loadUsers(); // Recharger la liste
      
      setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'commercial' });
      setShowAddUserModal(false);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour mettre à jour un utilisateur
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setActionLoading(true);
    try {
      const updateData = {
        email: newUser.email,
        nom: newUser.nom,
        prenom: newUser.prenom,
        role: newUser.role,
      };

      await updateUser(editingUser.id, updateData);
      await loadUsers(); // Recharger la liste
      
      setEditingUser(null);
      setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'commercial' });
      setShowAddUserModal(false);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour changer le statut (activer/désactiver)
  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    const shouldActivate = !currentActive;
    
    setActionLoading(true);
    try {
      await toggleUserStatus(userId, shouldActivate);
      await loadUsers(); // Recharger la liste
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour éditer un utilisateur
  const handleEditUser = (user: DashboardUser) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      password: '', // Laisse vide pour ne pas changer le mot de passe
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    });
    setShowAddUserModal(true);
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Formater l'heure de la dernière connexion
  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Jamais connecté';
    try {
      const date = new Date(lastLogin);
      return date.toLocaleString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Redirection vers les modules
  const handleModuleClick = (moduleId: string) => {
    navigate(`/${moduleId}`);
  };

  // Modules accessibles pour l'utilisateur connecté
  const accessibleModules = user ? 
    modules.filter(module => module.roles.includes(user.role)) : 
    [];

  // Si en chargement
  if (loading) {
    return (
      <div className="sage-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

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
        
        <div className="header-actions">
          <button 
            className="sage-btn sage-btn-secondary"
            onClick={loadUsers}
            disabled={actionLoading}
          >
            <FiRefreshCw className={`btn-icon ${actionLoading ? 'spinning' : ''}`} />
            <span>Actualiser</span>
          </button>
          
          {user?.role === 'admin' && (
            <button 
              className="sage-btn sage-btn-primary"
              onClick={() => setShowAddUserModal(true)}
              disabled={actionLoading}
            >
              <FiUserPlus className="btn-icon" />
              <span>Ajouter un utilisateur</span>
            </button>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="sage-alert sage-alert-error">
          <FiAlertCircle className="alert-icon" />
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>
            <FiX />
          </button>
        </div>
      )}

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
          </div>
        </div>
      </div>

      {/* Modules d'accès rapide */}
      <div className="sage-modules-section">
        <div className="section-header">
          <h2 className="section-title">Applications</h2>
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
      {user?.role === 'admin' && (
        <div className="sage-users-section">
          <div className="section-header">
            <h2 className="section-title">Gestion des utilisateurs</h2>
            <div className="section-actions">
              <div className="sage-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="filter-group">
                <FiFilter className="filter-icon" />
                <select 
                  className="sage-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="commercial">Commerciaux</option>
                  <option value="comptable">Comptables</option>
                </select>
                
                <select 
                  className="sage-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="sage-table-container">
            {actionLoading && (
              <div className="table-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
              </div>
            )}
            
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
                          {(user.nom[0] + user.prenom[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.nom} {user.prenom}</div>
                          <div className="user-id">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">{user.email}</div>
                    </td>
                    <td>
                      <span className={`sage-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'comptable' ? 'Comptable' : 'Commercial'}
                      </span>
                    </td>
                    <td>
                      <span className={`sage-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="last-login">{formatLastLogin(user.last_login)}</div>
                      <div className="created-date">Créé le {formatDate(user.created_at)}</div>
                    </td>
                    <td>
                      <div className="sage-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                          disabled={actionLoading}
                        >
                          <FiEdit />
                        </button>
                        
                        {user.is_active ? (
                          <button 
                            className="action-btn deactivate-btn"
                            onClick={() => handleToggleStatus(user.id, true)}
                            title="Désactiver"
                            disabled={actionLoading}
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button 
                            className="action-btn activate-btn"
                            onClick={() => handleToggleStatus(user.id, false)}
                            title="Activer"
                            disabled={actionLoading}
                          >
                            <FiUserCheck />
                          </button>
                        )}
                        
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleToggleStatus(user.id, true)}
                          title="Supprimer"
                          disabled={actionLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && !loading && (
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
                  disabled={actionLoading}
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
                <div className="table-pagination">
                  <button className="pagination-btn" disabled>Précédent</button>
                  <span className="pagination-info">Page 1 sur 1</span>
                  <button className="pagination-btn" disabled>Suivant</button>
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
                  setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'commercial' });
                }}
                disabled={actionLoading}
              >
                <FiX />
              </button>
            </div>
            
            <div className="sage-modal-body">
              <div className="sage-form-group">
                <label className="sage-form-label">
                  <span>Nom</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="sage-input"
                  value={newUser.nom}
                  onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                  placeholder="Dupont"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="sage-form-group">
                <label className="sage-form-label">
                  <span>Prénom</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="sage-input"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                  placeholder="Jean"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="sage-form-group">
                <label className="sage-form-label">
                  <span>Email</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="sage-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jean@aquatiko.mg"
                  disabled={actionLoading}
                />
              </div>
              
              {!editingUser && (
                <div className="sage-form-group">
                  <label className="sage-form-label">
                    <span>Mot de passe</span>
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="sage-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                    disabled={actionLoading}
                  />
                </div>
              )}
              
              <div className="sage-form-group">
                <label className="sage-form-label">Rôle</label>
                <select
                  className="sage-select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'commercial' | 'comptable'})}
                  disabled={actionLoading}
                >
                  <option value="commercial">Commercial</option>
                  <option value="comptable">Comptable</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            
            <div className="sage-modal-footer">
              <button 
                className="sage-btn sage-btn-secondary"
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'commercial' });
                }}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button 
                className="sage-btn sage-btn-primary"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                disabled={actionLoading || !newUser.email || !newUser.nom || !newUser.prenom || (!editingUser && !newUser.password)}
              >
                {actionLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    {editingUser ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  editingUser ? 'Mettre à jour' : 'Ajouter l\'utilisateur'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;