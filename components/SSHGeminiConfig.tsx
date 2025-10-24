import React, { useState } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { sshGeminiService } from '../services/sshGeminiService';

interface SSHGeminiConfigProps {
    onClose: () => void;
    onSuccess: () => void;
}

const SSHGeminiConfig: React.FC<SSHGeminiConfigProps> = ({ onClose, onSuccess }) => {
    const [config, setConfig] = useState({
        host: '',
        port: 22,
        username: '',
        password: '',
        apiEndpoint: '',
        timeout: 30000
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (field: string, value: string | number) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const testConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        setErrorMessage('');

        try {
            // Create a temporary service instance with the provided config
            const { createSSHGeminiService } = await import('../services/sshGeminiService');
            const tempService = createSSHGeminiService(config);
            
            const isConnected = await tempService.testConnection();
            
            if (isConnected) {
                setTestResult('success');
                // Save configuration to localStorage
                localStorage.setItem('ssh_gemini_config', JSON.stringify(config));
                onSuccess();
            } else {
                setTestResult('error');
                setErrorMessage('Connection failed. Please check your configuration.');
            }
        } catch (error) {
            setTestResult('error');
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
            setIsTesting(false);
        }
    };

    const loadSavedConfig = () => {
        const saved = localStorage.getItem('ssh_gemini_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig(parsed);
            } catch (error) {
                console.error('Error loading saved config:', error);
            }
        }
    };

    React.useEffect(() => {
        loadSavedConfig();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Configure SSH Gemini Connection</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Server Host:
                        </label>
                        <input
                            type="text"
                            value={config.host}
                            onChange={(e) => handleInputChange('host', e.target.value)}
                            placeholder="your-server.com or IP address"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Port:
                        </label>
                        <input
                            type="number"
                            value={config.port}
                            onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                            placeholder="22"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Username:
                        </label>
                        <input
                            type="text"
                            value={config.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="your-username"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password:
                        </label>
                        <input
                            type="password"
                            value={config.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="your-password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            API Endpoint:
                        </label>
                        <input
                            type="text"
                            value={config.apiEndpoint}
                            onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
                            placeholder="https://your-server.com/api or ws://your-server.com/ws"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Timeout (ms):
                        </label>
                        <input
                            type="number"
                            value={config.timeout}
                            onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                            placeholder="30000"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Test Result */}
                {testResult && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                        testResult === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {testResult === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                            <XCircleIcon className="h-5 w-5" />
                        )}
                        <span className="text-sm">
                            {testResult === 'success' 
                                ? 'Connection successful! Configuration saved.' 
                                : errorMessage || 'Connection failed. Please check your settings.'
                            }
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={testConnection}
                        disabled={isTesting || !config.host || !config.username || !config.apiEndpoint}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isTesting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Testing...
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Test Connection
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Configuration Help:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <strong>Host:</strong> Your server's domain or IP address</li>
                        <li>• <strong>Port:</strong> Usually 22 for SSH, or your custom port</li>
                        <li>• <strong>API Endpoint:</strong> The URL where your Gemini app is running</li>
                        <li>• <strong>Examples:</strong> https://your-server.com/api, ws://your-server.com/ws</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SSHGeminiConfig;
