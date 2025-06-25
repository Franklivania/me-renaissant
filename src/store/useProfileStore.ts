import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, DoppelgangerPersona, OnboardingData } from '@/types';
import { SupabaseService } from '@/services/supabase-service';
import { DoppelgangerGenerator } from '@/services/doppelganger-generator';

interface ProfileState {
  // Profile data
  profile: UserProfile | null;
  doppelganger: DoppelgangerPersona | null;
  
  // Onboarding state
  onboardingData: Partial<OnboardingData>;
  isOnboardingComplete: boolean;
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  
  // Actions
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  updateOnboardingField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  completeOnboarding: () => Promise<void>;
  loadProfile: () => Promise<void>;
  generateDoppelganger: () => void;
  syncProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      doppelganger: null,
      onboardingData: {},
      isOnboardingComplete: false,
      isLoading: false,
      isSyncing: false,

      // Set complete onboarding data
      setOnboardingData: (data) => {
        set({ onboardingData: data });
      },

      // Update individual onboarding field
      updateOnboardingField: (field, value) => {
        set((state) => ({
          onboardingData: {
            ...state.onboardingData,
            [field]: value
          }
        }));
      },

      // Complete onboarding process
      completeOnboarding: async () => {
        const { onboardingData } = get();
        
        // Validate required fields
        if (!onboardingData.name || !onboardingData.gender || !onboardingData.role) {
          console.error('Missing required onboarding data');
          return;
        }

        set({ isLoading: true });

        try {
          // Generate doppelganger
          const doppelganger = DoppelgangerGenerator.generatePersona(onboardingData as OnboardingData);
          
          // Create profile in database
          const profileData = {
            name: onboardingData.name,
            gender: onboardingData.gender,
            role: onboardingData.role,
            drink: onboardingData.drink || null,
            hobbies: onboardingData.hobbies || [],
            soul_question: onboardingData.soulQuestion || null,
            doppelganger_name: doppelganger.name,
            doppelganger_title: doppelganger.title,
            renaissance_occupation: doppelganger.occupation,
            description: doppelganger.description
          };

          const profile = await SupabaseService.createProfile(profileData);
          
          if (profile) {
            set({
              profile,
              doppelganger,
              isOnboardingComplete: true,
              isLoading: false
            });
          } else {
            // If database save fails, still set local state
            set({
              doppelganger,
              isOnboardingComplete: true,
              isLoading: false
            });
            
            // Try to sync later
            setTimeout(() => get().syncProfile(), 5000);
          }
        } catch (error) {
          console.error('Error completing onboarding:', error);
          set({ isLoading: false });
        }
      },

      // Load existing profile
      loadProfile: async () => {
        set({ isLoading: true });

        try {
          const profile = await SupabaseService.getProfile();
          
          if (profile) {
            // Generate doppelganger from profile data
            const doppelganger: DoppelgangerPersona = {
              name: profile.doppelganger_name || 'Unknown Renaissance Soul',
              title: profile.doppelganger_title || 'Seeker of Mysteries',
              occupation: profile.renaissance_occupation || 'Artisan of Unknown Arts',
              description: profile.description || 'A mysterious figure from times past.',
              personality_traits: [], // Could be stored separately if needed
              speaking_style: 'formal',
              background_story: profile.description || ''
            };

            set({
              profile,
              doppelganger,
              isOnboardingComplete: true,
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          set({ isLoading: false });
        }
      },

      // Generate new doppelganger from current onboarding data
      generateDoppelganger: () => {
        const { onboardingData } = get();
        
        if (onboardingData.name && onboardingData.gender && onboardingData.role) {
          const doppelganger = DoppelgangerGenerator.generatePersona(onboardingData as OnboardingData);
          set({ doppelganger });
        }
      },

      // Sync local state with database
      syncProfile: async () => {
        const { profile, doppelganger, onboardingData } = get();
        
        if (get().isSyncing) return; // Prevent concurrent syncs
        
        set({ isSyncing: true });

        try {
          if (!profile && doppelganger && onboardingData.name) {
            // Create new profile
            const profileData = {
              name: onboardingData.name,
              gender: onboardingData.gender || null,
              role: onboardingData.role || null,
              drink: onboardingData.drink || null,
              hobbies: onboardingData.hobbies || [],
              soul_question: onboardingData.soulQuestion || null,
              doppelganger_name: doppelganger.name,
              doppelganger_title: doppelganger.title,
              renaissance_occupation: doppelganger.occupation,
              description: doppelganger.description
            };

            const newProfile = await SupabaseService.createProfile(profileData);
            if (newProfile) {
              set({ profile: newProfile });
            }
          } else if (profile && doppelganger) {
            // Update existing profile
            const updates = {
              doppelganger_name: doppelganger.name,
              doppelganger_title: doppelganger.title,
              renaissance_occupation: doppelganger.occupation,
              description: doppelganger.description
            };

            const updatedProfile = await SupabaseService.updateProfile(updates);
            if (updatedProfile) {
              set({ profile: updatedProfile });
            }
          }
        } catch (error) {
          console.error('Error syncing profile:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Clear all profile data
      clearProfile: () => {
        set({
          profile: null,
          doppelganger: null,
          onboardingData: {},
          isOnboardingComplete: false
        });
        localStorage.removeItem('renaissance_session_id');
      }
    }),
    {
      name: 'renaissance-profile-store',
      partialize: (state) => ({
        profile: state.profile,
        doppelganger: state.doppelganger,
        onboardingData: state.onboardingData,
        isOnboardingComplete: state.isOnboardingComplete
      })
    }
  )
);