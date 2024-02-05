<template>
    <transition name="slide-fade" appear>
        <div class="my-3">
            <h1>{{ $t("Pipelines") }}</h1>
            <div class="shadow-box shadow-box-with-fixed-bottom-bar">
                <div class="shadow-box table-shadow-box" style="overflow-x: hidden;">
                    <table class="table table-borderless table-hover">
                        <thead>
                            <tr>
                                <th>{{ $t("Project (Link to pipeline)") }}</th>
                                <th>{{ $t("Status") }}</th>
                                <th>{{ $t("Message") }}</th>
                                <th>{{ $t("Timestamp") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(pipeline, index) in pipelines.slice().reverse()" :key="index" :class="{ 'shadow-box': $root.windowWidth <= 550 }">
                                <td><a :href="pipeline._url" target="_blank">{{ pipeline._project }}</a></td>
                                <td>
                                    <Status :status="pipeline._status" />
                                </td>
                                <td>{{ pipeline._message }}</td>
                                <td>
                                    <Datetime :value="pipeline._timestamp * 1000" />
                                </td>
                            </tr>

                            <tr v-if="pipelines.length === 0">
                                <td colspan="4">
                                    {{ $t("No pipelines in database.") }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import Datetime from "../components/Datetime.vue";
import Status from "../components/Status.vue";

export default {
    components: {
        Datetime,
        Status,
    },

    data() {
        return {
            pipelines: [],
            refreshIntervalId: null,
        };
    },

    mounted() {
        this.getPipelines();
        this.setupAutoRefresh();
    },

    beforeUnmount() {
        this.clearAutoRefresh();
    },

    methods: {
        getPipelines() {
            this.$root.getSocket().emit("getPipelines", (res) => {
                if (res.ok) {
                    this.pipelines = res.pipelines;
                }
            });
        },

        setupAutoRefresh() {
            this.refreshIntervalId = setInterval(() => {
                this.getPipelines();
            }, 30000);
        },

        clearAutoRefresh() {
            clearInterval(this.refreshIntervalId);
        },
    }
};

</script>
