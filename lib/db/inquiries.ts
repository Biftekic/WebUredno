import { supabase } from '@/lib/supabase';
import type { Inquiry, CreateInquiryInput } from '@/types/database';

/**
 * Create a new inquiry
 */
export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([{
      ...input,
      status: 'new',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }

  return data as Inquiry;
}

/**
 * Get inquiry by ID
 */
export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching inquiry:', error);
    throw error;
  }

  return data as Inquiry;
}

/**
 * Get inquiries by email
 */
export async function getInquiriesByEmail(email: string): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }

  return data as Inquiry[];
}

/**
 * Get all new inquiries
 */
export async function getNewInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('status', 'new')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching new inquiries:', error);
    throw error;
  }

  return data as Inquiry[];
}

/**
 * Update inquiry status
 */
export async function updateInquiryStatus(
  id: string,
  status: 'new' | 'responded' | 'closed'
): Promise<Inquiry> {
  const updateData: any = { status };

  if (status === 'responded') {
    updateData.responded_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('inquiries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }

  return data as Inquiry;
}

/**
 * Mark inquiry as responded
 */
export async function markInquiryResponded(id: string): Promise<boolean> {
  try {
    await updateInquiryStatus(id, 'responded');
    return true;
  } catch (error) {
    console.error('Error marking inquiry as responded:', error);
    return false;
  }
}

/**
 * Close inquiry
 */
export async function closeInquiry(id: string): Promise<boolean> {
  try {
    await updateInquiryStatus(id, 'closed');
    return true;
  } catch (error) {
    console.error('Error closing inquiry:', error);
    return false;
  }
}

/**
 * Get inquiry statistics
 */
export async function getInquiryStats() {
  const { data, error } = await supabase
    .from('inquiries')
    .select('status, created_at');

  if (error) {
    console.error('Error fetching inquiry stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    new: data.filter(i => i.status === 'new').length,
    responded: data.filter(i => i.status === 'responded').length,
    closed: data.filter(i => i.status === 'closed').length
  };

  return stats;
}