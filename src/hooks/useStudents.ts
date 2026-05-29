'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as studentService from '@/services/student.service';
import { StudentWithClass, CreateStudentInput, UpdateStudentInput } from '@/lib/types';
import toast from 'react-hot-toast';

export function useStudents() {
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchStudents = useCallback(async (guruId: string) => {
    setLoading(true);
    setError(null);
    const result = await studentService.getStudents(supabase, guruId);
    if (result.error) {
      setError(result.error);
    } else {
      setStudents(result.data || []);
    }
    setLoading(false);
  }, [supabase]);

  const createStudent = async (guruId: string, data: CreateStudentInput) => {
    setLoading(true);
    const toastId = toast.loading('Menambahkan murid...');
    const result = await studentService.createStudent(supabase, guruId, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Murid berhasil ditambahkan!', { id: toastId });
    // Refresh student list
    fetchStudents(guruId);
    return result.data;
  };

  const updateStudent = async (guruId: string, id: string, data: UpdateStudentInput) => {
    setLoading(true);
    const toastId = toast.loading('Memperbarui data murid...');
    const result = await studentService.updateStudent(supabase, id, data);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Data murid berhasil diperbarui!', { id: toastId });
    // Refresh student list
    fetchStudents(guruId);
    return result.data;
  };

  const deleteStudent = async (guruId: string, id: string) => {
    setLoading(true);
    const toastId = toast.loading('Menghapus murid...');
    const result = await studentService.deleteStudent(supabase, id);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return false;
    }

    toast.success('Murid berhasil dihapus!', { id: toastId });
    // Refresh student list
    fetchStudents(guruId);
    return true;
  };

  const regenerateLink = async (guruId: string, id: string) => {
    setLoading(true);
    const toastId = toast.loading('Membuat link baru...');
    const result = await studentService.regenerateLinkToken(supabase, id);
    setLoading(false);

    if (result.error) {
      toast.error(`Gagal: ${result.error}`, { id: toastId });
      return null;
    }

    toast.success('Link orang tua berhasil diperbarui!', { id: toastId });
    // Refresh list to update current token in UI
    fetchStudents(guruId);
    return result.data;
  };

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    regenerateLink,
  };
}
