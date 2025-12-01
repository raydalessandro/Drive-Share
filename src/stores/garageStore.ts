import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "./authStore";
import { toast } from "@/components/ui/use-toast";
import type { Expiration, Maintenance } from "@/components/garage";

interface Motorcycle {
  id: string;
  user_id: string;
  name: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface GarageState {
  motorcycle: Motorcycle | null;
  expirations: Expiration[];
  maintenances: Maintenance[];
  loading: boolean;
}

interface GarageActions {
  loadMotorcycle: () => Promise<void>;
  updateMotorcycle: (name: string, photoUrl: string | null) => Promise<void>;
  loadExpirations: () => Promise<void>;
  addExpiration: (expiration: Omit<Expiration, 'id'>) => Promise<void>;
  updateExpiration: (id: string, expiration: Omit<Expiration, 'id'>) => Promise<void>;
  deleteExpiration: (id: string) => Promise<void>;
  loadMaintenances: () => Promise<void>;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  updateMaintenance: (id: string, maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
}

export const useGarageStore = create<GarageState & GarageActions>((set, get) => ({
  motorcycle: null,
  expirations: [],
  maintenances: [],
  loading: false,

  loadMotorcycle: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      set({ motorcycle: data || null });
    } catch (error: any) {
      console.error('Error loading motorcycle:', error);
      toast({
        title: 'Errore',
        description: 'Errore nel caricamento dati moto',
        variant: 'destructive',
      });
    } finally {
      set({ loading: false });
    }
  },

  updateMotorcycle: async (name: string, photoUrl: string | null) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast({
        title: 'Errore',
        description: 'Utente non autenticato',
        variant: 'destructive',
      });
      return;
    }

    set({ loading: true });
    try {
      const existing = get().motorcycle;
      const nameToSave = name.trim() || null; // Allow null name

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('motorcycles')
          .update({
            name: nameToSave,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        set({ motorcycle: data });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('motorcycles')
          .insert({
            user_id: user.id,
            name: nameToSave,
            photo_url: photoUrl,
          })
          .select()
          .single();

        if (error) throw error;
        set({ motorcycle: data });
      }

      toast({
        title: 'Successo!',
        description: photoUrl ? 'Foto moto aggiornata' : 'Dati moto aggiornati',
      });
    } catch (error: any) {
      console.error('Error updating motorcycle:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Errore nel salvataggio',
        variant: 'destructive',
      });
      throw error; // Re-throw so caller can handle
    } finally {
      set({ loading: false });
    }
  },

  loadExpirations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expirations')
        .select('*')
        .eq('user_id', user.id)
        .order('expiration_date', { ascending: true });

      if (error) throw error;
      set({ expirations: data || [] });
    } catch (error: any) {
      console.error('Error loading expirations:', error);
    }
  },

  addExpiration: async (expiration: Omit<Expiration, 'id'>) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expirations')
        .insert({
          user_id: user.id,
          ...expiration,
        })
        .select()
        .single();

      if (error) throw error;
      set(state => ({ expirations: [...state.expirations, data] }));
    } catch (error: any) {
      console.error('Error adding expiration:', error);
      throw error;
    }
  },

  updateExpiration: async (id: string, expiration: Omit<Expiration, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('expirations')
        .update(expiration)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        expirations: state.expirations.map(exp => exp.id === id ? data : exp),
      }));
    } catch (error: any) {
      console.error('Error updating expiration:', error);
      throw error;
    }
  },

  deleteExpiration: async (id: string) => {
    try {
      const { error } = await supabase
        .from('expirations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        expirations: state.expirations.filter(exp => exp.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting expiration:', error);
      throw error;
    }
  },

  loadMaintenances: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('maintenances')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ maintenances: data || [] });
    } catch (error: any) {
      console.error('Error loading maintenances:', error);
    }
  },

  addMaintenance: async (maintenance: Omit<Maintenance, 'id'>) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('maintenances')
        .insert({
          user_id: user.id,
          ...maintenance,
        })
        .select()
        .single();

      if (error) throw error;
      set(state => ({ maintenances: [data, ...state.maintenances] }));
      
      // Se ha una scadenza, aggiungila anche alle scadenze
      if (maintenance.expiration_date) {
        await get().addExpiration({
          type: 'tagliando', // Default, può essere personalizzato
          expiration_date: maintenance.expiration_date,
          notes: maintenance.notes || undefined,
        });
      }
    } catch (error: any) {
      console.error('Error adding maintenance:', error);
      throw error;
    }
  },

  updateMaintenance: async (id: string, maintenance: Omit<Maintenance, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('maintenances')
        .update(maintenance)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        maintenances: state.maintenances.map(m => m.id === id ? data : m),
      }));
    } catch (error: any) {
      console.error('Error updating maintenance:', error);
      throw error;
    }
  },

  deleteMaintenance: async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        maintenances: state.maintenances.filter(m => m.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting maintenance:', error);
      throw error;
    }
  },
}));



