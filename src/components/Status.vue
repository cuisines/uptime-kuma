<template>
    <span class="badge rounded-pill" :class=" 'bg-' + color ">{{ text }}</span>
</template>

<script>
export default {
    props: {
        /** Current status of monitor */
        status: {
            type: Number || String,
            default: 0,
        }
    },

    computed: {
        color() {
            if (this.status === 0 || this.status === "failed") {
                return "danger";
            }

            if (this.status === 1 || this.status === "succeeded") {
                return "primary";
            }

            if (this.status === 2 || this.status === "stopped" || this.status === "partially succeeded") {
                return "warning";
            }

            if (this.status === 3) {
                return "maintenance";
            }

            return "secondary";
        },

        text() {
            if (this.status === 0) {
                return this.$t("Down");
            }

            if (this.status === 1) {
                return this.$t("Up");
            }

            if (this.status === 2) {
                return this.$t("Pending");
            }

            if (this.status === 3) {
                return this.$t("statusMaintenance");
            }

            if (this.status === "failed") {
                return this.$t("Failed");
            }

            if (this.status === "succeeded") {
                return this.$t("Succeeded");
            }

            if (this.status === "stopped") {
                return this.$t("Stopped");
            }

            if (this.status === "partially succeeded") {
                return this.$t("Partially succeeded");
            }
            return this.$t("Unknown");
        },
    },
};
</script>

<style scoped>
    span {
        min-width: 64px;
    }
</style>
