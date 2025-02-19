import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { Login } from './views/Login'
import { Upload } from './views/Upload'
import Search from './views/Search'
import Chart from './views/Chart'
import { AuthProvider } from './api/AuthContext'
import { PrivateRoute } from './views/PrivateRoute'

function AppRoutes() {
  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Routes>

        <Route
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />

        <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />

        <Route
            path="/chart"
            element={
              <PrivateRoute>
                <Chart />
              </PrivateRoute>
            }
          />

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/search" replace />} />
      </Routes>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
