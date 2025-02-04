import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => Promise<void>;
  label?: string;
}

export default function ExportButton({ onExport, label = 'Exporter' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
      <span>{loading ? 'Exportation...' : label}</span>
    </button>
  );
}