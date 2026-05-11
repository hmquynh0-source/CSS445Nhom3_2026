import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DataRefreshProvider } from './context/DataRefreshContext';
import { RBACProvider } from './context/RBACContext';

// Pages & Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomerPage from './pages/CustomerPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchIntelligencePage from './pages/SearchIntelligencePage';
import AIAssistantPage from './pages/AIAssistantPage';
import UserManagementPage from './pages/UserManagementPage';
import TransactionApprovalPage from './pages/TransactionApprovalPage';
import SystemMonitoringPage from './pages/SystemMonitoringPage';
import ReportExportPage from './pages/ReportExportPage';
import SupplierDashboard from './pages/SupplierDashboard';
import SettingsPage from './pages/SettingsPage';
import CustomerLayout from './components/CustomerLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProducts from './pages/CustomerProducts';
import CustomerOrders from './pages/CustomerOrders';
import CustomerLedger from './pages/CustomerLedger';
import LogoutSuccess from './pages/LogoutSuccess';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import InboundPage from './pages/InboundPage';
import OutboundPage from './pages/OutboundPage';
import ProcessingPage from './pages/ProcessingPage';
import SupplierLayout from './components/SupplierLayout';
import SupplierApprovalPage from './pages/SupplierApprovalPage';
import SupplierOrdersPage from './pages/SupplierOrdersPage';
import SupplierInventoryPage from './pages/SupplierInventoryPage';
import PersonalProfilePage from './pages/PersonalProfilePage'; 

/** * Component bảo vệ Route theo vai trò 
 */
const RoleProtectedRoute = ({ children, allowedRole }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#FDF8F3]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D2B1F]"></div>
        </div>
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Kiểm tra quyền truy cập (tùy chọn: có thể thêm logic check allowedRole cụ thể ở đây)
    return children;
};

/** * Wrapper cho khu vực Admin/Staff - Sử dụng chung DashboardLayout
 */
const AdminLayoutWrapper = () => (
    <ErrorBoundary>
        <RBACProvider>
            <DataRefreshProvider>
                <DashboardLayout>
                    <Routes>
                        <Route path="home" element={<HomePage />} />
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="suppliers" element={<SuppliersPage />} />
                        <Route path="customers" element={<CustomerPage />} />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route path="inbound" element={<InboundPage />} />
                        <Route path="outbound" element={<OutboundPage />} />
                        <Route path="processing" element={<ProcessingPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="search" element={<SearchIntelligencePage />} />
                        <Route path="ai" element={<AIAssistantPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="approvals" element={<TransactionApprovalPage />} />
                        <Route path="monitoring" element={<SystemMonitoringPage />} />
                        <Route path="reports/export" element={<ReportExportPage />} />
                        <Route path="*" element={<Navigate to="home" replace />} />
                    </Routes>
                </DashboardLayout>
            </DataRefreshProvider>
        </RBACProvider>
    </ErrorBoundary>
);

function App() {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#FDF8F3]">
            <div className="text-lg font-bold text-[#3D2B1F]">Đang tải hệ thống RoastLogic...</div>
        </div>
    );

    return (
        <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/logout-success" element={<LogoutSuccess />} />

            {/* 2. ROOT DISPATCHER - Điều hướng người dùng sau khi đăng nhập */}
            <Route
                path="/"
                element={
                    !isAuthenticated ? <Navigate to="/login" replace /> :
                    userRole === 'supplier' ? <Navigate to="/supplier/dashboard" replace /> :
                    userRole === 'customer' ? <Navigate to="/customer/dashboard" replace /> :
                    <Navigate to="/admin/home" replace />
                }
            />

            {/* 3. SUPPLIER AREA */}
            <Route path="/supplier/*" element={
                <RoleProtectedRoute allowedRole="supplier">
                    <Routes>
                        <Route element={<SupplierLayout />}>
                            <Route path="dashboard" element={<SupplierDashboard />} />
                            <Route path="approvals" element={<SupplierApprovalPage />} />
                            <Route path="profile" element={<PersonalProfilePage />} />
                            <Route path="orders" element={<SupplierOrdersPage />} />
                            <Route path="inventory" element={<SupplierInventoryPage />} />
                            <Route path="settings" element={<PersonalProfilePage />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Route>
                    </Routes>
                </RoleProtectedRoute>
            } />

            {/* 4. CUSTOMER AREA - Đã sửa lỗi Nesting */}
            <Route path="/customer/*" element={
                <RoleProtectedRoute allowedRole="customer">
                    <Routes>
                        <Route element={<CustomerLayout />}>
                            <Route path="dashboard" element={<CustomerDashboard />} />
                            <Route path="settings" element={<PersonalProfilePage />} />
                            {/* Thêm các Route khác cho khách hàng tại đây */}
                            <Route path="products" element={<CustomerProducts />} />
                            <Route path="orders" element={<CustomerOrders />} />
                            <Route path="ledger" element={<CustomerLedger />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Route>
                    </Routes>
                </RoleProtectedRoute>
            } />

            {/* 5. ADMIN/STAFF AREA */}
            <Route path="/admin/*" element={
                <RoleProtectedRoute allowedRole="staff">
                    <AdminLayoutWrapper />
                </RoleProtectedRoute>
            } />

            {/* 6. CATCH ALL - Xử lý các đường dẫn không tồn tại */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;