<template>
    <transition name="slide-fade" appear>
        <div class="my-3">
            <h1>{{ $t("Lighthouse") }}</h1>
            <p>{{ $t("Everytime the report script is run, Lighthouse scores are being fetched from the") }} <a href="https://developers.google.com/speed/docs/insights/v5/get-started">{{ $t("Google PageSpeed Insights API") }}</a> {{ $t("and saved in here.") }}</p>
            <div class="shadow-box shadow-box-with-fixed-bottom-bar">
                <div class="shadow-box table-shadow-box" style="overflow-x: hidden;">
                    <input v-model="searchQuery" type="text" placeholder="Search..." class="form-control" />
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
                            <tr v-for="(lighthouseStat, index) in filteredLighthouseStats.slice().reverse()" :key="index" :class="{ 'shadow-box': $root.windowWidth <= 550 }">
                                <td>
                                    <router-link :to="`/dashboard/${lighthouseStat._monitor}`">
                                        {{ lighthouseStat._monitorName || lighthouseStat._monitor }}
                                    </router-link>
                                </td>
                                <td>{{ lighthouseStat._seo }}</td>
                                <td>{{ lighthouseStat._pd }} {{ $t("/") }} {{ lighthouseStat._pm }}</td>
                                <td>{{ lighthouseStat._ad }} {{ $t("/") }} {{ lighthouseStat._am }}</td>
                                <td>{{ lighthouseStat._bpd }} {{ $t("/") }} {{ lighthouseStat._bpm }}</td>
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

export default {
    components: {
        Datetime,
        Status,
    },

    data() {
        return {
            searchQuery: "",
            lighthouseStats: [],
            refreshIntervalId: null,
        };
    },

    computed: {
        filteredLighthouseStats() {
            if (!this.searchQuery) {
                return this.lighthouseStats;
            }
            return this.lighthouseStats.filter(stat =>
                stat._monitorName.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },

    mounted() {
        this.getLighthouseStats();
        this.setupAutoRefresh();

        const queryParams = new URLSearchParams(window.location.search);
        const searchQuery = queryParams.get("searchQuery");
        if (searchQuery) {
            this.searchQuery = searchQuery;
        }
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
                        resolve({
                            id,
                            name: response.monitor.name
                        });
                    } else {
                        console.error(`Failed to fetch monitor name for ID: ${id}`, response.msg);
                        resolve({
                            id,
                            name: id
                        });
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
