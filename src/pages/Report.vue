<template>
    <transition name="slide-fade" appear>
        <div class="my-3">
            <h1>{{ $t("Create performance report") }}</h1>
            <div class="shadow-box shadow-box-with-fixed-bottom-bar">
                <h2>{{ $t("Monitor(s)") }}</h2>
                    <div class="my-3">
                        <VueMultiselect
                            id="selected_monitors"
                            v-model="selectedMonitors"
                            :options="selectedMonitorsOptions"
                            track-by="id"
                            label="pathName"
                            :multiple="true"
                            :close-on-select="false"
                            :clear-on-select="false"
                            :preserve-search="true"
                            :placeholder="$t('Pick monitor(s) to create a report for')"
                            :preselect-first="false"
                            :max-height="200"
                            :taggable="false"
                        ></VueMultiselect>
                    </div>
                
                <div class="row">
                    <div class="col">
                        <div class="mb-2">{{ $t("From") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>

                    <div class="col">
                        <div class="mb-2">{{ $t("to") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>

                    <div class="col">
                        <label for="strategy" class="form-label">{{ $t("1 dataset per..") }}</label>
                        <select id="strategy" class="form-select">
                            <option value="daily">{{ $t("day") }}</option>
                            <option value="hourly">{{ $t("hour") }}</option>
                            <option value="minutely">{{ $t("minute") }}</option>
                        </select>
                    </div>
                </div>
                
                <h2 class="mt-5">{{ $t("Content") }}</h2>

                <div class="my-3 form-check">
                    <input id="compare" class="form-check-input" type="checkbox" v-model="comparisonChecked">
                    <label class="form-check-label" for="compare">
                        {{ $t("Comparison") }}
                    </label>
                </div>

                <div class="row" v-if="comparisonChecked">
                    

                    <div class="col">
                        <div class="mb-2">{{ $t("Compare to timeframe from") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>

                    <div class="col">
                        <div class="mb-2">{{ $t("to") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>
                </div>

                <div class="my-3 form-check">
                    <input id="lighthouse-stats" class="form-check-input" type="checkbox" v-model="lighthouseChecked">
                    <label class="form-check-label" for="lighthouse-stats">
                        {{ $t("Lighthouse stats") }}
                    </label>
                </div>

                <div class="fixed-bottom-bar p-3">
                    <button id="monitor-submit-btn" class="btn btn-primary" type="submit" :disabled="processing">{{ $t("Create Report") }}</button>
                    {{ $t("  This feature is still work in progress, it doesn't work right now") }}
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import VueMultiselect from "vue-multiselect";

export default {
    components: {
        VueMultiselect
    },

    mounted() {
        this.$root.getMonitorList((res) => {
            if (res.ok) {
                Object.values(this.$root.monitorList).sort((m1, m2) => {

                    if (m1.active !== m2.active) {
                        if (m1.active === 0) {
                            return 1;
                        }

                        if (m2.active === 0) {
                            return -1;
                        }
                    }

                    if (m1.weight !== m2.weight) {
                        if (m1.weight > m2.weight) {
                            return -1;
                        }

                        if (m1.weight < m2.weight) {
                            return 1;
                        }
                    }

                    return m1.pathName.localeCompare(m2.pathName);
                }).map(monitor => {
                    this.selectedMonitorsOptions.push({
                        id: monitor.id,
                        pathName: monitor.pathName,
                    });
                });
            }
            this.init();
        });
    },

    data() {
        return {
            lighthouseChecked: false,
            comparisonChecked: false,
            selectedMonitors: [],
            selectedMonitorsOptions: [],
            report: {}
        };
    },

    methods: {
        init() {
            this.selectedMonitors = [];
        },
    }
};

</script>