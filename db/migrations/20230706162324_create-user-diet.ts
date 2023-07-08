import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_diet", (table) => {
    table.uuid("id").primary();
    table.string("user_id").references("id").inTable("users");
    table.string("diet_id").references("id").inTable("diets");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_diet");
}
