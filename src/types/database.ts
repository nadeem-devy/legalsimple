export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'client' | 'lawyer' | 'admin'
export type CaseStatus = 'intake' | 'pending_review' | 'lawyer_requested' | 'lawyer_assigned' | 'in_progress' | 'document_ready' | 'document_reviewed' | 'filed' | 'closed' | 'escalated'
export type CaseType = 'family_law' | 'personal_injury' | 'estate_planning'
export type State = 'AZ' | 'NV' | 'TX'
export type Urgency = 'low' | 'normal' | 'high' | 'urgent'
export type DocumentStatus = 'draft' | 'final' | 'filed'
export type LawyerRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed'
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed'
export type PaymentType = 'document_fee' | 'lawyer_fee' | 'filing_fee'
export type SenderType = 'user' | 'ai' | 'lawyer'
export type DefendantType = 'individual' | 'business'
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

// New messaging system types
export type ConversationType = 'direct' | 'case'
export type ConversationStatus = 'active' | 'archived' | 'deleted'
export type ParticipantRole = 'client' | 'lawyer' | 'admin'
export type ParticipantStatus = 'active' | 'left' | 'removed'
export type MessageType = 'text' | 'attachment' | 'system' | 'case_update'
export type MessageStatus = 'sent' | 'delivered' | 'deleted' | 'edited'
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline'
export type ScanStatus = 'pending' | 'clean' | 'infected' | 'error'
export type EncryptionKeyStatus = 'active' | 'rotated' | 'revoked'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: UserRole
          state: State | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role: UserRole
          state?: State | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          state?: State | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lawyer_profiles: {
        Row: {
          id: string
          user_id: string
          bar_number: string
          bar_state: string
          verified: boolean
          practice_areas: CaseType[]
          states_licensed: State[]
          hourly_rate: number | null
          bio: string | null
          years_experience: number | null
          availability_status: AvailabilityStatus
          rating: number
          total_cases: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bar_number: string
          bar_state: string
          verified?: boolean
          practice_areas: CaseType[]
          states_licensed: State[]
          hourly_rate?: number | null
          bio?: string | null
          years_experience?: number | null
          availability_status?: AvailabilityStatus
          rating?: number
          total_cases?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bar_number?: string
          bar_state?: string
          verified?: boolean
          practice_areas?: CaseType[]
          states_licensed?: State[]
          hourly_rate?: number | null
          bio?: string | null
          years_experience?: number | null
          availability_status?: AvailabilityStatus
          rating?: number
          total_cases?: number
          created_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          client_id: string | null
          lawyer_id: string | null
          status: CaseStatus
          case_type: CaseType
          sub_type: string | null
          state: State
          county: string | null
          city: string | null
          plaintiff_name: string | null
          plaintiff_address: string | null
          defendant_name: string | null
          defendant_address: string | null
          defendant_type: DefendantType | null
          incident_date: string | null
          incident_description: string | null
          damages_amount: number | null
          damages_description: string | null
          desired_outcome: string | null
          complexity_score: number | null
          lawyer_recommended: boolean
          ai_summary: string | null
          urgency: Urgency
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_number: string
          client_id?: string | null
          lawyer_id?: string | null
          status?: CaseStatus
          case_type: CaseType
          sub_type?: string | null
          state: State
          county?: string | null
          city?: string | null
          plaintiff_name?: string | null
          plaintiff_address?: string | null
          defendant_name?: string | null
          defendant_address?: string | null
          defendant_type?: DefendantType | null
          incident_date?: string | null
          incident_description?: string | null
          damages_amount?: number | null
          damages_description?: string | null
          desired_outcome?: string | null
          complexity_score?: number | null
          lawyer_recommended?: boolean
          ai_summary?: string | null
          urgency?: Urgency
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_number?: string
          client_id?: string | null
          lawyer_id?: string | null
          status?: CaseStatus
          case_type?: CaseType
          sub_type?: string | null
          state?: State
          county?: string | null
          city?: string | null
          plaintiff_name?: string | null
          plaintiff_address?: string | null
          defendant_name?: string | null
          defendant_address?: string | null
          defendant_type?: DefendantType | null
          incident_date?: string | null
          incident_description?: string | null
          damages_amount?: number | null
          damages_description?: string | null
          desired_outcome?: string | null
          complexity_score?: number | null
          lawyer_recommended?: boolean
          ai_summary?: string | null
          urgency?: Urgency
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          case_id: string
          sender_type: SenderType
          sender_id: string | null
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          sender_type: SenderType
          sender_id?: string | null
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          sender_type?: SenderType
          sender_id?: string | null
          content?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          case_id: string
          document_type: string
          title: string
          content: string | null
          file_url: string | null
          status: DocumentStatus
          version: number
          generated_by: 'ai' | 'lawyer' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          document_type: string
          title: string
          content?: string | null
          file_url?: string | null
          status?: DocumentStatus
          version?: number
          generated_by?: 'ai' | 'lawyer' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          document_type?: string
          title?: string
          content?: string | null
          file_url?: string | null
          status?: DocumentStatus
          version?: number
          generated_by?: 'ai' | 'lawyer' | null
          created_at?: string
          updated_at?: string
        }
      }
      evidence: {
        Row: {
          id: string
          case_id: string
          uploaded_by: string
          file_name: string
          file_type: string | null
          file_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          uploaded_by: string
          file_name: string
          file_type?: string | null
          file_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          uploaded_by?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          description?: string | null
          created_at?: string
        }
      }
      lawyer_requests: {
        Row: {
          id: string
          case_id: string
          lawyer_id: string
          status: LawyerRequestStatus
          client_message: string | null
          lawyer_response: string | null
          quoted_fee: number | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          lawyer_id: string
          status?: LawyerRequestStatus
          client_message?: string | null
          lawyer_response?: string | null
          quoted_fee?: number | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          lawyer_id?: string
          status?: LawyerRequestStatus
          client_message?: string | null
          lawyer_response?: string | null
          quoted_fee?: number | null
          created_at?: string
          responded_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          case_id: string | null
          client_id: string
          lawyer_id: string | null
          amount: number
          stripe_payment_id: string | null
          status: PaymentStatus
          payment_type: PaymentType | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          client_id: string
          lawyer_id?: string | null
          amount: number
          stripe_payment_id?: string | null
          status?: PaymentStatus
          payment_type?: PaymentType | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          client_id?: string
          lawyer_id?: string | null
          amount?: number
          stripe_payment_id?: string | null
          status?: PaymentStatus
          payment_type?: PaymentType | null
          created_at?: string
        }
      }
      intake_sessions: {
        Row: {
          id: string
          case_id: string
          current_step: string
          collected_data: Json
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          current_step: string
          collected_data?: Json
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          current_step?: string
          collected_data?: Json
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // New encrypted messaging tables
      conversations: {
        Row: {
          id: string
          type: ConversationType
          case_id: string | null
          title: string | null
          created_by: string
          status: ConversationStatus
          encryption_enabled: boolean
          created_at: string
          updated_at: string
          last_message_at: string | null
        }
        Insert: {
          id?: string
          type: ConversationType
          case_id?: string | null
          title?: string | null
          created_by: string
          status?: ConversationStatus
          encryption_enabled?: boolean
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
        Update: {
          id?: string
          type?: ConversationType
          case_id?: string | null
          title?: string | null
          created_by?: string
          status?: ConversationStatus
          encryption_enabled?: boolean
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: ParticipantRole
          status: ParticipantStatus
          notifications_enabled: boolean
          muted_until: string | null
          last_read_at: string | null
          last_read_message_id: string | null
          unread_count: number
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: ParticipantRole
          status?: ParticipantStatus
          notifications_enabled?: boolean
          muted_until?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          unread_count?: number
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: ParticipantRole
          status?: ParticipantStatus
          notifications_enabled?: boolean
          muted_until?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          unread_count?: number
          joined_at?: string
          left_at?: string | null
        }
      }
      direct_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content_encrypted: string
          content_iv: string
          content_tag: string
          content_hash: string
          message_type: MessageType
          reply_to_id: string | null
          metadata: Json
          status: MessageStatus
          edited_at: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content_encrypted: string
          content_iv: string
          content_tag: string
          content_hash: string
          message_type?: MessageType
          reply_to_id?: string | null
          metadata?: Json
          status?: MessageStatus
          edited_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content_encrypted?: string
          content_iv?: string
          content_tag?: string
          content_hash?: string
          message_type?: MessageType
          reply_to_id?: string | null
          metadata?: Json
          status?: MessageStatus
          edited_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
      }
      message_attachments: {
        Row: {
          id: string
          message_id: string
          file_name_encrypted: string
          file_type: string
          file_size: number
          storage_path: string
          storage_bucket: string
          file_key_encrypted: string
          file_iv: string
          thumbnail_path: string | null
          scan_status: ScanStatus
          scanned_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_name_encrypted: string
          file_type: string
          file_size: number
          storage_path: string
          storage_bucket?: string
          file_key_encrypted: string
          file_iv: string
          thumbnail_path?: string | null
          scan_status?: ScanStatus
          scanned_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_name_encrypted?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          storage_bucket?: string
          file_key_encrypted?: string
          file_iv?: string
          thumbnail_path?: string | null
          scan_status?: ScanStatus
          scanned_at?: string | null
          created_at?: string
        }
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      user_presence: {
        Row: {
          user_id: string
          status: PresenceStatus
          last_seen_at: string
          current_conversation_id: string | null
          is_typing: boolean
          typing_started_at: string | null
          device_type: 'web' | 'ios' | 'android' | null
          updated_at: string
        }
        Insert: {
          user_id: string
          status?: PresenceStatus
          last_seen_at?: string
          current_conversation_id?: string | null
          is_typing?: boolean
          typing_started_at?: string | null
          device_type?: 'web' | 'ios' | 'android' | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          status?: PresenceStatus
          last_seen_at?: string
          current_conversation_id?: string | null
          is_typing?: boolean
          typing_started_at?: string | null
          device_type?: 'web' | 'ios' | 'android' | null
          updated_at?: string
        }
      }
      encryption_keys: {
        Row: {
          id: string
          conversation_id: string
          key_encrypted: string
          key_iv: string
          algorithm: string
          key_version: number
          rotated_at: string | null
          previous_key_id: string | null
          status: EncryptionKeyStatus
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          key_encrypted: string
          key_iv: string
          algorithm?: string
          key_version?: number
          rotated_at?: string | null
          previous_key_id?: string | null
          status?: EncryptionKeyStatus
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          key_encrypted?: string
          key_iv?: string
          algorithm?: string
          key_version?: number
          rotated_at?: string | null
          previous_key_id?: string | null
          status?: EncryptionKeyStatus
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type LawyerProfile = Database['public']['Tables']['lawyer_profiles']['Row']
export type Case = Database['public']['Tables']['cases']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Evidence = Database['public']['Tables']['evidence']['Row']
export type LawyerRequest = Database['public']['Tables']['lawyer_requests']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type IntakeSession = Database['public']['Tables']['intake_sessions']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CaseInsert = Database['public']['Tables']['cases']['Insert']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']

// Joined types for common queries
export type CaseWithClient = Case & {
  client: Profile | null
}

export type CaseWithLawyer = Case & {
  lawyer: Profile | null
}

export type CaseWithDetails = Case & {
  client: Profile | null
  lawyer: Profile | null
  documents: Document[]
  evidence: Evidence[]
  messages: ChatMessage[]
}

export type LawyerWithProfile = LawyerProfile & {
  profile: Profile
}

// New messaging helper types
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
export type DirectMessage = Database['public']['Tables']['direct_messages']['Row']
export type MessageAttachment = Database['public']['Tables']['message_attachments']['Row']
export type MessageReadReceipt = Database['public']['Tables']['message_read_receipts']['Row']
export type UserPresence = Database['public']['Tables']['user_presence']['Row']
export type EncryptionKey = Database['public']['Tables']['encryption_keys']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Insert types for new tables
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type DirectMessageInsert = Database['public']['Tables']['direct_messages']['Insert']
export type ConversationParticipantInsert = Database['public']['Tables']['conversation_participants']['Insert']
