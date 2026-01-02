// src/modules/crm/routes/index.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages existantes
import CRMPage from '../pages/CRMPage';
import ClientsListPage from '../pages/ClientsListPage';
import ClientDetailPage from '../pages/ClientDetailPage';
import DevisListPage from '../pages/DevisListPage';
import DevisDetailPage from '../pages/DevisDetailPage';
import DevisForm from '../components/forms/DevisForm';
import RelancesPage from '../pages/RelancesPage';
import ContratsListPage from '../pages/ContratsListPage';
import ContratDetailPage from '../pages/ContratDetailPage';
import ContratForm from '../components/forms/ContratForm';
import ActivitesListPage from '../pages/ActivitesListPage';
import ActiviteDetailPage from '../pages/ActiviteDetailPage';
import ActiviteForm from '../components/forms/ActiviteForm';
import ContactsListPage from '../pages/ContactsListPage';

// Pages à créer (recommandées)
import RapportsPage from '../pages/RapportsPage';
import StatistiquesPage from '../pages/StatistiquesPage';
import ContactForm from '../components/forms/ContactForm';
import ContactDetailPage from '../pages/ContactDetailPage';
import RelanceForm from '../components/forms/RelanceForm';
import RelanceDetailPage from '../pages/RelanceDetailPage';
import ClientForm from '../components/forms/ClientForm';
const CRMRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Page d'accueil CRM - Tableau de bord */}
      <Route index element={<CRMPage />} />
      
      {/* Routes Clients */}
      <Route path="clients" element={<ClientsListPage />} />
      <Route path="clients/nouveau" element={<ClientForm  />} />
      <Route path="clients/:id" element={<ClientDetailPage />} />
      <Route path="clients/:id/modifier" element={<ClientForm  />} />
      
      {/* Routes Devis */}
      <Route path="devis" element={<DevisListPage />} />
      <Route path="devis/nouveau" element={<DevisForm />} />
      <Route path="devis/:id" element={<DevisDetailPage />} />
      <Route path="devis/:id/modifier" element={<DevisForm  />} />
      
      {/* Routes Contrats */}
      <Route path="/contrats" element={<ContratsListPage />} />
      <Route path="/contrats/nouveau" element={<ContratForm />} />
      <Route path="/contrats/:id" element={<ContratDetailPage />} />
      <Route path="/contrats/:id/modifier" element={<ContratForm />} />
      
      
      {/* Routes Activités */}
      <Route path="activites" element={<ActivitesListPage />} />
      <Route path="activites/nouvelle" element={<ActiviteForm />} />
      <Route path="activites/:id" element={<ActiviteDetailPage />} />
      <Route path="activites/:id/modifier" element={<ActiviteForm />} />
      
      {/* Routes Contacts */}
      <Route path="contacts" element={<ContactsListPage />} />
      <Route path="contacts/nouveau" element={<ContactForm mode="create" />} />
      <Route path="contacts/:id" element={<ContactDetailPage />} />
      <Route path="contacts/:id/modifier" element={<ContactForm mode="edit" />} />
      
      {/* Routes Relances */}
      <Route path="relances" element={<RelancesPage />} />
      <Route path="relances/nouvelle" element={<RelanceForm mode="create" />} />
      <Route path="relances/:id" element={<RelanceDetailPage />} />
      <Route path="relances/:id/modifier" element={<RelanceForm mode="edit" />} />
      
      {/* Routes Rapports & Statistiques */}
      <Route path="rapports" element={<RapportsPage />} />
      <Route path="statistiques" element={<StatistiquesPage />} />
      
      {/* Route de fallback - Page 404 CRM */}
      <Route path="*" element={<div>Page CRM non trouvée</div>} />
    </Routes>
  );
};

export default CRMRoutes;