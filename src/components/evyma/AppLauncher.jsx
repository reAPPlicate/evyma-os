import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import AppIcon from './AppIcon';
import { createPageUrl } from '@/utils';

// Default apps configuration
const DEFAULT_APPS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
  { id: 'timer', label: 'Timer', icon: 'timer', route: null, isTimer: true },
  { id: 'goals', label: 'Goals', icon: 'goals', route: 'Goals' },
  { id: 'habits', label: 'Habits', icon: 'habits', route: 'Habits' },
  { id: 'journal', label: 'Journal', icon: 'journal', route: 'Journal' },
  { id: 'courses', label: 'Courses', icon: 'courses', route: 'Courses' },
  { id: 'community', label: 'Community', icon: 'community', route: 'Community' },
  { id: 'billing', label: 'Billing', icon: 'billing', route: 'Billing' },
  { id: 'profile', label: 'Profile', icon: 'user', route: 'Profile' },
  { id: 'settings', label: 'Settings', icon: 'settings', route: 'Settings' },
  { id: 'admin', label: 'Admin', icon: 'admin', route: 'Admin', adminOnly: true },
];

/**
 * AppLauncher - Grid of app icons with drag-and-drop reordering
 */
export default function AppLauncher({ 
  accentColor = '#3B82F6',
  columns = 4,
  apps,
  onAppsReorder,
  isEditMode = false,
  onToggleEditMode,
  onOpenSettings,
  onOpenTimer,
}) {
  const [localApps, setLocalApps] = useState(apps || DEFAULT_APPS);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Filter apps based on admin status
  const visibleApps = localApps.filter(app => !app.adminOnly || isAdmin);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(localApps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalApps(items);
    if (onAppsReorder) {
      onAppsReorder(items);
    }
  };

  const handleAppClick = (app) => {
    if (isEditMode) return;
    
    // Handle timer app
    if (app.isTimer && onOpenTimer) {
      onOpenTimer();
      return;
    }
    
    // Navigate to route
    if (app.route) {
      window.location.href = createPageUrl(app.route);
      return;
    }
  };

  const gridColsClass = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[columns] || 'grid-cols-4';

  return (
    <div className="w-full">
      {/* Edit Mode Header */}
      {isEditMode && (
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-white/60">Rearranging apps...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleEditMode}
            className="
              h-8 px-3
              text-white/70 hover:text-white
              hover:bg-white/10
              rounded-lg
              flex items-center gap-1.5
            "
          >
            <X className="w-4 h-4" />
            Done
          </Button>
        </div>
      )}

      {/* App Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="apps" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                grid ${gridColsClass} gap-2 sm:gap-4
                ${isEditMode ? 'animate-pulse-subtle' : ''}
              `}
            >
              {visibleApps.map((app, index) => (
                <Draggable 
                  key={app.id} 
                  draggableId={app.id} 
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        relative
                        ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}
                        ${snapshot.isDragging ? 'z-50' : ''}
                      `}
                    >
                      {/* Edit mode indicator */}
                      {isEditMode && (
                        <div 
                          className="
                            absolute -top-1 -right-1 z-10
                            w-5 h-5 rounded-full
                            bg-white/20 dark:bg-white/10
                            flex items-center justify-center
                          "
                        >
                          <GripVertical className="w-3 h-3 text-white/60" />
                        </div>
                      )}
                      
                      <AppIcon
                        id={app.id}
                        label={app.label}
                        icon={app.icon}
                        accentColor={accentColor}
                        onClick={() => handleAppClick(app)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}