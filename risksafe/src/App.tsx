import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Overview from './pages/Overview'
import Risks from './pages/Risks'
import Vendors from './pages/tprm/Vendors'
import Assessments from './pages/tprm/Assessments'
import Questionnaires from './pages/tprm/Questionnaires'
import Contracts from './pages/tprm/Contracts'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"                   element={<Overview />} />
          <Route path="/riscos"             element={<Risks />} />
          <Route path="/ativos"             element={<Placeholder name="Ativos" />} />
          <Route path="/ameacas"            element={<Placeholder name="Ameaças" />} />
          <Route path="/vulnerabilidades"   element={<Placeholder name="Vulnerabilidades" />} />
          <Route path="/controles"          element={<Placeholder name="Controles" />} />
          <Route path="/incidentes"         element={<Placeholder name="Incidentes" />} />
          <Route path="/planos"             element={<Placeholder name="Planos de Ação" />} />
          <Route path="/relatorios"         element={<Placeholder name="Relatórios" />} />
          <Route path="/dashboard-exec"     element={<Placeholder name="Dashboard Executivo" />} />
          <Route path="/tprm/fornecedores"  element={<Vendors />} />
          <Route path="/tprm/avaliacoes"    element={<Assessments />} />
          <Route path="/tprm/questionarios" element={<Questionnaires />} />
          <Route path="/tprm/contratos"     element={<Contracts />} />
          <Route path="/configuracoes"      element={<Placeholder name="Configurações" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
