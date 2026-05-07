<template>
    <div class="discover-page">
        <img class="discover-floating-arona" src="/assets/images/arona.png" alt="Arona" />

        <div class="discover-switch">
            <button v-for="tab in discoverTabs" :key="tab.key" class="switch-item"
                :class="{ active: activeDiscoverTab === tab.key }" @click="handleDiscoverTabClick(tab)">
                {{ tab.label }}
            </button>
        </div>

        <DiscoverPlaylistContent v-if="activeDiscoverTab === 'playlist'" />

        <RankingContent v-else-if="activeDiscoverTab === 'ranking'" :player-control="props.playerControl" />

        <DiscoverNewAlbumContent v-else-if="activeDiscoverTab === 'newAlbum'" />

        <DiscoverNewSongContent v-else-if="activeDiscoverTab === 'newSong'" :player-control="props.playerControl" />
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from 'vue-router';
import DiscoverNewAlbumContent from '../components/discover/DiscoverNewAlbumContent.vue';
import DiscoverNewSongContent from '../components/discover/DiscoverNewSongContent.vue';
import DiscoverPlaylistContent from '../components/discover/DiscoverPlaylistContent.vue';
import RankingContent from '../components/discover/RankingContent.vue';

const route = useRoute();
const router = useRouter();

const props = defineProps({
    playerControl: Object
});

const discoverTabs = [
    { key: 'playlist', label: '发现歌单' },
    { key: 'ranking', label: '音乐榜单' },
    { key: 'newAlbum', label: '新碟上架' },
    { key: 'newSong', label: '新歌速递' }
];

const normalizeDiscoverTab = (view) => {
    return discoverTabs.some(tab => tab.key === view) ? view : 'playlist';
};

const activeDiscoverTab = computed(() => {
    return normalizeDiscoverTab(route.query.view);
});

const handleDiscoverTabClick = (tab) => {
    const nextQuery = { ...route.query };

    if (tab.key === 'playlist') {
        delete nextQuery.view;
    } else {
        nextQuery.view = tab.key;
    }

    router.replace({
        path: '/discover',
        query: nextQuery
    });
};
</script>

<style lang="scss" scoped>
.discover-page {
    position: relative;
    padding: 40px 20px 20px;
}

.discover-floating-arona {
    position: absolute;
    top: -80px;
    left: 50%;
    z-index: 10;
    width: clamp(128px, 20vw, 200px);
    height: auto;
    transform: translateX(-50%);
    pointer-events: none;
    user-select: none;
}

.discover-switch {
    display: flex;
    gap: 6px;
    padding: 5px;
    margin-bottom: 24px;
    background: #f3f4f7;
    border: 1px solid #e8eaf0;
    border-radius: 14px;
}

.switch-item {
    flex: 1;
    min-width: 0;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #8b8f9c;
    font-size: 14px;
    font-weight: 600;
    line-height: 40px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
        background: #fff;
        color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }
}

@media (max-width: 768px) {
    .discover-switch {
        gap: 4px;
        padding: 4px;
    }

    .switch-item {
        font-size: 12px;
        line-height: 36px;
    }
}
</style>
