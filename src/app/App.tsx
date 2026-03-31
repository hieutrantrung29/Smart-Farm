import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FarmDataProvider } from './contexts/FarmDataContext';

export default function App() {
  return (
    <ThemeProvider>
      <FarmDataProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </FarmDataProvider>
    </ThemeProvider>
  );
}