import "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      session_id?: string;
      name: string;
      created_at: string;
    };

    diets: {
      id: string;
      name: string;
      description: string;
      date_hour: string;
      is_on_diet: boolean;
      created_at: string;
    };

    user_diet: {
      id: string;
      user_id: string;
      diet_id: string;
      created_at: string;
    };
  }
}
