<template>
    <div>
        <form class="my-4" autocomplete="off" @submit.prevent="saveGeneral">
            <!-- Primary Base URL -->
            <div class="mb-4">
                <label class="form-label" for="primaryBaseURL">
                    {{ $t("Primary Base URL") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="primaryBaseURL"
                        v-model="settings.primaryBaseURL"
                        class="form-control"
                        name="primaryBaseURL"
                        placeholder="https://"
                        pattern="https?://.+"
                        autocomplete="new-password"
                    />
                    <button class="btn btn-outline-primary" type="button" @click="autoGetPrimaryBaseURL">
                        {{ $t("Auto Get") }}
                    </button>
                </div>

                <div class="form-text"></div>
            </div>

            <!-- DevOps project directory -->
            <div class="mb-4">
                <label class="form-label" for="devopsDirectory">
                    {{ $t("DevOps project directory") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="devopsDirectory"
                        v-model="settings.devopsDirectory"
                        class="form-control"
                        name="devopsDirectory"
                        placeholder="org/project"
                        pattern="[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+"
                        autocomplete="new-password"
                    />
                </div>
            </div>

            <!-- DevOps iteration path -->
            <div class="mb-4">
                <label class="form-label" for="devopsIterationPath">
                    {{ $t("DevOps iteration path") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="devopsIterationPath"
                        v-model="settings.devopsIterationPath"
                        class="form-control"
                        name="devopsIterationPath"
                        placeholder="project/iteration"
                        pattern="[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+"
                        autocomplete="new-password"
                    />
                </div>
                <div class="form-text">If project directory and iteration path are specified, Teams notifications will include buttons to create a ticket with the notification information, or to search for existing tickets in that directory.</div>
            </div>

            <!-- DevOps assignee -->
            <div class="mb-4">
                <label class="form-label" for="devopsAssignee">
                    {{ $t("DevOps assignee") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="devopsAssignee"
                        v-model="settings.devopsAssignee"
                        class="form-control"
                        name="devopsAssignee"
                        placeholder="someone@cuisine.digital"
                        pattern=".+@.+\..+"
                        autocomplete="new-password"
                    />
                </div>
                <div class="form-text">If specified, the prepopulated ticket creation form will include this assignee.</div>
            </div>


            <!-- Reporting Backend URL -->
            <div class="mb-4">
                <label class="form-label" for="reportingBackendURL">
                    {{ $t("Reporting Backend URL") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="reportingBackendURL"
                        v-model="settings.reportingBackendURL"
                        class="form-control"
                        name="reportingBackendURL"
                        placeholder="https://backend.url:8812/report"
                        pattern="https?://.+"
                        autocomplete="new-password"
                    />
                </div>
            </div>

            <!-- Reporting Backend Token -->
            <div class="mb-4">
                <label class="form-label" for="reportingBackendToken">
                    {{ $t("Reporting Backend Token") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="reportingBackendToken"
                        v-model="settings.reportingBackendToken"
                        class="form-control"
                        name="reportingBackendToken"
                        placeholder="cgp9jwm.qaw*qvm7QYH"
                        autocomplete="new-password"
                        type="password"
                    />
                </div>
            </div>

            <!-- Search Engine -->
            <div class="mb-4">
                <label class="form-label">
                    {{ $t("Search Engine Visibility") }}
                </label>

                <div class="form-check">
                    <input
                        id="searchEngineIndexYes"
                        v-model="settings.searchEngineIndex"
                        class="form-check-input"
                        type="radio"
                        name="searchEngineIndex"
                        :value="true"
                        required
                    />
                    <label class="form-check-label" for="searchEngineIndexYes">
                        {{ $t("Allow indexing") }}
                    </label>
                </div>
                <div class="form-check">
                    <input
                        id="searchEngineIndexNo"
                        v-model="settings.searchEngineIndex"
                        class="form-check-input"
                        type="radio"
                        name="searchEngineIndex"
                        :value="false"
                        required
                    />
                    <label class="form-check-label" for="searchEngineIndexNo">
                        {{ $t("Discourage search engines from indexing site") }}
                    </label>
                </div>
            </div>

            <!-- Entry Page -->
            <div class="mb-4">
                <label class="form-label">{{ $t("Entry Page") }}</label>

                <div class="form-check">
                    <input
                        id="entryPageDashboard"
                        v-model="settings.entryPage"
                        class="form-check-input"
                        type="radio"
                        name="entryPage"
                        value="dashboard"
                        required
                    />
                    <label class="form-check-label" for="entryPageDashboard">
                        {{ $t("Dashboard") }}
                    </label>
                </div>

                <div v-for="statusPage in $root.statusPageList" :key="statusPage.id" class="form-check">
                    <input
                        :id="'status-page-' + statusPage.id"
                        v-model="settings.entryPage"
                        class="form-check-input"
                        type="radio"
                        name="entryPage"
                        :value="'statusPage-' + statusPage.slug"
                        required
                    />
                    <label class="form-check-label" :for="'status-page-' + statusPage.id">
                        {{ $t("Status Page") }} - {{ statusPage.title }}
                    </label>
                </div>
            </div>

            <!-- DNS Cache (nscd) -->
            <div v-if="$root.info.isContainer" class="mb-4">
                <label class="form-label">
                    {{ $t("enableNSCD") }}
                </label>

                <div class="form-check">
                    <input
                        id="nscdEnable"
                        v-model="settings.nscd"
                        class="form-check-input"
                        type="radio"
                        name="nscd"
                        :value="true"
                        required
                    />
                    <label class="form-check-label" for="nscdEnable">
                        {{ $t("Enable") }}
                    </label>
                </div>

                <div class="form-check">
                    <input
                        id="nscdDisable"
                        v-model="settings.nscd"
                        class="form-check-input"
                        type="radio"
                        name="nscd"
                        :value="false"
                        required
                    />
                    <label class="form-check-label" for="nscdDisable">
                        {{ $t("Disable") }}
                    </label>
                </div>
            </div>

            <!-- Chrome Executable -->
            <div class="mb-4">
                <label class="form-label" for="primaryBaseURL">
                    {{ $t("chromeExecutable") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        id="primaryBaseURL"
                        v-model="settings.chromeExecutable"
                        class="form-control"
                        name="primaryBaseURL"
                        :placeholder="$t('chromeExecutableAutoDetect')"
                    />
                    <button class="btn btn-outline-primary" type="button" @click="testChrome">
                        {{ $t("Test") }}
                    </button>
                </div>

                <div class="form-text">
                    {{ $t("chromeExecutableDescription") }}
                </div>
            </div>

            <!-- Client side Timezone -->
            <div class="mb-4">
                <label for="timezone" class="form-label">
                    {{ $t("Display Timezone") }}
                </label>
                <select id="timezone" v-model="$root.userTimezone" class="form-select">
                    <option value="auto">
                        {{ $t("Auto") }}: {{ guessTimezone }}
                    </option>
                    <option
                        v-for="(timezone, index) in timezoneList"
                        :key="index"
                        :value="timezone.value"
                    >
                        {{ timezone.name }}
                    </option>
                </select>
            </div>

            <!-- Server Timezone -->
            <div class="mb-4">
                <label for="timezone" class="form-label">
                    {{ $t("Server Timezone") }}
                </label>
                <select id="timezone" v-model="settings.serverTimezone" class="form-select">
                    <option value="UTC">UTC</option>
                    <option
                        v-for="(timezone, index) in timezoneList"
                        :key="index"
                        :value="timezone.value"
                    >
                        {{ timezone.name }}
                    </option>
                </select>
            </div>

            <!-- Save Button -->
            <div>
                <button class="btn btn-primary" type="submit">
                    {{ $t("Save") }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import dayjs from "dayjs";
import { timezoneList } from "../../util-frontend";

export default {
    data() {
        return {
            timezoneList: timezoneList(),
        };
    },

    computed: {
        settings() {
            return this.$parent.$parent.$parent.settings;
        },
        saveSettings() {
            return this.$parent.$parent.$parent.saveSettings;
        },
        settingsLoaded() {
            return this.$parent.$parent.$parent.settingsLoaded;
        },
        guessTimezone() {
            return dayjs.tz.guess();
        }
    },

    methods: {
        /**
         * Save the settings
         * @returns {void}
         */
        saveGeneral() {
            localStorage.timezone = this.$root.userTimezone;
            this.saveSettings();
        },
        /**
         * Get the base URL of the application
         * @returns {void}
         */
        autoGetPrimaryBaseURL() {
            this.settings.primaryBaseURL = location.protocol + "//" + location.host;
        },
        /**
         * Test the chrome executable
         * @returns {void}
         */
        testChrome() {
            this.$root.getSocket().emit("testChrome", this.settings.chromeExecutable, (res) => {
                this.$root.toastRes(res);
            });
        },
    },
};
</script>

