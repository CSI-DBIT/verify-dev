import { create } from 'zustand';
import { Organization } from '@/types';

interface OrgState {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
}

interface OrgActions {
  setOrganizations: (organizations: Organization[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  reset: () => void;
}

type OrganizationStore = OrgState & OrgActions;

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  // Initial state
  organizations: [],
  loading: false,
  error: null,

  // Actions
  setOrganizations: (organizations) =>
    set((state) => ({
      ...state,
      organizations,
      error: null,
    })),

  setLoading: (loading) =>
    set((state) => ({
      ...state,
      loading,
    })),

  setError: (error) =>
    set((state) => ({
      ...state,
      error,
      loading: false,
    })),

  addOrganization: (organization) =>
    set((state) => ({
      ...state,
      organizations: [...state.organizations, organization],
    })),

  updateOrganization: (id, updates) =>
    set((state) => ({
      ...state,
      organizations: state.organizations.map((org) =>
        org.orgId === id ? { ...org, ...updates } : org
      ),
    })),

  removeOrganization: (id) =>
    set((state) => ({
      ...state,
      organizations: state.organizations.filter((org) => org.orgId !== id),
    })),

  reset: () =>
    set(() => ({
      organizations: [],
      loading: false,
      error: null,
    })),
})); 