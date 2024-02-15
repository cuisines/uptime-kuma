exports.up = function (knex) {
    return knex.schema
        .createTable("lighthouse", function (table) {
            table.increments("id");
            table.comment("This table archives lighthouse data for monitors");
            table.integer("monitor").notNullable();
            table.integer("seo").notNullable();
            table.integer("pd").notNullable().comment("Performance stat for desktop");
            table.integer("pm").notNullable().comment("Performance stat for mobile");
            table.integer("ad").notNullable().comment("Accessibility stat for desktop");
            table.integer("am").notNullable().comment("Accessibility stat for mobile");
            table.integer("bpd").notNullable().comment("Best Practices stat for desktop");
            table.integer("bpm").notNullable().comment("Best Practices stat for mobile");
            table.integer("timestamp").notNullable();
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable("lighthouse");
};
