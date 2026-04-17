export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          date: string
          group_size: number
          guide_user_id: string
          id: string
          location: string | null
          notes: string | null
          price: number
          status: string
          time: string
          tour_type: string
          traveler_email: string | null
          traveler_name: string
          traveler_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          group_size?: number
          guide_user_id: string
          id?: string
          location?: string | null
          notes?: string | null
          price?: number
          status?: string
          time: string
          tour_type: string
          traveler_email?: string | null
          traveler_name: string
          traveler_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          group_size?: number
          guide_user_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          price?: number
          status?: string
          time?: string
          tour_type?: string
          traveler_email?: string | null
          traveler_name?: string
          traveler_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          guide_user_id: string
          id: string
          last_message_at: string
          traveler_email: string | null
          traveler_name: string
        }
        Insert: {
          created_at?: string
          guide_user_id: string
          id?: string
          last_message_at?: string
          traveler_email?: string | null
          traveler_name: string
        }
        Update: {
          created_at?: string
          guide_user_id?: string
          id?: string
          last_message_at?: string
          traveler_email?: string | null
          traveler_name?: string
        }
        Relationships: []
      }
      guide_availability: {
        Row: {
          created_at: string
          date: string
          guide_user_id: string
          id: string
          note: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          guide_user_id: string
          id?: string
          note?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          guide_user_id?: string
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: []
      }
      guide_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          expires_at: string | null
          guide_user_id: string
          id: string
          issued_at: string
          issued_by: string | null
          notes: string | null
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          expires_at?: string | null
          guide_user_id: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          expires_at?: string | null
          guide_user_id?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      guide_profiles: {
        Row: {
          activation_status: string
          created_at: string
          current_step: number
          form_data: Json
          id: string
          last_reminder_sent_at: string | null
          payment_reminder_count: number
          service_areas: string[] | null
          status: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          stripe_onboarding_complete: boolean | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_expires_at: string | null
          subscription_plan_id: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          translations: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activation_status?: string
          created_at?: string
          current_step?: number
          form_data?: Json
          id?: string
          last_reminder_sent_at?: string | null
          payment_reminder_count?: number
          service_areas?: string[] | null
          status?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          translations?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activation_status?: string
          created_at?: string
          current_step?: number
          form_data?: Json
          id?: string
          last_reminder_sent_at?: string | null
          payment_reminder_count?: number
          service_areas?: string[] | null
          status?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          translations?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_profiles_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          destination: string
          email: string
          group_size: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          destination: string
          email: string
          group_size?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          destination?: string
          email?: string
          group_size?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      itinerary_swaps: {
        Row: {
          ai_response: string | null
          created_at: string
          day_number: number | null
          id: string
          original_activity: string
          reason: string | null
          status: string
          swapped_activity: string
          tour_plan_id: string | null
          user_email: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          original_activity: string
          reason?: string | null
          status?: string
          swapped_activity: string
          tour_plan_id?: string | null
          user_email: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          original_activity?: string
          reason?: string | null
          status?: string
          swapped_activity?: string
          tour_plan_id?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_swaps_tour_plan_id_fkey"
            columns: ["tour_plan_id"]
            isOneToOne: false
            referencedRelation: "tour_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      password_breach_cache: {
        Row: {
          fetched_at: string
          hashes: string
          prefix: string
        }
        Insert: {
          fetched_at?: string
          hashes: string
          prefix: string
        }
        Update: {
          fetched_at?: string
          hashes?: string
          prefix?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_total: number
          booking_id: string | null
          created_at: string
          currency: string
          guide_payout: number
          guide_user_id: string
          id: string
          metadata: Json | null
          platform_fee: number
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          traveler_email: string | null
          updated_at: string
        }
        Insert: {
          amount_total?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          guide_payout?: number
          guide_user_id: string
          id?: string
          metadata?: Json | null
          platform_fee?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          traveler_email?: string | null
          updated_at?: string
        }
        Update: {
          amount_total?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          guide_payout?: number
          guide_user_id?: string
          id?: string
          metadata?: Json | null
          platform_fee?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          traveler_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          guide_user_id: string
          hidden: boolean
          id: string
          rating: number
          reviewer_email: string | null
          reviewer_name: string
          translations: Json | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          guide_user_id: string
          hidden?: boolean
          id?: string
          rating: number
          reviewer_email?: string | null
          reviewer_name: string
          translations?: Json | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          guide_user_id?: string
          hidden?: boolean
          id?: string
          rating?: number
          reviewer_email?: string | null
          reviewer_name?: string
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_guides: {
        Row: {
          created_at: string
          guide_profile_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guide_profile_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          guide_profile_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_guides_guide_profile_id_fkey"
            columns: ["guide_profile_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          featured_placement: boolean
          features: Json
          id: string
          is_active: boolean
          max_listings: number | null
          max_photos: number | null
          name: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          featured_placement?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_listings?: number | null
          max_photos?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          featured_placement?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_listings?: number | null
          max_photos?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tour_plans: {
        Row: {
          ai_plan: string | null
          budget: string | null
          created_at: string
          days: string | null
          destination: string
          email: string
          experiences: string[] | null
          first_name: string
          guide_description: string | null
          hours_per_day: string | null
          id: string
          last_name: string
          phone: string | null
          refinement_count: number
          refinement_history: Json
          status: string
          update_token: string | null
          updated_at: string
        }
        Insert: {
          ai_plan?: string | null
          budget?: string | null
          created_at?: string
          days?: string | null
          destination: string
          email: string
          experiences?: string[] | null
          first_name: string
          guide_description?: string | null
          hours_per_day?: string | null
          id?: string
          last_name: string
          phone?: string | null
          refinement_count?: number
          refinement_history?: Json
          status?: string
          update_token?: string | null
          updated_at?: string
        }
        Update: {
          ai_plan?: string | null
          budget?: string | null
          created_at?: string
          days?: string | null
          destination?: string
          email?: string
          experiences?: string[] | null
          first_name?: string
          guide_description?: string | null
          hours_per_day?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          refinement_count?: number
          refinement_history?: Json
          status?: string
          update_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          cancellation_policy: string
          category: string | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          currency: string
          detailed_itinerary: string | null
          difficulty_level: number
          duration_unit: string
          duration_value: number
          exclusions: string[] | null
          guide_profile_id: string | null
          guide_user_id: string
          highlights: string[] | null
          id: string
          inclusions: string[] | null
          languages: string[] | null
          max_group_size: number
          meeting_point: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          price_per_person: number
          status: string
          title: string
          updated_at: string
          what_to_bring: string[] | null
        }
        Insert: {
          cancellation_policy?: string
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          detailed_itinerary?: string | null
          difficulty_level?: number
          duration_unit?: string
          duration_value?: number
          exclusions?: string[] | null
          guide_profile_id?: string | null
          guide_user_id: string
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          languages?: string[] | null
          max_group_size?: number
          meeting_point?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          price_per_person?: number
          status?: string
          title: string
          updated_at?: string
          what_to_bring?: string[] | null
        }
        Update: {
          cancellation_policy?: string
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          detailed_itinerary?: string | null
          difficulty_level?: number
          duration_unit?: string
          duration_value?: number
          exclusions?: string[] | null
          guide_profile_id?: string | null
          guide_user_id?: string
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          languages?: string[] | null
          max_group_size?: number
          meeting_point?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          price_per_person?: number
          status?: string
          title?: string
          updated_at?: string
          what_to_bring?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_guide_profile_id_fkey"
            columns: ["guide_profile_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_profiles: {
        Row: {
          budget_preference: string | null
          children_ages: string | null
          created_at: string
          dietary_restrictions: string[] | null
          group_type: string | null
          has_children: boolean | null
          id: string
          interests: string[] | null
          mobility_needs: string | null
          notes: string | null
          pace: string | null
          preferred_languages: string[] | null
          previous_destinations: string[] | null
          travel_style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_preference?: string | null
          children_ages?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          group_type?: string | null
          has_children?: boolean | null
          id?: string
          interests?: string[] | null
          mobility_needs?: string | null
          notes?: string | null
          pace?: string | null
          preferred_languages?: string[] | null
          previous_destinations?: string[] | null
          travel_style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_preference?: string | null
          children_ages?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          group_type?: string | null
          has_children?: boolean | null
          id?: string
          interests?: string[] | null
          mobility_needs?: string | null
          notes?: string | null
          pace?: string | null
          preferred_languages?: string[] | null
          previous_destinations?: string[] | null
          travel_style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_guide_id: string
          target_request_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_guide_id: string
          target_request_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_guide_id?: string
          target_request_id?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_url: string
          id: string
          request_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_url: string
          id?: string
          request_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_url?: string
          id?: string
          request_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          guide_user_id: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          guide_user_id: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          guide_user_id?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      guide_profiles_public: {
        Row: {
          created_at: string | null
          form_data: Json | null
          id: string | null
          service_areas: string[] | null
          status: string | null
          translations: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      reviews_guide: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          guide_user_id: string | null
          hidden: boolean | null
          id: string | null
          rating: number | null
          reviewer_name: string | null
          translations: Json | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guide_user_id?: string | null
          hidden?: boolean | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          translations?: Json | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guide_user_id?: string | null
          hidden?: boolean | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_public: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          guide_user_id: string | null
          hidden: boolean | null
          id: string | null
          rating: number | null
          reviewer_name: string | null
          translations: Json | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guide_user_id?: string | null
          hidden?: boolean | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          translations?: Json | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guide_user_id?: string | null
          hidden?: boolean | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_public_guide_form_data: { Args: { _form_data: Json }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_public_guide_profiles: {
        Args: never
        Returns: {
          created_at: string
          form_data: Json
          id: string
          service_areas: string[]
          status: string
          translations: Json
          user_id: string
        }[]
      }
      notify_email: {
        Args: { event_type: string; payload: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "guide"
      badge_type:
        | "licensed_verified"
        | "permit_confirmed"
        | "certification_pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "guide"],
      badge_type: [
        "licensed_verified",
        "permit_confirmed",
        "certification_pending",
      ],
    },
  },
} as const
