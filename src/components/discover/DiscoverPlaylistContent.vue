<template>
    <div>
        <div class="category-container">
            <div class="main-categories">
                <button v-for="(category, index) in categories" :key="index" @click="selectMainCategory(index)"
                    :class="{ active: selectedMainCategory === index }">
                    {{ category.tag_name }}
                </button>
            </div>

            <div class="sub-categories">
                <button v-for="(tab, index) in currentSubCategories" :key="index" @click="selectSubCategory(index)"
                    :class="{ active: selectedSubCategory === index }">
                    {{ tab.tag_name }}
                </button>
            </div>
        </div>

        <CommonSkeleton v-if="isLoading" variant="card-grid" :count="10" />

        <div v-else class="music-grid">
            <div class="music-card" v-for="card in cardItems" :key="card.key">
                <router-link :to="card.to">
                    <img :src="$getCover(card.cover, 240)" class="music-image" />
                    <div class="music-info">
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.description }}</p>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CommonSkeleton from '../CommonSkeleton.vue';
import { get } from '../../utils/request';

const route = useRoute();
const router = useRouter();

const categories = ref([]);
const selectedMainCategory = ref(0);
const selectedSubCategory = ref(0);
const tagId = ref(0);
const playlistList = ref([]);
const isLoading = ref(true);

const currentSubCategories = computed(() => {
    return categories.value[selectedMainCategory.value]?.son || [];
});

const cardItems = computed(() => {
    return playlistList.value.map(playlist => ({
        key: `playlist-${playlist.global_collection_id}`,
        to: {
            path: '/PlaylistDetail',
            query: { global_collection_id: playlist.global_collection_id }
        },
        cover: playlist.flexible_cover,
        title: playlist.specialname,
        description: playlist.intro
    }));
});

const normalizeIndex = (value, max) => {
    const index = parseInt(value, 10);
    if (Number.isNaN(index) || index < 0 || index >= max) return 0;
    return index;
};

const fetchPlaylistTags = async () => {
    const response = await get('/playlist/tags');
    if (response.status !== 1) return;

    categories.value = response.data;
};

const fetchPlaylistList = async () => {
    const response = await get(`/top/playlist?withsong=0&category_id=${tagId.value}`);
    if (response.status === 1) {
        playlistList.value = response.data.special_list;
    }
};

const syncSelectionFromRoute = () => {
    if (categories.value.length === 0) return;

    const mainIndex = normalizeIndex(route.query.main, categories.value.length);
    const subList = categories.value[mainIndex]?.son || [];
    const subIndex = normalizeIndex(route.query.sub, subList.length);
    const nextTagId = subList[subIndex]?.tag_id || categories.value[0]?.son?.[0]?.tag_id || 0;

    selectedMainCategory.value = mainIndex;
    selectedSubCategory.value = subIndex;
    tagId.value = nextTagId;
};

const ensurePlaylistData = async () => {
    isLoading.value = true;
    playlistList.value = [];

    if (categories.value.length === 0) {
        await fetchPlaylistTags();
    }

    syncSelectionFromRoute();
    await fetchPlaylistList();
    isLoading.value = false;
};

const updatePlaylistQuery = (main, sub, nextTagId) => {
    router.replace({
        path: '/discover',
        query: {
            ...route.query,
            main,
            sub,
            tag: nextTagId
        }
    });
};

const selectMainCategory = (index) => {
    const subList = categories.value[index]?.son || [];
    if (subList.length === 0) return;

    updatePlaylistQuery(index, 0, subList[0].tag_id);
};

const selectSubCategory = (index) => {
    const nextTagId = currentSubCategories.value[index]?.tag_id;
    if (!nextTagId) return;

    updatePlaylistQuery(selectedMainCategory.value, index, nextTagId);
};

watch(() => [route.query.main, route.query.sub], async () => {
    await ensurePlaylistData();
}, { immediate: true });
</script>

<style lang="scss" scoped>
.category-container {
    margin-bottom: 30px;
}

.main-categories {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    button {
        background-color: var(--secondary-color);
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 15px;

        &.active {
            background-color: var(--primary-color);
        }
    }
}

.sub-categories {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;

    button {
        background-color: #f5f5f5;
        border: none;
        padding: 8px 15px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 14px;

        &.active {
            background-color: var(--secondary-color);
            color: #fff;
        }
    }
}

.music-grid {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: space-evenly;
}

.music-card {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 10px;
    text-align: center;
    width: 180px;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px var(--color-box-shadow);
    }

    a {
        display: block;
        color: inherit;
        text-decoration: none;
    }

    img {
        width: 100%;
        border-radius: 8px;
    }
}

.music-info {
    h3 {
        font-size: 16px;
        margin: 10px 0 5px;
    }

    p {
        font-size: 12px;
        color: #666;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 50px;
        line-height: 25px;
    }
}
</style>
