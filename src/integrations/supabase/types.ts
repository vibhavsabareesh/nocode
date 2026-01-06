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
      chapters: {
        Row: {
          board: Database["public"]["Enums"]["board_type"]
          chapter_number: number
          created_at: string | null
          grade: number
          id: string
          key_points: string[] | null
          subject_id: string
          summary: string | null
          title: string
        }
        Insert: {
          board: Database["public"]["Enums"]["board_type"]
          chapter_number: number
          created_at?: string | null
          grade: number
          id?: string
          key_points?: string[] | null
          subject_id: string
          summary?: string | null
          title: string
        }
        Update: {
          board?: Database["public"]["Enums"]["board_type"]
          chapter_number?: number
          created_at?: string | null
          grade?: number
          id?: string
          key_points?: string[] | null
          subject_id?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_energy: {
        Row: {
          created_at: string | null
          date: string
          energy_level: Database["public"]["Enums"]["energy_level"] | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          energy_level?: Database["public"]["Enums"]["energy_level"] | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_level?: Database["public"]["Enums"]["energy_level"] | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          chapter_id: string | null
          completed_micro_steps: number | null
          created_at: string | null
          date: string
          estimated_minutes: number | null
          id: string
          micro_steps: string[] | null
          order_index: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          subject_name: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          completed_micro_steps?: number | null
          created_at?: string | null
          date?: string
          estimated_minutes?: number | null
          id?: string
          micro_steps?: string[] | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          subject_name?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          completed_micro_steps?: number | null
          created_at?: string | null
          date?: string
          estimated_minutes?: number | null
          id?: string
          micro_steps?: string[] | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          subject_name?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          actual_duration: number | null
          completed: boolean | null
          created_at: string | null
          end_reason: string | null
          ended_at: string | null
          id: string
          planned_duration: number
          started_at: string | null
          task_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          actual_duration?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          planned_duration: number
          started_at?: string | null
          task_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          actual_duration?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          planned_duration?: number
          started_at?: string | null
          task_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_questions: {
        Row: {
          chapter_id: string
          correct_answer: string
          created_at: string | null
          id: string
          is_math: boolean | null
          math_steps: string[] | null
          options: string[] | null
          question_text: string
          question_type: string | null
        }
        Insert: {
          chapter_id: string
          correct_answer: string
          created_at?: string | null
          id?: string
          is_math?: boolean | null
          math_steps?: string[] | null
          options?: string[] | null
          question_text: string
          question_type?: string | null
        }
        Update: {
          chapter_id?: string
          correct_answer?: string
          created_at?: string | null
          id?: string
          is_math?: boolean | null
          math_steps?: string[] | null
          options?: string[] | null
          question_text?: string
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          board: Database["public"]["Enums"]["board_type"] | null
          created_at: string | null
          display_name: string | null
          grade: number | null
          id: string
          motor_large_buttons: boolean | null
          onboarding_completed: boolean | null
          reading_highlight_current: boolean | null
          reading_increased_spacing: boolean | null
          reading_large_font: boolean | null
          reading_one_section_at_a_time: boolean | null
          selected_modes: Database["public"]["Enums"]["support_mode"][] | null
          sensory_reduce_motion: boolean | null
          sensory_sound_off: boolean | null
          timer_preset: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          board?: Database["public"]["Enums"]["board_type"] | null
          created_at?: string | null
          display_name?: string | null
          grade?: number | null
          id?: string
          motor_large_buttons?: boolean | null
          onboarding_completed?: boolean | null
          reading_highlight_current?: boolean | null
          reading_increased_spacing?: boolean | null
          reading_large_font?: boolean | null
          reading_one_section_at_a_time?: boolean | null
          selected_modes?: Database["public"]["Enums"]["support_mode"][] | null
          sensory_reduce_motion?: boolean | null
          sensory_sound_off?: boolean | null
          timer_preset?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          board?: Database["public"]["Enums"]["board_type"] | null
          created_at?: string | null
          display_name?: string | null
          grade?: number | null
          id?: string
          motor_large_buttons?: boolean | null
          onboarding_completed?: boolean | null
          reading_highlight_current?: boolean | null
          reading_increased_spacing?: boolean | null
          reading_large_font?: boolean | null
          reading_one_section_at_a_time?: boolean | null
          selected_modes?: Database["public"]["Enums"]["support_mode"][] | null
          sensory_reduce_motion?: boolean | null
          sensory_sound_off?: boolean | null
          timer_preset?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          badges: string[] | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_session_date: string | null
          longest_streak: number | null
          total_focused_minutes: number | null
          total_sessions_completed: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak?: number | null
          total_focused_minutes?: number | null
          total_sessions_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak?: number | null
          total_focused_minutes?: number | null
          total_sessions_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subjects: {
        Row: {
          created_at: string | null
          id: string
          subject_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subject_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subject_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      board_type: "CBSE" | "IGCSE"
      energy_level: "low" | "normal" | "high"
      support_mode:
        | "focus_support"
        | "reading_support"
        | "routine_low_overwhelm"
        | "step_by_step_math"
        | "sensory_safe"
        | "motor_friendly"
        | "energy_mode"
      task_status: "pending" | "in_progress" | "completed" | "skipped"
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
      board_type: ["CBSE", "IGCSE"],
      energy_level: ["low", "normal", "high"],
      support_mode: [
        "focus_support",
        "reading_support",
        "routine_low_overwhelm",
        "step_by_step_math",
        "sensory_safe",
        "motor_friendly",
        "energy_mode",
      ],
      task_status: ["pending", "in_progress", "completed", "skipped"],
    },
  },
} as const
