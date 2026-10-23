import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { workspaceService } from '../services/workspaceService';
import { CreateWorkspaceDto, Workspace } from '../types';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  selectWorkspace: (workspace: Workspace | null) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (payload: CreateWorkspaceDto) => Promise<Workspace>;
  deleteWorkspace: (id: string | number, hardDelete?: boolean) => Promise<void>;
  archiveWorkspace: (id: string | number) => Promise<void>;
  restoreWorkspace: (id: string | number) => Promise<void>;
}

const ACTIVE_WS_KEY = 'axiora_pulse_active_workspace_id';

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  selectWorkspace: async () => {},
  refreshWorkspaces: async () => {},
  createWorkspace: async () => ({} as Workspace),
  deleteWorkspace: async () => {},
  archiveWorkspace: async () => {},
  restoreWorkspace: async () => {},
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
    }
  }, [isAuthenticated]);

  const refreshWorkspaces = async () => {
    setIsLoading(true);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);

      const savedId = await SecureStore.getItemAsync(ACTIVE_WS_KEY);
      if (savedId) {
        const found = list.find((w) => String(w.id) === savedId);
        if (found) {
          setActiveWorkspace(found);
          return;
        }
      }

      if (list.length > 0 && !activeWorkspace) {
        setActiveWorkspace(list[0]);
        await SecureStore.setItemAsync(ACTIVE_WS_KEY, String(list[0].id));
      }
    } catch {
      // Failed to load workspaces
    } finally {
      setIsLoading(false);
    }
  };

  const selectWorkspace = async (ws: Workspace | null) => {
    setActiveWorkspace(ws);
    if (ws) {
      await SecureStore.setItemAsync(ACTIVE_WS_KEY, String(ws.id));
    } else {
      await SecureStore.deleteItemAsync(ACTIVE_WS_KEY);
    }
  };

  const createWorkspace = async (payload: CreateWorkspaceDto): Promise<Workspace> => {
    setIsLoading(true);
    try {
      const newWs = await workspaceService.createWorkspace(payload);
      setWorkspaces((prev) => [newWs, ...prev]);
      await selectWorkspace(newWs);
      return newWs;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkspace = async (id: string | number, hardDelete: boolean = false) => {
    await workspaceService.deleteWorkspace(id, { hard_delete: hardDelete });
    setWorkspaces((prev) => prev.filter((w) => String(w.id) !== String(id)));
    if (activeWorkspace && String(activeWorkspace.id) === String(id)) {
      const remaining = workspaces.filter((w) => String(w.id) !== String(id));
      await selectWorkspace(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const archiveWorkspace = async (id: string | number) => {
    await workspaceService.archiveWorkspace(id);
    await refreshWorkspaces();
  };

  const restoreWorkspace = async (id: string | number) => {
    await workspaceService.restoreWorkspace(id);
    await refreshWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        selectWorkspace,
        refreshWorkspaces,
        createWorkspace,
        deleteWorkspace,
        archiveWorkspace,
        restoreWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
