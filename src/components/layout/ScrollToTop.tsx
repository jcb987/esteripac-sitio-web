import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Al cambiar de ruta la vista debe empezar arriba, no donde quedó la anterior. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
