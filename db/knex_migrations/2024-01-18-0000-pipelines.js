//create a new table for pipelines with this information: table.increments("id");, then the following data: project, url, status, message, timestamp, and finally, a unique constraint on the project and timestamp columns.

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
