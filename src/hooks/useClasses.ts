'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as classService from '@/services/class.service';
import { Class, CreateClassInput, UpdateClassInput } from '@/lib/types';
import toast from 'react-hot-toast';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesWithCount, setClassesWithCount] = useState<(Class & { student_count: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchClasses = useCallback(async (guruId: string, includeCount = false) => {
    setLoading(true);
    setError(null);
    if (includeCount) {
      const result = await classService.getClassWithStudentCount(supabase, guruId);
      if (result.error) {
        setError(result.error);
      } else {
        setClassesWithCount(result.data || []);
        // extract classes from the items
        setClasses(result.data || []);
      }
    } else {
      const result = await classService.getClasses(supabase, guruId);
      if (result.error) {
        setError(result.error);
      } else {
        setClasses(result.data || []);
      }
    }
    setLoading(false);
  }, [supabase]);

  const createClass = async (guruId: string, data: CreateClassInput, includeCount = false) => {
    setLoading(true);
    const toastId = toast.loading('Menambahkan kelas baru...');
    const result = await classService.createClass(supabase, guruId, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Kelas berhasil ditambahkan!', { id: toastId });
    fetchClasses(guruId, includeCount);
    return result.data;
  };

  const updateClass = async (guruId: string, id: string, data: UpdateClassInput, includeCount = false) => {
    setLoading(true);
    const toastId = toast.loading('Memperbarui data kelas...');
    const result = await classService.updateClass(supabase, id, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Data kelas berhasil diperbarui!', { id: toastId });
    fetchClasses(guruId, includeCount);
    return result.data;
  };

  const deleteClass = async (guruId: string, id: string, includeCount = false) => {
    setLoading(true);
    const toastId = toast.loading('Menghapus kelas...');
    const result = await classService.deleteClass(supabase, id);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return false;
    }

    toast.success('Kelas berhasil dihapus!', { id: toastId });
    fetchClasses(guruId, includeCount);
    return true;
  };

  return {
    classes,
    classesWithCount,
    loading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  };
}
