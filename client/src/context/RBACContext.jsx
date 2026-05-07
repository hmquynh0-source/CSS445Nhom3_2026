import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Roles có sẵn
export const ROLES = {
    OWNER: 'owner',
    IT_ADMIN: 'it_admin',
    WAREHOUSE_STAFF: 'warehouse_staff',
    VENDOR: 'vendor'
};

// Permissions Matrix
export const PERMISSIONS = {
    // Dashboard & Reports
    VIEW_EXECUTIVE_DASHBOARD: 'view_executive_dashboard',
    VIEW_WAREHOUSE_REPORTS: 'view_warehouse_reports',
    VIEW_VENDOR_REPORTS: 'view_vendor_reports',
    EXPORT_REPORTS: 'export_reports',
    
    // Products
    CREATE_PRODUCT: 'create_product',
    READ_PRODUCT: 'read_product',
    UPDATE_PRODUCT: 'update_product',
    DELETE_PRODUCT: 'delete_product',
    VIEW_PRODUCT_360: 'view_product_360',
    
    // Stock Operations
    INBOUND_GOODS: 'inbound_goods',
    OUTBOUND_GOODS: 'outbound_goods',
    CYCLE_COUNT: 'cycle_count',
    SLOTTING: 'slotting',
    
    // Approval
    APPROVE_LARGE_ORDERS: 'approve_large_orders',
    APPROVE_PRICE_CHANGES: 'approve_price_changes',
    
    // AI Features
    USE_AI_CHAT: 'use_ai_chat',
    ADVANCED_AI_ANALYTICS: 'advanced_ai_analytics',
    MANAGE_AI: 'manage_ai',
    
    // Vendor
    VIEW_VENDOR_PORTAL: 'view_vendor_portal',
    SUBMIT_DELIVERY_NOTES: 'submit_delivery_notes',
    
    // Admin
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    VIEW_AUDIT_LOG: 'view_audit_log',
    SYSTEM_SETTINGS: 'system_settings'
};

// Default permissions per role
export const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: [
        PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD,
        PERMISSIONS.VIEW_WAREHOUSE_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.CREATE_PRODUCT,
        PERMISSIONS.READ_PRODUCT,
        PERMISSIONS.UPDATE_PRODUCT,
        PERMISSIONS.DELETE_PRODUCT,
        PERMISSIONS.VIEW_PRODUCT_360,
        PERMISSIONS.APPROVE_LARGE_ORDERS,
        PERMISSIONS.APPROVE_PRICE_CHANGES,
        PERMISSIONS.USE_AI_CHAT,
        PERMISSIONS.ADVANCED_AI_ANALYTICS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_ROLES,
        PERMISSIONS.VIEW_AUDIT_LOG
    ],
    [ROLES.IT_ADMIN]: [
        PERMISSIONS.VIEW_WAREHOUSE_REPORTS,
        PERMISSIONS.READ_PRODUCT,
        PERMISSIONS.VIEW_PRODUCT_360,
        PERMISSIONS.USE_AI_CHAT,
        PERMISSIONS.MANAGE_AI,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_AUDIT_LOG,
        PERMISSIONS.SYSTEM_SETTINGS
    ],
    [ROLES.WAREHOUSE_STAFF]: [
        PERMISSIONS.VIEW_WAREHOUSE_REPORTS,
        PERMISSIONS.READ_PRODUCT,
        PERMISSIONS.VIEW_PRODUCT_360,
        PERMISSIONS.INBOUND_GOODS,
        PERMISSIONS.OUTBOUND_GOODS,
        PERMISSIONS.CYCLE_COUNT,
        PERMISSIONS.SLOTTING,
        PERMISSIONS.USE_AI_CHAT
    ],
    [ROLES.VENDOR]: [
        PERMISSIONS.VIEW_VENDOR_REPORTS,
        PERMISSIONS.VIEW_VENDOR_PORTAL,
        PERMISSIONS.SUBMIT_DELIVERY_NOTES,
        PERMISSIONS.USE_AI_CHAT
    ]
};

const RBACContext = createContext();

export const RBACProvider = ({ children }) => {
    const { userProfile } = useAuth();
    const [userRole, setUserRole] = useState(ROLES.WAREHOUSE_STAFF);
    const [userPermissions, setUserPermissions] = useState([]);
    const [auditLog, setAuditLog] = useState([]);

    useEffect(() => {
        // Get user role from profile
        if (userProfile) {
            const role = userProfile.role || ROLES.WAREHOUSE_STAFF;
            setUserRole(role);
            setUserPermissions(ROLE_PERMISSIONS[role] || []);
        }
    }, [userProfile]);

    // Check if user has permission
    const hasPermission = (permission) => {
        if (Array.isArray(permission)) {
            return permission.some(p => userPermissions.includes(p));
        }
        return userPermissions.includes(permission);
    };

    // Check if user has role
    const hasRole = (role) => {
        if (Array.isArray(role)) {
            return role.includes(userRole);
        }
        return userRole === role;
    };

    // Log action to audit trail
    const logAudit = (action, details = {}) => {
        const auditEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: userProfile?.name || 'unknown',
            role: userRole,
            action,
            details,
            ipAddress: '127.0.0.1' // In production, get from server
        };
        setAuditLog(prev => [auditEntry, ...prev].slice(0, 1000)); // Keep last 1000 entries
    };

    const value = useMemo(() => ({
        userRole,
        userPermissions,
        hasPermission,
        hasRole,
        auditLog,
        logAudit
    }), [userRole, userPermissions, auditLog]);

    return (
        <RBACContext.Provider value={value}>
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within RBACProvider');
    }
    return context;
};
