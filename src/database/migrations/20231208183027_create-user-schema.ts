import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('email').notNullable()
    table.text('email').notNullable()
    table.text('address').notNullable()
    table.decimal('weight', 5, 2).notNullable()
    table.decimal('height', 3, 0).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}

