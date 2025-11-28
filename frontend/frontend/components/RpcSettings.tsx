import React, { useState, useRef } from 'react';
import { useCustomRpc, NetworkId, RpcConfig } from '@/hooks/useCustomRpc';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Check, AlertCircle, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RpcSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * RpcSettings Component
 *
 * Settings panel for custom RPC endpoint configuration
 *
 * Features:
 * - Per-network RPC customization
 * - RPC health check
 * - Reset to default
 * - Import/export configurations
 */
export const RpcSettings: React.FC<RpcSettingsProps> = ({ isOpen, onClose }) => {
  const {
    configs,
    setCustomRpc,
    checkNetworkHealth,
    resetToDefault,
    exportConfigs,
    importConfigs,
  } = useCustomRpc();

  const [editingNetwork, setEditingNetwork] = useState<NetworkId | null>(null);
  const [tempRpc, setTempRpc] = useState('');
  const [testing, setTesting] = useState<NetworkId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async (networkId: NetworkId) => {
    const success = await setCustomRpc(networkId, tempRpc.trim() || null);
    if (success) {
      setEditingNetwork(null);
      setTempRpc('');
    }
  };

  const handleTest = async (networkId: NetworkId) => {
    setTesting(networkId);
    await checkNetworkHealth(networkId);
    setTesting(null);
  };

  const handleReset = (networkId: NetworkId) => {
    resetToDefault(networkId);
    if (editingNetwork === networkId) {
      setEditingNetwork(null);
      setTempRpc('');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importConfigs(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">RPC Settings</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Configure custom RPC endpoints for better performance
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Import/Export */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                onClick={exportConfigs}
                variant="outline"
                size="sm"
                className="border-gray-700"
              >
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="border-gray-700"
              >
                <Upload size={16} className="mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Networks List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(Object.entries(configs) as [NetworkId, RpcConfig][]).map(([networkId, config]) => (
              <Card key={networkId} className="bg-gray-800/50 border-gray-700 p-4">
                <div className="space-y-3">
                  {/* Network Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-medium">{config.networkName}</h3>
                      {config.isHealthy ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <Check size={12} />
                          Healthy
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle size={12} />
                          Unhealthy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(networkId)}
                        disabled={testing === networkId}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                        title="Test connection"
                      >
                        <RefreshCw
                          size={16}
                          className={`text-gray-400 ${testing === networkId ? 'animate-spin' : ''}`}
                        />
                      </button>
                      {config.customRpc && (
                        <button
                          onClick={() => handleReset(networkId)}
                          className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                          title="Reset to default"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RPC URL */}
                  {editingNetwork === networkId ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tempRpc}
                        onChange={(e) => setTempRpc(e.target.value)}
                        placeholder="https://your-custom-rpc.com"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleSave(networkId)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingNetwork(null);
                            setTempRpc('');
                          }}
                          size="sm"
                          variant="outline"
                          className="border-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {config.customRpc ? (
                            <>
                              <div className="text-xs text-gray-400 mb-1">Custom RPC:</div>
                              <div className="text-sm text-white font-mono truncate">
                                {config.customRpc}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs text-gray-400 mb-1">Default RPC:</div>
                              <div className="text-sm text-gray-500 font-mono truncate">
                                {config.defaultRpc}
                              </div>
                            </>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            setEditingNetwork(networkId);
                            setTempRpc(config.customRpc || '');
                          }}
                          size="sm"
                          variant="outline"
                          className="border-gray-700 ml-3"
                        >
                          {config.customRpc ? 'Edit' : 'Set Custom'}
                        </Button>
                      </div>

                      {config.lastChecked && (
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date(config.lastChecked).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 bg-gray-800/30">
            <div className="flex items-start gap-3 text-sm text-gray-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>
                Custom RPC endpoints can improve performance but may affect privacy. Only use
                trusted providers. Changes take effect after page reload.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RpcSettings;
