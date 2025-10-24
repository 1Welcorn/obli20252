import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import type { Collaborator, CollaboratorPermission } from '../types';

interface ManageCollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onInvite: (email: string, permission: CollaboratorPermission) => void;
  onRemove: (email: string) => void;
  onUpdatePermission: (email: string, permission: CollaboratorPermission) => void;
  isPortugueseHelpVisible: boolean;
}

export const ManageCollaboratorsModal: React.FC<ManageCollaboratorsModalProps> = ({ 
  isOpen, 
  onClose, 
  collaborators, 
  onInvite, 
  onRemove, 
  onUpdatePermission,
  isPortugueseHelpVisible 
}) => {
  const [email, setEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<CollaboratorPermission>('viewer');

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim(), selectedPermission);
      setEmail('');
      setSelectedPermission('viewer');
    }
  };

  const getPermissionBadgeColor = (permission: CollaboratorPermission) => {
    return permission === 'editor' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPermissionDescription = (permission: CollaboratorPermission) => {
    return permission === 'editor' 
      ? 'Can view and edit student progress' 
      : 'Can only view student progress';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Manage Collaborators</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600 mb-2">Invite other teachers to collaborate on student progress monitoring.</p>
          {isPortugueseHelpVisible && (
            <p className="text-xs text-slate-500 italic mb-4">
              Convide outros professores para colaborar no monitoramento do progresso dos alunos.
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">👁️ Viewer</h4>
              <p className="text-sm text-blue-700">Read-only access to student dashboards and progress reports</p>
              {isPortugueseHelpVisible && (
                <p className="text-xs text-blue-600 italic">Acesso somente leitura aos painéis e relatórios de progresso</p>
              )}
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">✏️ Editor</h4>
              <p className="text-sm text-green-700">Can view and modify student progress, add notes, and update lesson status</p>
              {isPortugueseHelpVisible && (
                <p className="text-xs text-green-600 italic">Pode visualizar e modificar o progresso, adicionar notas e atualizar status das lições</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleInvite} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Permission Level:</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="permission"
                  value="viewer"
                  checked={selectedPermission === 'viewer'}
                  onChange={(e) => setSelectedPermission(e.target.value as CollaboratorPermission)}
                  className="text-indigo-600"
                />
                <span className="text-sm">Viewer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="permission"
                  value="editor"
                  checked={selectedPermission === 'editor'}
                  onChange={(e) => setSelectedPermission(e.target.value as CollaboratorPermission)}
                  className="text-indigo-600"
                />
                <span className="text-sm">Editor</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
          >
            <UserPlusIcon className="h-5 w-5" />
            Invite Collaborator
          </button>
        </form>

        <div>
          <h3 className="font-semibold text-slate-700 mb-3">Current Collaborators</h3>
          {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-3">Colaboradores Atuais</p>}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {collaborators.length > 0 ? collaborators.map(collaborator => (
              <div key={collaborator.email} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span className="text-slate-800 font-medium">{collaborator.email}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPermissionBadgeColor(collaborator.permission)}`}>
                        {collaborator.permission === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {getPermissionDescription(collaborator.permission)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={collaborator.permission}
                      onChange={(e) => onUpdatePermission(collaborator.email, e.target.value as CollaboratorPermission)}
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button 
                      onClick={() => onRemove(collaborator.email)} 
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove collaborator"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No collaborators yet.</p>
                {isPortugueseHelpVisible && <p className="text-xs text-slate-400 italic mt-1">Nenhum colaborador ainda.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};