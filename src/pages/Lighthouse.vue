<template>
    <transition name="slide-fade" appear>
        <div class="my-3">
            <h1>{{ $t("Lighthouse") }}</h1>
            <div class="shadow-box shadow-box-with-fixed-bottom-bar">
                <div class="shadow-box table-shadow-box" style="overflow-x: hidden;">
                    <table class="table table-borderless table-hover">
                        <thead>
                            <tr>
                                <th>{{ $t("Monitor") }}</th>
                                <th>{{ $t("SEO") }}</th>
                                <th>{{ $t("Performance") }} <br /> {{ $t("Desktop / Mobile") }}</th>
                                <th>{{ $t("Accessibility") }} <br /> {{ $t("Desktop / Mobile") }}</th>
                                <th>{{ $t("Best Practices") }} <br /> {{ $t("Desktop / Mobile") }}</th>
                                <th>{{ $t("Timestamp") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(lighthouseStat, index) in lighthouseStats.slice().reverse()" :key="index" :class="{ 'shadow-box': $root.windowWidth <= 550 }">
                                <td>
                                    <router-link :to="`/dashboard/${lighthouseStat._monitor}`">
                                        {{ lighthouseStat._monitorName || lighthouseStat._monitor }}
                                    </router-link>
                                </td>
                                <td><Status :status="lighthouseStat._seo" :type="'lighthouse'" /></td>
                                <td><Status :status="lighthouseStat._pd" :type="'lighthouse'" /> / <Status :status="lighthouseStat._pm" :type="'lighthouse'" /></td>
                                <td><Status :status="lighthouseStat._ad" :type="'lighthouse'" /> / <Status :status="lighthouseStat._am" :type="'lighthouse'" /></td>
                                <td><Status :status="lighthouseStat._bpd" :type="'lighthouse'" /> / <Status :status="lighthouseStat._bpm" :type="'lighthouse'" /></td>
                                <td><Datetime :value="lighthouseStat._timestamp * 1000" /></td>
                            </tr>

                            <tr v-if="lighthouseStats.length === 0">
                                <td colspan="4">
                                    {{ $t("No lighthouse stats in database.") }}
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
            lighthouseStats: [],
            refreshIntervalId: null,
        };
    },

    mounted() {
        this.getLighthouseStats();
        this.setupAutoRefresh();
    },

    beforeUnmount() {
        this.clearAutoRefresh();
    },

    methods: {
        async getLighthouseStats() {
            this.$root.getSocket().emit("getLighthouseStats", async (res) => {
                if (res.ok) {
                    const tempStats = res.lighthouseStats;
                    await this.fetchMonitorNames(tempStats);
                    this.lighthouseStats = tempStats;
                }
            });
        },

        async fetchMonitorNames(stats) {
            const uniqueMonitorIDs = Array.from(new Set(stats.map(stat => stat._monitor)));

            const monitorNames = await Promise.all(uniqueMonitorIDs.map(id => new Promise((resolve) => {
                this.$root.getSocket().emit("getMonitor", id, (response) => {
                    if (response.ok) {
                        resolve({ id, name: response.monitor.name });
                    } else {
                        console.error(`Failed to fetch monitor name for ID: ${id}`, response.msg);
                        resolve({ id, name: id });
                    }
                });
            })));

            const nameMap = monitorNames.reduce((acc, { id, name }) => {
                acc[id] = name;
                return acc;
            }, {});

            stats.forEach(stat => {
                stat._monitorName = nameMap[stat._monitor];
            });
        },

        setupAutoRefresh() {
            this.refreshIntervalId = setInterval(() => {
                this.getLighthouseStats();
            }, 30000);
        },

        clearAutoRefresh() {
            clearInterval(this.refreshIntervalId);
        },
    },
};

</script>
