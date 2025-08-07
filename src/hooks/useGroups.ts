import { useState, useEffect, useCallback } from 'react';
import { groupsApi } from '../services/groupsApi';
import type { Group } from '../types/group';

interface UseGroupsResult {
  groups: Group[];
  loading: boolean;
  error: string;
  refreshGroups: () => Promise<void>;
  getAvailableGroups: (academicLevel: string, grade: string) => Promise<Group[]>;
  createGroup: (group: Omit<Group, 'id' | 'studentsCount'>) => Promise<boolean>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  groupStats: {
    totalGroups: number;
    totalStudents: number;
    fullGroups: number;
    averageOccupancy: number;
  } | null;
}

export const useGroups = (): UseGroupsResult => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [groupStats, setGroupStats] = useState<UseGroupsResult['groupStats']>(null);

  const refreshGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [groupsData, statsData] = await Promise.all([
        groupsApi.getAll(),
        groupsApi.getGroupStats()
      ]);
      setGroups(groupsData);
      setGroupStats(statsData);
    } catch (err) {
      setError('Error al cargar los grupos');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableGroups = useCallback(async (academicLevel: string, grade: string): Promise<Group[]> => {
    try {
      return await groupsApi.getAvailableGroups(academicLevel, grade);
    } catch (err) {
      console.error('Error getting available groups:', err);
      return [];
    }
  }, []);

  const createGroup = useCallback(async (group: Omit<Group, 'id' | 'studentsCount'>): Promise<boolean> => {
    try {
      setError('');
      await groupsApi.create(group);
      await refreshGroups();
      return true;
    } catch (err) {
      setError('Error al crear el grupo');
      console.error('Error creating group:', err);
      return false;
    }
  }, [refreshGroups]);

  const updateGroup = useCallback(async (id: string, group: Partial<Group>): Promise<boolean> => {
    try {
      setError('');
      await groupsApi.update(id, group);
      await refreshGroups();
      return true;
    } catch (err) {
      setError('Error al actualizar el grupo');
      console.error('Error updating group:', err);
      return false;
    }
  }, [refreshGroups]);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError('');
      const success = await groupsApi.delete(id);
      if (success) {
        await refreshGroups();
      }
      return success;
    } catch (err) {
      setError('Error al eliminar el grupo');
      console.error('Error deleting group:', err);
      return false;
    }
  }, [refreshGroups]);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  return {
    groups,
    loading,
    error,
    refreshGroups,
    getAvailableGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    groupStats
  };
};
