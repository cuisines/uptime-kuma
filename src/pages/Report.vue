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
                        :max="100"
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
                        <button class="btn btn-warning me-2" @click="selectAllMonitors">Select all monitors</button>
                        <button class="btn btn-danger" @click="deselectAllMonitors">Deselect all Monitors</button>
                    </div>
                </div>

                <div class="mt-4">
                    <h3>{{ $t("Timeframe") }}</h3>
                    <div class="row">
                        <div class="col">
                            <div class="mb-2">{{ $t("From") }}</div>
                            <input v-model="startTime" type="datetime-local" class="form-control">
                        </div>

                        <div class="col">
                            <div class="mb-2">{{ $t("to") }}</div>
                            <input v-model="endTime" type="datetime-local" class="form-control">
                        </div>

                        <div class="col">
                            <label for="strategy" class="form-label">{{ $t("1 dataset per..") }}</label>
                            <select id="strategy" v-model="frequency" class="form-select">
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
                            <input v-model="recipientEmail" type="email" class="form-control" placeholder="someone@cuisine.digital">
                        </div>
                        <div class="col">
                            <div class="mb-2">{{ $t("Subject") }}</div>
                            <input v-model="subject" type="text" class="form-control" placeholder="Your Report for March 2024">
                        </div>
                        <div class="col">
                            <div class="mb-2">{{ $t("Reporting Backend URL") }}</div>
                            <input v-model="reportingBackendURL" type="email" class="form-control" placeholder="Please specify in Settings -> General" disabled>
                        </div>
                        <div class="col">
                            <div class="mb-2">{{ $t("Reporting Backend Token") }}</div>
                            <input v-model="reportingBackendToken" type="password" class="form-control" placeholder="Please specify in Settings -> General" disabled>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <div class="row">
                        <div class="col">
                            <div class="mb-2">{{ $t("Body") }}</div>
                            <input v-model="body" type="text" class="form-control" placeholder="Hi, you'll find the report(s) you requested attached to this mail.">
                        </div>
                    </div>
                </div>

                <div class="my-3 form-check">
                    <input id="compare" v-model="comparisonChecked" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="compare">
                        {{ $t("Comparison (WIP)") }}
                    </label>
                </div>

                <div v-if="comparisonChecked" class="row mb-3">
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
                    <div class="ms-3 report-message">{{ responseMessage }}</div>
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

    data() {
        return {
            // comparisonChecked: false,
            selectedMonitors: [],
            selectedMonitorsOptions: [],
            report: {},
            startTime: "",
            endTime: "",
            frequency: "",
            recipientEmail: "",
            subject: "",
            body: "",
            reportingBackendToken: "",
            reportingBackendURL: "",
            responseMessage: "",
        };
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

        this.loadSettings();
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

        loadSettings() {
            this.$root.getSocket().emit("getSettings", (res) => {
                this.reportingBackendURL = res.data.reportingBackendURL;
                this.reportingBackendToken = res.data.reportingBackendToken;
            });
        },

        async submitForm() {
            let startTimestamp = Date.parse(this.startTime);
            let endTimestamp = Date.parse(this.endTime);

            const formData = {
                selectedMonitors: this.selectedMonitors.map(monitor => monitor.id),
                timeframe: {
                    start: startTimestamp,
                    end: endTimestamp,
                },
                frequency: this.frequency,
                recipient: this.recipientEmail,
                subject: this.subject !== "" ? this.subject : "Report",
                body: this.body !== "" ? this.body : "Hi, you'll find the report(s) you requested attached to this mail.",
            };

            try {
                await axios.post(this.reportingBackendURL, formData, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": `${this.reportingBackendToken}`,
                    }
                });
                this.responseMessage = "Report created successfully. A mail should be sent soon.";
            } catch (err) {
                this.responseMessage = "Failed to create report. Please try again later. (2 minutes cooldown)";
            }
        }
    }
};

</script>
