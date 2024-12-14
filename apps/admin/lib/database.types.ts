export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      api_key_table: {
        Row: {
          created_at: string;
          enabled: boolean;
          key: string;
          name: string | null;
          protocol_id: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          key: string;
          name?: string | null;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          key?: string;
          name?: string | null;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "api_key_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      variants_table: {
        Row: {
          addresses: string | null;
          created_at: string;
          delay: number | null;
          enabled: boolean;
          hostnames: string[] | null;
          iconName: string | null;
          iconSrc: string | null;
          id: number;
          message: string;
          name: string;
          pathnames: string[] | null;
          protocol_id: number | null;
          styling: Json | null;
          sub_message: string;
          timer: number | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          addresses?: string | null;
          created_at: string;
          delay?: number | null;
          enabled: boolean;
          hostnames?: string[] | null;
          iconName?: string | null;
          iconSrc?: string | null;
          id?: number;
          message: string;
          name: string;
          pathnames?: string[] | null;
          protocol_id?: number | null;
          styling?: Json | null;
          sub_message: string;
          timer?: number | null;
          type: string;
          updated_at: string;
        };
        Update: {
          addresses?: string | null;
          created_at?: string;
          delay?: number | null;
          enabled?: boolean;
          hostnames?: string[] | null;
          iconName?: string | null;
          iconSrc?: string | null;
          id?: number;
          message?: string;
          name?: string;
          pathnames?: string[] | null;
          protocol_id?: number | null;
          styling?: Json | null;
          sub_message?: string;
          timer?: number | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "variants_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts_table: {
        Row: {
          chain_id: number;
          contract_abi: Json | null;
          contract_address: string;
          contract_name: string | null;
          created_at: string;
          id: number;
          ownership_verified: boolean;
          protocol_id: number | null;
          updated_at: string;
        };
        Insert: {
          chain_id: number;
          contract_abi?: Json | null;
          contract_address: string;
          contract_name?: string | null;
          created_at?: string;
          id?: number;
          ownership_verified?: boolean;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Update: {
          chain_id?: number;
          contract_abi?: Json | null;
          contract_address?: string;
          contract_name?: string | null;
          created_at?: string;
          id?: number;
          ownership_verified?: boolean;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      conversions_table: {
        Row: {
          variant_id: number | null;
          element_id: string | null;
          hostname: string | null;
          id: number;
          pathname: string | null;
          protocol_id: number;
          session: string;
          timestamp: string;
          user: string;
        };
        Insert: {
          variant_id?: number | null;
          element_id?: string | null;
          hostname?: string | null;
          id?: number;
          pathname?: string | null;
          protocol_id: number;
          session: string;
          timestamp?: string;
          user: string;
        };
        Update: {
          variant_id?: number | null;
          element_id?: string | null;
          hostname?: string | null;
          id?: number;
          pathname?: string | null;
          protocol_id?: number;
          session?: string;
          timestamp?: string;
          user?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversions_table_variant_id_variants_table_id_fk";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "variants_table";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversions_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      impressions_table: {
        Row: {
          address: string | null;
          variant_id: number;
          id: number;
          protocol_id: number | null;
          session: string;
          timestamp: string;
          user: string;
        };
        Insert: {
          address?: string | null;
          variant_id: number;
          id?: number;
          protocol_id?: number | null;
          session: string;
          timestamp?: string;
          user: string;
        };
        Update: {
          address?: string | null;
          variant_id?: number;
          id?: number;
          protocol_id?: number | null;
          session?: string;
          timestamp?: string;
          user?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impressions_table_variant_id_variants_table_id_fk";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "variants_table";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impressions_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      logs_table: {
        Row: {
          calculation_type: string;
          chain_id: number;
          contract_address: string;
          created_at: string;
          current_result: number | null;
          data_schema: string | null;
          enabled: boolean;
          event_name: string;
          id: number;
          key: string | null;
          last_block_indexed: number | null;
          protocol_id: number | null;
          start_block: number | null;
          topic_index: number | null;
          updated_at: string;
        };
        Insert: {
          calculation_type: string;
          chain_id: number;
          contract_address: string;
          created_at?: string;
          current_result?: number | null;
          data_schema?: string | null;
          enabled?: boolean;
          event_name: string;
          id?: number;
          key?: string | null;
          last_block_indexed?: number | null;
          protocol_id?: number | null;
          start_block?: number | null;
          topic_index?: number | null;
          updated_at?: string;
        };
        Update: {
          calculation_type?: string;
          chain_id?: number;
          contract_address?: string;
          created_at?: string;
          current_result?: number | null;
          data_schema?: string | null;
          enabled?: boolean;
          event_name?: string;
          id?: number;
          key?: string | null;
          last_block_indexed?: number | null;
          protocol_id?: number | null;
          start_block?: number | null;
          topic_index?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "logs_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      metrics_table: {
        Row: {
          calculation_type: string;
          created_at: string;
          description: string | null;
          enabled: boolean;
          id: number;
          last_calculated: string | null;
          last_value: number | null;
          name: string;
          protocol_id: number | null;
          updated_at: string;
        };
        Insert: {
          calculation_type: string;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          id?: number;
          last_calculated?: string | null;
          last_value?: number | null;
          name: string;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Update: {
          calculation_type?: string;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          id?: number;
          last_calculated?: string | null;
          last_value?: number | null;
          name?: string;
          protocol_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "metrics_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      metrics_variables_table: {
        Row: {
          created_at: string;
          id: number;
          metric_id: number;
          variable_id: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          metric_id: number;
          variable_id: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          metric_id?: number;
          variable_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "metrics_variables_table_metric_id_metrics_table_id_fk";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "metrics_table";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "metrics_variables_table_variable_id_logs_table_id_fk";
            columns: ["variable_id"];
            isOneToOne: false;
            referencedRelation: "logs_table";
            referencedColumns: ["id"];
          }
        ];
      };
      protocol_table: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          plan: string | null;
          stripe_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          plan?: string | null;
          stripe_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          plan?: string | null;
          stripe_id?: string | null;
        };
        Relationships: [];
      };
      users_table: {
        Row: {
          email: string;
          id: number;
          name: string;
          protocol_id: number | null;
        };
        Insert: {
          email: string;
          id?: number;
          name: string;
          protocol_id?: number | null;
        };
        Update: {
          email?: string;
          id?: number;
          name?: string;
          protocol_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
      verification_codes_table: {
        Row: {
          chain_id: number;
          code: string;
          contract_address: string;
          created_at: string;
          enabled: boolean;
          expiration: string;
          id: number;
          protocol_id: number | null;
        };
        Insert: {
          chain_id: number;
          code: string;
          contract_address: string;
          created_at?: string;
          enabled?: boolean;
          expiration: string;
          id?: number;
          protocol_id?: number | null;
        };
        Update: {
          chain_id?: number;
          code?: string;
          contract_address?: string;
          created_at?: string;
          enabled?: boolean;
          expiration?: string;
          id?: number;
          protocol_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_codes_table_protocol_id_protocol_table_id_fk";
            columns: ["protocol_id"];
            isOneToOne: false;
            referencedRelation: "protocol_table";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
