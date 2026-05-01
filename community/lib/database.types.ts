export type Gender = 'male' | 'female' | 'other';
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
export type PoliticalLeaning = 'progressive' | 'moderate' | 'conservative' | 'none';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          provider: string;
          gender: Gender | null;
          age_group: AgeGroup | null;
          region: string | null;
          political_leaning: PoliticalLeaning | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'onboarding_completed'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']> & { onboarding_completed?: boolean };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          like_count: number;
          comment_count: number;
          view_count: number;
          is_poll: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'like_count' | 'comment_count' | 'view_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<Database['public']['Tables']['posts']['Row'], 'title' | 'content' | 'category'>>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          like_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'like_count' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['comments']['Row'], 'content'>>;
      };
      likes: {
        Row: {
          user_id: string;
          target_id: string;
          target_type: 'post' | 'comment';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['likes']['Row'], 'created_at'>;
        Update: never;
      };
      polls: {
        Row: {
          id: string;
          post_id: string;
          question: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['polls']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['polls']['Row'], 'question' | 'ends_at'>>;
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          display_order: number;
        };
        Insert: Omit<Database['public']['Tables']['poll_options']['Row'], 'id'>;
        Update: Partial<Pick<Database['public']['Tables']['poll_options']['Row'], 'text' | 'display_order'>>;
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          gender: Gender | null;
          age_group: AgeGroup | null;
          region: string | null;
          political_leaning: PoliticalLeaning | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['poll_votes']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
};
