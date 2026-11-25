import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router';

import { Main, ComboboxPlayground, LayoutPlayground } from '@pages';

import styles from './App.module.scss';
import { useEffect } from 'react';

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/combobox');
    }
  }, [location]);

  return (
    <>
      <header className={styles.Header}>
        <nav className={styles.Nav} aria-label="Основная навигация">
          <NavLink to="/combobox">
            Combobox
          </NavLink>

          <NavLink to="/layout">
            Layout
          </NavLink>

          <NavLink to="/full-page" end>
            Full Page
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/combobox" element={<ComboboxPlayground />} />
        <Route path="/layout" element={<LayoutPlayground />} />
        <Route path="/full-page" element={<Main />} />
        <Route path="*" element={<Navigate to="/full-page" replace />} />
      </Routes>
    </>
  );
};
