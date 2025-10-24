import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import type { StudyMaterial, StudyMaterialType } from '../types';

interface StudyMaterialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studyMaterials: StudyMaterial[];
    onAddMaterial: (material: Omit<StudyMaterial, 'id' | 'createdAt'>) => void;
    onUpdateMaterial: (id: string, material: Partial<StudyMaterial>) => void;
    onDeleteMaterial: (id: string) => void;
    isPortugueseHelpVisible: boolean;
    currentUserEmail: string | null;
}

const StudyMaterialsModal: React.FC<StudyMaterialsModalProps> = ({
    isOpen,
    onClose,
    studyMaterials,
    onAddMaterial,
    onUpdateMaterial,
    onDeleteMaterial,
    isPortugueseHelpVisible,
    currentUserEmail
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'link' as StudyMaterialType,
        url: '',
        content: '',
        dueDate: '',
        points: '',
        isRequired: false,
        tags: '',
        level: 'all' as 'junior' | 'level1' | 'level2' | 'upper' | 'all'
    });

    if (!isOpen) return null;

    const getTypeIcon = (type: StudyMaterialType) => {
        switch (type) {
            case 'link': return <GlobeIcon className="h-5 w-5" />;
            case 'form': return <DocumentTextIcon className="h-5 w-5" />;
            case 'quiz': return <BeakerIcon className="h-5 w-5" />;
            case 'document': return <DocumentArrowDownIcon className="h-5 w-5" />;
            case 'video': return <SpeakerWaveIcon className="h-5 w-5" />;
            case 'assignment': return <BookOpenIcon className="h-5 w-5" />;
            case 'past_exam': return <TrophyIcon className="h-5 w-5" />;
            default: return <DocumentTextIcon className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: StudyMaterialType) => {
        switch (type) {
            case 'link': return 'text-blue-600 bg-blue-100';
            case 'form': return 'text-green-600 bg-green-100';
            case 'quiz': return 'text-purple-600 bg-purple-100';
            case 'document': return 'text-orange-600 bg-orange-100';
            case 'video': return 'text-red-600 bg-red-100';
            case 'assignment': return 'text-indigo-600 bg-indigo-100';
            case 'past_exam': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getLevelLabel = (level?: string) => {
        switch (level) {
            case 'junior': return 'Junior';
            case 'level1': return 'Level 1';
            case 'level2': return 'Level 2';
            case 'upper': return 'Upper/Free';
            case 'all': return 'All Levels';
            default: return 'All Levels';
        }
    };

    const getLevelColor = (level?: string) => {
        switch (level) {
            case 'junior': return 'text-green-600 bg-green-100';
            case 'level1': return 'text-blue-600 bg-blue-100';
            case 'level2': return 'text-purple-600 bg-purple-100';
            case 'upper': return 'text-orange-600 bg-orange-100';
            case 'all': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'link',
            url: '',
            content: '',
            dueDate: '',
            points: '',
            isRequired: false,
            tags: '',
            level: 'all'
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const validateForm = () => {
        // Check required fields
        if (!formData.title.trim()) {
            alert('Title is required');
            return false;
        }
        
        if (!formData.description.trim()) {
            alert('Description is required');
            return false;
        }
        
        // Check URL validation for link type
        if (formData.type === 'link') {
            if (!formData.url.trim()) {
                alert('URL is required for link type materials');
                return false;
            }
            
            // Basic URL validation
            try {
                new URL(formData.url);
            } catch {
                alert('Please enter a valid URL (e.g., https://example.com)');
                return false;
            }
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const materialData: any = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            type: formData.type,
            isRequired: formData.isRequired,
            createdBy: currentUserEmail || 'unknown',
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            level: formData.level
        };

        // Only add optional fields if they have values
        if (formData.url.trim()) {
            materialData.url = formData.url.trim();
        }
        if (formData.content.trim()) {
            materialData.content = formData.content.trim();
        }
        if (formData.dueDate) {
            materialData.dueDate = new Date(formData.dueDate);
        }
        if (formData.points) {
            materialData.points = parseInt(formData.points);
        }

        try {
            if (editingId) {
                await onUpdateMaterial(editingId, materialData);
            } else {
                await onAddMaterial(materialData);
            }
            
            resetForm();
            // Success message will be shown by the parent component
        } catch (error) {
            console.error('Error saving material:', error);
            // Error message is already shown by the parent component
            // Don't show another alert here
        }
    };

    const handleEdit = (material: StudyMaterial) => {
        setFormData({
            title: material.title,
            description: material.description,
            type: material.type,
            url: material.url || '',
            content: material.content || '',
            dueDate: material.dueDate ? material.dueDate.toISOString().split('T')[0] : '',
            points: material.points?.toString() || '',
            isRequired: material.isRequired,
            tags: material.tags.join(', '),
            level: material.level || 'all'
        });
        setEditingId(material.id);
        setIsAdding(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this study material?')) {
            onDeleteMaterial(id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Study Materials Hub</h2>
                        <p className="text-slate-600 mt-1">Manage educational resources for your students</p>
                        {isPortugueseHelpVisible && (
                            <p className="text-sm text-slate-500 italic mt-1">
                                Gerencie recursos educacionais para seus alunos
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <CloseIcon className="h-6 w-6 text-slate-600" />
                    </button>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Materials List */}
                    <div className="w-1/2 border-r border-slate-200 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Materials ({studyMaterials.length})
                                </h3>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Add Material
                                </button>
                            </div>

                            <div className="space-y-3">
                                {studyMaterials.map((material) => (
                                    <div
                                        key={material.id}
                                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`p-1 rounded ${getTypeColor(material.type)}`}>
                                                        {getTypeIcon(material.type)}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 capitalize">
                                                        {material.type}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(material.level)}`}>
                                                        {getLevelLabel(material.level)}
                                                    </span>
                                                    {material.isRequired && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                                            Required
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-slate-800 mb-1">
                                                    {material.title}
                                                </h4>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {material.description}
                                                </p>
                                                {material.dueDate && (
                                                    <p className="text-xs text-slate-500">
                                                        Due: {material.dueDate.toLocaleDateString()}
                                                    </p>
                                                )}
                                                {material.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {material.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(material)}
                                                    className="p-1 text-slate-600 hover:text-indigo-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(material.id)}
                                                    className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {studyMaterials.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>No study materials yet</p>
                                        <p className="text-sm">Click "Add Material" to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add/Edit Form */}
                    <div className="w-1/2 overflow-y-auto">
                        {isAdding && (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    {editingId ? 'Edit Material' : 'Add New Material'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as StudyMaterialType })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="link">Link</option>
                                            <option value="form">Form</option>
                                            <option value="quiz">Quiz</option>
                                            <option value="document">Document</option>
                                            <option value="video">Video</option>
                                            <option value="assignment">Assignment</option>
                                            <option value="past_exam">Past Obli Exam</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Target Level *
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value as 'junior' | 'level1' | 'level2' | 'upper' | 'all' })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="all">All Levels</option>
                                            <option value="junior">Junior</option>
                                            <option value="level1">Level 1</option>
                                            <option value="level2">Level 2</option>
                                            <option value="upper">Upper/Free</option>
                                        </select>
                                        {isPortugueseHelpVisible && (
                                            <p className="text-xs text-slate-500 italic mt-1">
                                                Selecione o nível para o qual este material é destinado
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            URL {formData.type === 'link' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                                formData.type === 'link' && formData.url 
                                                    ? (() => {
                                                        try {
                                                            new URL(formData.url);
                                                            return 'border-green-300 bg-green-50';
                                                        } catch {
                                                            return 'border-red-300 bg-red-50';
                                                        }
                                                    })()
                                                    : 'border-slate-300'
                                            }`}
                                            placeholder="https://example.com"
                                            required={formData.type === 'link'}
                                        />
                                        {formData.type === 'link' && !formData.url && (
                                            <p className="text-xs text-red-500 mt-1">
                                                URL is required for link type materials
                                            </p>
                                        )}
                                        {formData.type === 'link' && formData.url && (() => {
                                            try {
                                                new URL(formData.url);
                                                return (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        ✓ Valid URL format
                                                    </p>
                                                );
                                            } catch {
                                                return (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        ✗ Invalid URL format. Please include http:// or https://
                                                    </p>
                                                );
                                            }
                                        })()}
                                        {isPortugueseHelpVisible && (
                                            <p className="text-xs text-slate-500 italic mt-1">
                                                Para materiais do tipo "Link", a URL é obrigatória
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Content/Instructions
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            rows={4}
                                            placeholder="Additional instructions or content..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Points
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.points}
                                                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="math, homework, chapter1 (comma separated)"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isRequired"
                                            checked={formData.isRequired}
                                            onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isRequired" className="ml-2 block text-sm text-slate-700">
                                            Required assignment
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            {editingId ? 'Update Material' : 'Add Material'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!isAdding && (
                            <div className="p-6 flex items-center justify-center h-full">
                                <div className="text-center text-slate-500">
                                    <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium">Add Study Materials</p>
                                    <p className="text-sm">Click "Add Material" to create educational resources</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyMaterialsModal;
