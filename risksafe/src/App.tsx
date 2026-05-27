import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Overview from './pages/Overview'
import Risks from './pages/Risks'
import Vendors from './pages/tprm/Vendors'
import Assessments from './pages/tprm/Assessments'
import Questionnaires from './pages/tprm/Questionnaires'
import Contracts from './pages/tprm/Contracts'
import ActionPlans from './pages/ActionPlans'
import Assets from './pages/Assets'
import Controls from './pages/Controls'
import Settings from './pages/Settings'
import Nis2 from './pages/conformidade/Nis2'
import Iso27001 from './pages/conformidade/Iso27001'
import Bcp from './pages/continuidade/Bcp'
import Drp from './pages/continuidade/Drp'
import Irp from './pages/continuidade/Irp'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"                   element={<Overview />} />
          <Route path="/riscos"             element={<Risks />} />
          <Route path="/ativos"             element={<Assets />} />
          <Route path="/ameacas"            element={<Placeholder name="Ameaças" />} />
          <Route path="/vulnerabilidades"   element={<Placeholder name="Vulnerabilidades" />} />
          <Route path="/controles"          element={<Controls />} />
          <Route path="/incidentes"         element={<Placeholder name="Incidentes" />} />
          <Route path="/planos"             element={<ActionPlans />} />
          <Route path="/relatorios"         element={<Placeholder name="Relatórios" />} />
          <Route path="/dashboard-exec"     element={<Placeholder name="Dashboard Executivo" />} />
          <Route path="/conformidade/nis2"     element={<Nis2 />} />
          <Route path="/conformidade/iso27001" element={<Iso27001 />} />
          <Route path="/continuidade/bcp"      element={<Bcp />} />
          <Route path="/continuidade/drp"      element={<Drp />} />
          <Route path="/continuidade/irp"      element={<Irp />} />
          <Route path="/tprm/fornecedores"  element={<Vendors />} />
          <Route path="/tprm/avaliacoes"    element={<Assessments />} />
          <Route path="/tprm/questionarios" element={<Questionnaires />} />
          <Route path="/tprm/contratos"     element={<Contracts />} />
          <Route path="/configuracoes"      element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
