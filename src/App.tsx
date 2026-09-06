import { Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/features/account/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { Home } from '@/pages/Home';
import { Soluciones } from '@/pages/Soluciones';
import { SolucionFamilia } from '@/pages/SolucionFamilia';
import { SolucionProceso } from '@/pages/SolucionProceso';
import { Catalogo } from '@/pages/Catalogo';
import { Producto } from '@/pages/Producto';
import { ConviertaseEnCliente } from '@/pages/ConviertaseEnCliente';
import { Formacion } from '@/pages/Formacion';
import { Contacto } from '@/pages/Contacto';
import { PoliticaPrivacidad } from '@/pages/PoliticaPrivacidad';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  const { pathname } = useLocation();

  // La ficha de producto tiene su propia barra de acción fija con el SKU en
  // contexto; dos botones flotantes en 375px compiten entre sí.
  const isProductPage = pathname.startsWith('/producto/');

  return (
    <AuthProvider>
      <ScrollToTop />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="contenido" className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/soluciones" element={<Soluciones />} />
            <Route path="/soluciones/:familia" element={<SolucionFamilia />} />
            <Route path="/soluciones/:familia/:proceso" element={<SolucionProceso />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:slug" element={<Producto />} />
            <Route path="/conviertase-en-cliente" element={<ConviertaseEnCliente />} />
            <Route path="/formacion" element={<Formacion />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <WhatsAppFab hidden={isProductPage} />
    </AuthProvider>
  );
}
