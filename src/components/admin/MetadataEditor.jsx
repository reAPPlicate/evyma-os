import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export default function MetadataEditor({ metadata = {}, onChange }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({ 
      id: Math.random().toString(36).substr(2, 9), 
      key, 
      value 
    }));
    setEntries(metadataEntries.length > 0 ? metadataEntries : []);
  }, []);

  const handleAdd = () => {
    const newEntry = { id: Math.random().toString(36).substr(2, 9), key: '', value: '' };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
  };

  const handleRemove = (id) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const handleChange = (id, field, value) => {
    const newEntries = entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    );
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const updateMetadata = (currentEntries) => {
    const metadataObj = {};
    currentEntries.forEach(({ key, value }) => {
      if (key.trim()) {
        metadataObj[key.trim()] = value;
      }
    });
    onChange(metadataObj);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white">Metadata</Label>
        <Button
          type="button"
          onClick={handleAdd}
          size="sm"
          variant="outline"
          className="border-white/10 text-white/80"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Field
        </Button>
      </div>
      
      {entries.length === 0 ? (
        <p className="text-sm text-white/40 italic">No metadata. Click "Add Field" to add custom data.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="flex gap-2">
              <Input
                placeholder="Key"
                value={entry.key}
                onChange={(e) => handleChange(entry.id, 'key', e.target.value)}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Input
                placeholder="Value"
                value={entry.value}
                onChange={(e) => handleChange(entry.id, 'value', e.target.value)}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Button
                type="button"
                onClick={() => handleRemove(entry.id)}
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}