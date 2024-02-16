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
        },
        /** Type of the status component */
        type: {
            type: String,
            default: "state",
        },
    },
    computed: {
        color() {
            // Add conditions based on the type prop
            if (this.type === "pipeline") {
                if (this.status === "failed") {
                    return "danger";
                }

                if (this.status === "succeeded") {
                    return "primary";
                }

                if (this.status === "stopped" || this.status === "partially succeeded") {
                    return "warning";
                }

                if (this.status === 3) {
                    return "maintenance";
                }

            } else if (this.type === "state") {
                if (this.status === 0) {
                    return "danger";
                }

                if (this.status === 1) {
                    return "primary";
                }

                if (this.status === 2) {
                    return "warning";
                }

                if (this.status === 3) {
                    return "maintenance";
                }

            } else if (this.type === "lighthouse") {
                if (this.status > 90) {
                    return "primary";
                } else if (this.status > 50) {
                    return "warning";
                } else {
                    return "danger";
                }
            } 

            return 'secondary';
        },
        text() {
            // Add conditions based on the type prop
            if (this.type === "pipeline") {
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

            } else if (this.type === "state") {
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

            } else if (this.type === "lighthouse") {
                return this.status;
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
