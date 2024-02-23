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
                            :max="1"
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
                        <div class="col d-flex justify-content-start">
                            <button @click="selectAllMonitors" class="btn btn-warning me-2" disabled>Select all monitors</button>
                            <button @click="deselectAllMonitors" class="btn btn-danger" disabled>Deselect all Monitors</button>
                        </div>
                    </div>
                <div class="mt-4">
                    <h3>{{ $t("Timeframe") }}</h3>
                    <div class="row">
                        <div class="col">
                            <div class="mb-2">{{ $t("From") }}</div>
                            <input type="datetime-local" class="form-control" v-model="startTime">
                        </div>

                        <div class="col">
                            <div class="mb-2">{{ $t("to") }}</div>
                            <input type="datetime-local" class="form-control" v-model="endTime">
                        </div>

                        <div class="col">
                            <label for="strategy" class="form-label">{{ $t("1 dataset per..") }}</label>
                            <select id="strategy" class="form-select" v-model="frequency">
                                <option value="daily">{{ $t("day") }}</option>
                                <option value="hourly">{{ $t("hour") }}</option>
                                <option value="minutely">{{ $t("minute") }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <div class="row">
                        <div class="col">
                            <div class="mb-2">{{ $t("Recipient") }}</div>
                            <input type="email" class="form-control" placeholder="someone@cuisine.digital" v-model="recipientEmail">
                        </div>
                        <div class="col">
                            <div class="mb-2">{{ $t("Reporting Backend URL") }}</div>
                            <input type="email" class="form-control" placeholder="https://backend.url:8812/report" v-model="reportingBackendURL">
                        </div>
                        <div class="col">
                            <div class="mb-2">{{ $t("Reporting Backend Token") }}</div>
                            <input type="email" class="form-control" placeholder="cgp9jwm.qaw*qvm7QYH" v-model="reportingBackendToken">
                        </div>
                    </div>
                </div>
                
                <div class="my-3 form-check">
                    <input id="compare" class="form-check-input" type="checkbox" v-model="comparisonChecked">
                    <label class="form-check-label" for="compare">
                        {{ $t("Comparison (WIP)")}}
                        
                    </label>
                </div>

                <div class="row mb-3" v-if="comparisonChecked">
                    <div class="col">
                        <div class="mb-2">{{ $t("Compare to timeframe from") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>

                    <div class="col">
                        <div class="mb-2">{{ $t("to") }}</div>
                        <input type="datetime-local" class="form-control">
                    </div>
                </div>

                <div class="fixed-bottom-bar p-3 d-flex">
                    <button id="monitor-submit-btn" class="btn btn-primary" type="submit" @click="submitForm">{{ $t("Create Report") }}</button>
                    <div class="ms-3">{{ responseMessage }}</div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import axios from "axios";
import VueMultiselect from "vue-multiselect";

export default {
    components: {
        VueMultiselect
    },

    mounted() {
        this.$root.getMonitorList((res) => {
            if (res.ok) {
                Object.values(this.$root.monitorList).filter(monitor => monitor.type !== "group").sort((m1, m2) => {

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
            comparisonChecked: false,
            selectedMonitors: [],
            selectedMonitorsOptions: [],
            report: {},
            startTime: "",
            endTime: "",
            frequency: "",
            recipientEmail: "",
            reportingBackendToken: "",
            reportingBackendURL: "",
            responseMessage: "",
        };
    },

    methods: {
        init() {
            this.selectedMonitors = [];
        },
        selectAllMonitors() {
            this.selectedMonitors = this.selectedMonitorsOptions;
        },
        deselectAllMonitors() {
            this.selectedMonitors = [];
        },

        async submitForm() {
            const formData = {
                selectedMonitors: this.selectedMonitors.map(monitor => monitor.id),
                timeframe: {
                    start: this.startTime,
                    end: this.endTime,
                },
                frequency: this.frequency,
                recipient: this.recipientEmail,
            };

            try {
                const response = await axios.post(this.reportingBackendURL, formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': `${this.reportingBackendToken}`,
                    }
                });
                // Assuming the server sends back a JSON response with a message property
                this.responseMessage = "Report created successfully. A mail should be sent soon.";
            } catch (err) {
                this.responseMessage = "Failed to create report. Please try again later. (2 minutes cooldown)";
            }
        }
    }
};

</script>