import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Lightbulb, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EvymaInsights({ accentColor = '#3B82F6' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch context
      const [todos, activities] = await Promise.all([
        base44.entities.Todo.filter({ status: { $ne: 'completed' } }, '-priority', 5),
        base44.entities.Activity.list('-created_date', 3)
      ]);

      const context = {
        pendingTodos: todos.map(t => ({ title: t.title, priority: t.priority })),
        recentActivities: activities.map(a => a.title)
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Evyma, a personal AI coach. Based on this user context: ${JSON.stringify(context)}, generate exactly 2-3 brief, actionable next steps the user should take. Each should be specific and under 60 characters. Focus on immediate priorities.`,
        response_json_schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.actions || []);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setSuggestions([{ text: "Start by reviewing your pending tasks", priority: "medium" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 backdrop-blur-xl"
      style={{
        background: `linear-gradient(135deg, rgba(${accentRgb}, 0.15), rgba(${accentRgb}, 0.05))`,
        border: `1px solid rgba(${accentRgb}, 0.3)`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `rgba(${accentRgb}, 0.2)` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Evyma Insights
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={generateSuggestions}
          disabled={loading}
          className="h-7 w-7 rounded-full text-white/40 hover:text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <>
            <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
          </>
        ) : suggestions.length > 0 ? (
          suggestions.map((action, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group"
            >
              <div 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: action.priority === 'high' ? '#ef4444' : 
                    action.priority === 'medium' ? accentColor : 'rgba(255,255,255,0.4)'
                }}
              />
              <span className="text-sm text-white/80 flex-1">{action.text}</span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          ))
        ) : (
          <p className="text-sm text-white/50 text-center py-2">No suggestions available</p>
        )}
      </div>
    </motion.div>
  );
}