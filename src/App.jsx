import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import ChangeTemporalPassword from './pages/ChangeTemporalPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CharactersManagement from './pages/admin/CharactersManagement';
import StudentsManagement from './pages/admin/StudentsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';


import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import ExploreCharacters from './pages/student/ExploreCharacters';
import ChatInterface from './pages/student/ChatInterface';
import CallInterface from './pages/student/CallInterface';
import MyChats from './pages/student/MyChats';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-temporal-password" element={<ChangeTemporalPassword />} />

      {/* Admin Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/characters" element={<CharactersManagement />} />
      <Route path="/admin/students" element={<StudentsManagement />} />
      <Route path="/admin/categories" element={<CategoriesManagement />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="explore" element={<ExploreCharacters />} />
        <Route path="chats" element={<MyChats />} />
        <Route path="chat/:characterId" element={<ChatInterface />} />
        <Route path="call/:characterId" element={<CallInterface />} />
      </Route>
    </Routes>
  );
}

export default App;
