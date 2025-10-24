import type { Collaborator, CollaboratorPermission, User } from '../types';

/**
 * Permission-based access control service for collaborators
 */

export const PERMISSIONS = {
    VIEWER: 'viewer' as CollaboratorPermission,
    EDITOR: 'editor' as CollaboratorPermission,
} as const;

/**
 * Check if a user has a specific permission level
 */
export const hasPermission = (
    userEmail: string, 
    collaborators: Collaborator[], 
    requiredPermission: CollaboratorPermission
): boolean => {
    const collaborator = collaborators.find(c => c.email === userEmail);
    if (!collaborator) return false;
    
    // Editor has all permissions (viewer + editor)
    if (collaborator.permission === PERMISSIONS.EDITOR) return true;
    
    // Viewer only has viewer permissions
    if (requiredPermission === PERMISSIONS.VIEWER && collaborator.permission === PERMISSIONS.VIEWER) {
        return true;
    }
    
    return false;
};

/**
 * Check if a user can view student progress
 */
export const canViewProgress = (userEmail: string, collaborators: Collaborator[]): boolean => {
    return hasPermission(userEmail, collaborators, PERMISSIONS.VIEWER);
};

/**
 * Check if a user can edit student progress
 */
export const canEditProgress = (userEmail: string, collaborators: Collaborator[]): boolean => {
    return hasPermission(userEmail, collaborators, PERMISSIONS.EDITOR);
};

/**
 * Get the permission level of a user
 */
export const getUserPermission = (userEmail: string, collaborators: Collaborator[]): CollaboratorPermission | null => {
    const collaborator = collaborators.find(c => c.email === userEmail);
    return collaborator ? collaborator.permission : null;
};

/**
 * Get all collaborators with a specific permission level
 */
export const getCollaboratorsByPermission = (
    collaborators: Collaborator[], 
    permission: CollaboratorPermission
): Collaborator[] => {
    return collaborators.filter(c => c.permission === permission);
};

/**
 * Check if the current user is the main teacher (not a collaborator)
 */
export const isMainTeacher = (userEmail: string, collaborators: Collaborator[]): boolean => {
    return !collaborators.some(c => c.email === userEmail);
};

/**
 * Check if the current user is the main teacher based on user object
 */
export const isMainTeacherByUser = (user: User | null): boolean => {
    return user?.isMainTeacher === true;
};

/**
 * Check if user can manage collaborators (only main teacher)
 */
export const canManageCollaborators = (user: User | null): boolean => {
    return isMainTeacherByUser(user);
};

/**
 * Check if user can invite new collaborators (only main teacher)
 */
export const canInviteCollaborators = (user: User | null): boolean => {
    return isMainTeacherByUser(user);
};

/**
 * Check if user can update collaborator permissions (only main teacher)
 */
export const canUpdateCollaboratorPermissions = (user: User | null): boolean => {
    return isMainTeacherByUser(user);
};

/**
 * Check if user can remove collaborators (only main teacher)
 */
export const canRemoveCollaborators = (user: User | null): boolean => {
    return isMainTeacherByUser(user);
};

/**
 * Get permission description for display
 */
export const getPermissionDescription = (permission: CollaboratorPermission): string => {
    switch (permission) {
        case PERMISSIONS.VIEWER:
            return 'Can view student progress and reports';
        case PERMISSIONS.EDITOR:
            return 'Can view and edit student progress, add notes, and update lesson status';
        default:
            return 'Unknown permission level';
    }
};

/**
 * Get permission badge styling
 */
export const getPermissionBadgeStyle = (permission: CollaboratorPermission): string => {
    switch (permission) {
        case PERMISSIONS.VIEWER:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case PERMISSIONS.EDITOR:
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
