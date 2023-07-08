import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("diets", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("description");
    table.timestamp("date_hour");
    table.boolean("is_on_diet").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("diets");
}
