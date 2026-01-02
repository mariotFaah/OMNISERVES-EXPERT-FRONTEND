import type { RouteObject } from 'react-router-dom';

// Pages existantes
import ComptabilitePage from '../pages/ComptabilitePage';
import FacturesListPage from '../pages/FacturesListPage';
import { FactureForm } from '../components/FactureForm/FactureForm';
import { TiersListPage } from '../pages/TiersListPage';
import { ArticlesListPage } from '../pages/ArticlesListPage';
import { PaiementsListPage } from '../pages/PaiementsListPage';

// TOUTES les pages réelles
import RapportsPage from '../pages/RapportsPage';
import JournalComptablePage from '../pages/JournalComptablePage';
import BalanceComptablePage from '../pages/BalanceComptablePage';
import BilanComptablePage from '../pages/BilanComptablePage';
import TauxChangePage from '../pages/TauxChangePage';
import FactureDetailPage from '../pages/FactureDetailPage';
import FactureEditPage from '../pages/FactureEditPage';
import EcheancesPage from '../pages/EcheancesPage';
import CompteResultatPage from '../pages/CompteResultatPage';
import TresoreriePage from '../pages/TresoreriePage';
import DeclarationTVAPage from '../pages/DeclarationTVAPage';
import SuiviPaiementsPage from '../pages/SuiviPaiementsPage';

// Import du Dashboard Comptabilité
import DashboardComptabilitePage from '../pages/DashboardComptabilitePage';

// Page placeholder restante
const GrandLivrePage = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Grand Livre</h2>
    <p>Page en cours de développement...</p>
  </div>
);

export const comptabiliteRoutes: RouteObject[] = [
  {
    path: 'comptabilite',
    element: <ComptabilitePage />,
    children: [
      {
        index: true,
        element: <DashboardComptabilitePage />,
      },
      
      // Gestion des données
      {
        path: 'factures',
        element: <FacturesListPage />,
      },
      {
        path: 'factures/nouvelle',
        element: <FactureForm />,
      },
      {
        path: 'factures/:numero',
        element: <FactureDetailPage />,
      },
      {
        path: 'factures/:numero/edit',
        element: <FactureEditPage />,
      },
      {
        path: 'tiers',
        element: <TiersListPage />,
      },
      {
        path: 'articles',
        element: <ArticlesListPage />,
      },
      {
        path: 'paiements',
        element: <PaiementsListPage />,
      },
      
      // SECTION C: SUIVI DES PAIEMENTS
      {
        path: 'echeances',
        element: <EcheancesPage />,
      },
      {
        path: 'suivi-paiements',
        element: <SuiviPaiementsPage />,
      },
      
      // Rapports financiers
      {
        path: 'rapports',
        element: <RapportsPage />,
      },
      {
        path: 'journal',
        element: <JournalComptablePage />,
      },
      {
        path: 'balance',
        element: <BalanceComptablePage />,
      },
      {
        path: 'bilan',
        element: <BilanComptablePage />,
      },
      {
        path: 'compte-resultat',
        element: <CompteResultatPage />,
      },
      {
        path: 'tresorerie',
        element: <TresoreriePage />,
      },
      {
        path: 'tva',
        element: <DeclarationTVAPage />,
      },
      {
        path: 'grand-livre',
        element: <GrandLivrePage />,
      },
      
      // Multi-devises
      {
        path: 'taux-change',
        element: <TauxChangePage />,
      }
    ],
  },
];