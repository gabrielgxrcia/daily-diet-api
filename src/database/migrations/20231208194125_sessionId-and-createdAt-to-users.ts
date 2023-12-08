import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.uuid('session_id').after('height').notNullable().index()

    table.text("created_at").defaultTo(knex.fn.now()).notNullable().after("session_id");
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('session_id')
    table.dropColumn('created_at')
  })
}

