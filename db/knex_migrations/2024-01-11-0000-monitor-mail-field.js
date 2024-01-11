exports.up = function (knex) {
    return knex.schema
        .alterTable("monitor", function (table) {
            table.string("pm_mail").nullable().defaultTo(null);
            table.string("customer_mail").nullable().defaultTo(null);
        });
};

exports.down = function (knex) {
    return knex.schema
        .alterTable("monitor", function (table) {
            table.dropColumn("pm_mail");
            table.dropColumn("customer_mail");
        });
}