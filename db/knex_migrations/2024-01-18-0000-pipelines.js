exports.up = function (knex) {
    return knex.schema
        .createTable("pipeline", function (table) {
            table.increments("id");
            table.comment("This table contains data for each linked pipeline");
            table.string("project").notNullable();
            table.string("url").notNullable();
            table.string("status").notNullable();
            table.string("message").notNullable();
            table.integer("timestamp").notNullable();
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable("pipeline");
};
