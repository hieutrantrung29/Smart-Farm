import { createBrowserRouter } from 'react-router';
import Login from './screens/Login';
import Register from './screens/Register'
import DashboardLayout from './layouts/DashboardLayout';
import FarmDashboard from './screens/FarmDashboard';
import Zones from './screens/Zones';
import Reports from './screens/Reports';
import UserManagement from './screens/UserManagement';
import Chatbot from './screens/Chatbot';
import { ActivityHistory } from './screens/ActivityHistory';
import { ZoneAssignment } from './screens/ZoneAssignment';
import NotFound from './screens/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/register', 
    Component: Register,
  },
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      {
        path: 'dashboard',
        Component: FarmDashboard,
      },
      {
        path: 'zones',
        Component: Zones,
      },
      {
        path: 'reports',
        Component: Reports,
      },
      {
        path: 'users',
        Component: UserManagement,
      },
      {
        path: 'chatbot',
        Component: Chatbot,
      },
      {
        path: 'activity-history',
        Component: ActivityHistory,
      },
      {
        path: 'zone-assignment',
        Component: ZoneAssignment,
      },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);