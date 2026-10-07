import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { routes } from '@/config/routes'
import { LangProvider } from '@/i18n/LangProvider'
import { CertificationsPage } from '@/pages/CertificationsPage'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <Layout>
          <Routes>
            <Route path={routes.home} element={<HomePage />} />
            <Route path={routes.certifications} element={<CertificationsPage />} />
            {/* Cualquier otra URL vuelve al inicio, sin dejar la rota en el historial. */}
            <Route path="*" element={<Navigate to={routes.home} replace />} />
          </Routes>
        </Layout>
      </LangProvider>
    </BrowserRouter>
  )
}
