<template>
    <div class="recommended-search-page">
        <div class="search-hero">
            <div class="search-panel">
                <p class="search-tag">推荐搜索</p>

                <div ref="searchAreaRef" class="search-area">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input v-model.trim="searchKeyword" type="text" placeholder="搜索歌曲、歌手、专辑、歌单"
                            @focus="handleSearchFocus" autofocus @keydown.down.prevent="highlightNextSuggestion"
                            @keydown.up.prevent="highlightPrevSuggestion"
                            @keydown.enter.prevent="submitSearch(searchKeyword, true)" />
                        <button @click="submitSearch(searchKeyword)">搜索</button>
                    </div>

                    <div v-if="showSuggestions" class="suggestion-dropdown">
                        <div v-if="isSuggestLoading" class="suggestion-state">
                            正在获取搜索建议...
                        </div>
                        <button v-for="(item, index) in suggestions" v-else :key="`${item.keyword}-${index}`"
                            :class="index === activeSuggestionIndex ? 'suggestion-item active' : 'suggestion-item'"
                            @mouseenter="activeSuggestionIndex = index"
                            @mousedown.prevent="applySuggestion(item.keyword)">
                            <div class="suggestion-main">
                                <span class="suggestion-keyword">{{ item.keyword }}</span>
                                <span v-if="shouldShowReason(item)" class="suggestion-reason">{{ item.reason }}</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div v-if="hotKeywords.length" class="quick-tags">
                    <button v-for="item in hotKeywords" :key="item.keyword" class="quick-tag"
                        @click="selectKeyword(item.keyword)">
                        {{ item.keyword }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="status-card">
            <i class="fas fa-spinner fa-spin"></i>
            <span>正在加载热门搜索榜单...</span>
        </div>

        <div v-else-if="fixedBoard" class="boards-layout">
            <div class="boards-shell">
                <article class="board-card fixed-board">
                    <div class="board-header">
                        <div>
                            <h2>{{ fixedBoard.name }}</h2>
                        </div>
                    </div>

                    <div class="rank-list compact-rank-list">
                        <button v-for="(item, index) in getBoardKeywords(fixedBoard, 10)"
                            :key="`${fixedBoard.name}-${item.keyword}-${index}`" class="rank-item compact-rank-item"
                            @click="selectKeyword(item.keyword)">
                            <span :class="index < 3 ? 'rank-index top' : 'rank-index'">{{ index + 1 }}</span>
                            <div class="rank-info">
                                <span class="rank-keyword">{{ item.keyword }}</span>
                                <span v-if="shouldShowReason(item)" class="rank-meta">{{ item.reason }}</span>
                            </div>
                        </button>
                    </div>
                </article>

                <div class="switchable-board-panel">
                    <div v-if="switchableBoards.length" class="side-board-switcher">
                        <button v-for="(board, boardIndex) in switchableBoards" :key="`${board.name}-${boardIndex}-tab`"
                            :class="boardIndex === activeSideBoardIndex ? 'switcher-button active' : 'switcher-button'"
                            @click="activeSideBoardIndex = boardIndex">
                            {{ board.name }}
                        </button>
                    </div>

                    <article v-if="activeBoard" class="board-card compact-board">
                        <div class="rank-list compact-rank-list">
                            <button v-for="(item, index) in getBoardKeywords(activeBoard, 10)"
                                :key="`${activeBoard.name}-${item.keyword}-${index}`"
                                class="rank-item compact-rank-item" @click="selectKeyword(item.keyword)">
                                <span :class="index < 3 ? 'rank-index top' : 'rank-index'">{{ index + 1 }}</span>
                                <div class="rank-info">
                                    <span class="rank-keyword">{{ item.keyword }}</span>
                                    <span v-if="shouldShowReason(item)" class="rank-meta">{{ item.reason }}</span>
                                </div>
                            </button>
                        </div>
                    </article>

                    <article v-else class="board-card compact-board empty-board">
                        <div class="board-header">
                            <div>
                                <h2>暂无可切换榜单</h2>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>

        <div v-else class="status-card">
            <i class="fas fa-music"></i>
            <span>暂无可切换的榜单数据</span>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { get } from '../utils/request';

const route = useRoute();
const router = useRouter();

const getRouteKeyword = (value) => typeof value === 'string' ? value : '';
const normalizeKeyword = (value) => String(value ?? '').trim();

const searchKeyword = ref(getRouteKeyword(route.query.q));
const boards = ref([]);
const isLoading = ref(false);
const activeSideBoardIndex = ref(0);
const suggestions = ref([]);
const isSuggestLoading = ref(false);
const showSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const searchAreaRef = ref(null);
let suggestTimer = null;

const setSuggestions = (list = [], visible = list.length > 0) => {
    suggestions.value = list;
    activeSuggestionIndex.value = list.length ? 0 : -1;
    showSuggestions.value = visible;
};

const normalizeBoards = (list = []) => {
    if (!Array.isArray(list)) return [];

    return list
        .map((board) => ({
            name: board?.name || '热门榜单',
            keywords: Array.isArray(board?.keywords)
                ? board.keywords
                    .map((item) => ({
                        keyword: item?.keyword || '',
                        reason: item?.reason || '',
                        icon: Number(item?.icon) || 0,
                        jumpurl: item?.jumpurl || '',
                        json_url: item?.json_url || '',
                        type: item?.type ?? 0
                    }))
                    .filter((item) => item.keyword)
                : []
        }))
        .filter((board) => board.keywords.length);
};

const hotBoard = computed(() => {
    return boards.value.find((board) => board.name.includes('热搜')) || boards.value[0] || null;
});

const fixedBoard = computed(() => {
    return boards.value[0] || null;
});

const hotKeywords = computed(() => {
    return hotBoard.value?.keywords?.slice(0, 12) || [];
});

const switchableBoards = computed(() => {
    return boards.value.slice(1);
});

const activeBoard = computed(() => {
    return switchableBoards.value[activeSideBoardIndex.value] || null;
});

const normalizeSuggestions = (response) => {
    const records = response?.data?.[0]?.RecordDatas;
    if (!Array.isArray(records)) return [];

    const seen = new Set();
    return records
        .map((item) => {
            const keyword = normalizeKeyword(item?.HintInfo);
            return {
                keyword,
                reason: keyword,
                subtitle: item?.subtitle || '',
                hot: Number(item?.Hot) || 0,
                icon: Number(item?.icon) || 0
            };
        })
        .filter((item) => {
            if (!item.keyword || seen.has(item.keyword)) return false;
            seen.add(item.keyword);
            return true;
        });
};

const fetchHotBoards = async () => {
    isLoading.value = true;

    try {
        const response = await get('/search/hot');

        if (response?.status !== 1) {
            throw new Error('热门搜索数据加载失败');
        }

        boards.value = normalizeBoards(response?.data?.list);
    } catch (error) {
        boards.value = [];
    } finally {
        isLoading.value = false;
    }
};

const fetchSuggestions = async (keyword) => {
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!normalizedKeyword) {
        setSuggestions([], false);
        return;
    }

    isSuggestLoading.value = true;
    showSuggestions.value = true;

    try {
        const response = await get('/search/suggest', {
            keywords: normalizedKeyword,
            musicTipCount: 6,
            albumTipCount: 0,
            mvTipCount: 0,
            correctTipCount: 0
        });

        if (response?.status !== 1) {
            setSuggestions([], false);
            return;
        }

        setSuggestions(normalizeSuggestions(response));
    } catch (error) {
        setSuggestions([], false);
        console.error('加载搜索建议失败', error);
    } finally {
        isSuggestLoading.value = false;
    }
};

const getBoardKeywords = (board, limit = null) => {
    if (!board?.keywords) return [];
    return typeof limit === 'number' ? board.keywords.slice(0, limit) : board.keywords;
};

const shouldShowReason = (item) => {
    const reason = normalizeKeyword(item?.reason);
    return !!reason && reason !== normalizeKeyword(item?.keyword);
};

const submitSearch = (keyword = searchKeyword.value, preferSuggestion = false) => {
    const selectedKeyword = preferSuggestion
        ? suggestions.value[activeSuggestionIndex.value]?.keyword
        : '';
    const normalizedKeyword = normalizeKeyword(selectedKeyword || keyword || searchKeyword.value);
    if (!normalizedKeyword) return;
    showSuggestions.value = false;

    if (normalizedKeyword.includes('collection_')) {
        router.push({
            path: '/PlaylistDetail',
            query: { global_collection_id: normalizedKeyword }
        });
        return;
    }

    router.push({
        path: '/search',
        query: { q: normalizedKeyword }
    });
};

const selectKeyword = (keyword) => {
    searchKeyword.value = keyword;
    submitSearch(keyword);
};

const applySuggestion = (keyword) => selectKeyword(keyword);

const handleSearchFocus = () => {
    if (suggestions.value.length) {
        showSuggestions.value = true;
    }
};

const highlightNextSuggestion = () => {
    if (!suggestions.value.length) return;
    showSuggestions.value = true;
    activeSuggestionIndex.value = activeSuggestionIndex.value >= suggestions.value.length - 1
        ? 0
        : activeSuggestionIndex.value + 1;
};

const highlightPrevSuggestion = () => {
    if (!suggestions.value.length) return;
    showSuggestions.value = true;
    activeSuggestionIndex.value = activeSuggestionIndex.value <= 0
        ? suggestions.value.length - 1
        : activeSuggestionIndex.value - 1;
};

const handleClickOutside = (event) => {
    if (!searchAreaRef.value?.contains(event.target)) {
        showSuggestions.value = false;
    }
};

const focusSearchInput = () => {
    nextTick(() => {
        searchAreaRef.value?.querySelector('input')?.focus();
    });
};

watch(() => route.query.q, (value) => {
    searchKeyword.value = getRouteKeyword(value);
});

watch(searchKeyword, (value) => {
    clearTimeout(suggestTimer);

    const normalizedKeyword = normalizeKeyword(value);
    if (!normalizedKeyword) {
        setSuggestions([], false);
        return;
    }

    suggestTimer = setTimeout(() => {
        fetchSuggestions(normalizedKeyword);
    }, 220);
});

watch(switchableBoards, (value) => {
    if (!value.length || activeSideBoardIndex.value >= value.length) {
        activeSideBoardIndex.value = 0;
    }
}, { immediate: true });

onMounted(() => {
    fetchHotBoards();
    focusSearchInput();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    clearTimeout(suggestTimer);
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.recommended-search-page {
    --page-surface: rgba(255, 255, 255, 0.86);
    --page-surface-strong: rgba(255, 255, 255, 0.94);
    --page-line: rgba(var(--primary-color-rgb), 0.14);
    --page-line-strong: rgba(var(--primary-color-rgb), 0.24);
    --page-shadow: 0 24px 60px rgba(var(--primary-color-rgb), 0.16);
    --page-shadow-soft: 0 18px 40px rgba(var(--primary-color-rgb), 0.1);
    --page-text-muted: rgba(51, 51, 51, 0.68);
    --page-accent-soft: rgba(var(--primary-color-rgb), 0.78);
    --page-accent-strong: rgba(var(--primary-color-rgb), 0.96);
    --page-accent-shadow: rgba(var(--primary-color-rgb), 0.28);
    min-height: calc(100vh - 90px);
    padding: 32px 24px 48px;
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at top left, rgba(var(--primary-color-rgb), 0.2), transparent 30%),
        radial-gradient(circle at top right, rgba(var(--primary-color-rgb), 0.14), transparent 26%),
        linear-gradient(180deg, rgba(var(--primary-color-rgb), 0.05) 0%, rgba(var(--primary-color-rgb), 0.09) 46%, rgba(var(--primary-color-rgb), 0.03) 100%);

    &:is(.dark .recommended-search-page) {
        --page-surface: rgba(24, 24, 28, 0.88);
        --page-surface-strong: rgba(30, 30, 36, 0.96);
        --page-line: rgba(255, 255, 255, 0.08);
        --page-line-strong: rgba(255, 255, 255, 0.16);
        --page-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
        --page-shadow-soft: 0 18px 40px rgba(0, 0, 0, 0.24);
        --page-text-muted: rgba(255, 255, 255, 0.62);
        --page-accent-shadow: rgba(var(--primary-color-rgb), 0.2);
        background:
            radial-gradient(circle at top left, rgba(var(--primary-color-rgb), 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(var(--primary-color-rgb), 0.12), transparent 30%),
            linear-gradient(180deg, rgba(12, 13, 16, 0.98) 0%, rgba(18, 20, 24, 0.96) 48%, rgba(11, 12, 15, 0.98) 100%);
    }
}

.search-hero,
.status-card,
.boards-layout {
    position: relative;
    z-index: 1;
}

.search-hero {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    z-index: 3;
}

.search-panel {
    width: min(1080px, 100%);
    display: block;
    padding: 22px;
    border-radius: 34px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 244, 249, 0.84));
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: var(--page-shadow);
    backdrop-filter: blur(16px);
    position: relative;
    z-index: 1;

    &:is(.dark .search-panel) {
        background: linear-gradient(135deg, rgba(30, 30, 36, 0.96), rgba(22, 23, 28, 0.9));
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
    }
}

.boards-shell,
.status-card {
    border: 1px solid var(--page-line);
    background: var(--page-surface);
    box-shadow: var(--page-shadow-soft);
    backdrop-filter: blur(16px);
}

.search-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.14), rgba(255, 214, 228, 0.86));
    color: var(--primary-color);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    &:is(.dark .search-tag) {
        background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1), rgba(255, 214, 228, 0.12));
        color: rgba(255, 255, 255, 0.88);
    }
}

.search-box {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 12px 12px 12px 18px;
    border-radius: 24px;
    background: var(--page-surface-strong);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        0 16px 32px rgba(208, 110, 154, 0.12);

    &:is(.dark .search-box) {
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 16px 32px rgba(0, 0, 0, 0.22);
    }

    i {
        width: 20px;
        color: var(--primary-color);
        font-size: 18px;
    }

    input {
        min-width: 0;
        border: none;
        background: transparent;
        font-size: 16px;
        color: var(--text-color);

        &::placeholder {
            color: rgba(51, 51, 51, 0.42);
        }

        .dark &::placeholder {
            color: rgba(255, 255, 255, 0.36);
        }

        &:is(.dark input) {
            color: rgba(255, 255, 255, 0.94);
        }

        &:focus {
            outline: none;
        }
    }

    button {
        min-width: 112px;
        border: none;
        border-radius: 18px;
        padding: 12px 18px;
        background: linear-gradient(135deg, var(--page-accent-soft), var(--page-accent-strong)) !important;
        color: #fff !important;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 14px 26px var(--page-accent-shadow);
        transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 32px rgba(var(--primary-color-rgb), 0.34);
            opacity: 0.98;
        }
    }
}

.search-area {
    position: relative;
    width: 100%;
    z-index: 2;
}

.suggestion-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    z-index: 30;
    padding: 10px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 24px 50px rgba(132, 63, 92, 0.16);
    backdrop-filter: blur(20px);

    &:is(.dark .suggestion-dropdown) {
        background: rgba(24, 24, 30, 0.96);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 24px 50px rgba(0, 0, 0, 0.28);
    }
}

.suggestion-state {
    padding: 16px 14px;
    text-align: left;
    color: var(--page-text-muted);
    font-size: 13px;
}

.suggestion-item {
    width: 100%;
    border: 1px solid transparent !important;
    border-radius: 16px;
    padding: 12px 14px;
    background: transparent !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    &:hover,
    &.active {
        transform: translateX(4px);
        background: rgba(var(--primary-color-rgb), 0.08) !important;
        border-color: rgba(var(--primary-color-rgb), 0.18) !important;
    }
}

.suggestion-main {
    min-width: 0;
    display: grid;
    gap: 4px;
}

.suggestion-keyword {
    color: var(--text-color);
    font-size: 14px;
    font-weight: 700;
    &:is(.dark .suggestion-keyword) {
        color: rgba(255, 255, 255, 0.94);
    }
}

.suggestion-reason {
    color: var(--page-text-muted);
    font-size: 12px;
    line-height: 1.4;
}

.quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.quick-tag {
    border: 1px solid rgba(var(--primary-color-rgb), 0.14) !important;
    border-radius: 999px;
    padding: 9px 14px;
    background: rgba(255, 255, 255, 0.75) !important;
    color: var(--primary-color) !important;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease;

    &:is(.dark .quick-tag) {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(var(--primary-color-rgb), 0.2) !important;
        color: rgba(255, 255, 255, 0.88) !important;
    }

    &:hover {
        transform: translateY(-2px);
        background: rgba(var(--primary-color-rgb), 0.12) !important;
        border-color: rgba(var(--primary-color-rgb), 0.26) !important;
    }
}

.status-card {
    width: min(1080px, 100%);
    margin: 0 auto;
    padding: 24px 22px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-color);
}

.boards-layout {
    width: min(1080px, 100%);
    margin: 0 auto;
    display: grid;
    gap: 16px;
}

.boards-shell {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 16px;
    padding: 16px;
    border-radius: 30px;
    align-items: start;
}

.switchable-board-panel {
    min-width: 0;
    display: grid;
    gap: 14px;
}

.side-board-switcher {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}

.switcher-button {
    min-width: 0;
    min-height: 48px;
    border: 1px solid transparent !important;
    border-radius: 18px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.76) !important;
    color: var(--text-color) !important;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
    transition: transform 0.22s ease, border-color 0.22s ease, background-color 0.22s ease, color 0.22s ease;

    &:is(.dark .switcher-button) {
        background: rgba(255, 255, 255, 0.05) !important;
        color: rgba(255, 255, 255, 0.88) !important;
    }

    &:hover {
        transform: translateX(4px);
        background: rgba(var(--primary-color-rgb), 0.1) !important;
        border-color: var(--page-line-strong) !important;
    }

    &.active {
        background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.16), rgba(255, 255, 255, 0.88)) !important;
        color: var(--primary-color) !important;
        border-color: rgba(var(--primary-color-rgb), 0.26) !important;
        box-shadow: 0 12px 24px rgba(var(--primary-color-rgb), 0.12);

        &:is(.dark .switcher-button.active) {
            background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.28), rgba(255, 255, 255, 0.08)) !important;
            color: #fff !important;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
        }
    }
}

.board-card {
    border-radius: 24px;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(var(--primary-color-rgb), 0.08));

    &:is(.dark .board-card) {
        background: linear-gradient(160deg, rgba(30, 30, 36, 0.96), rgba(var(--primary-color-rgb), 0.14));
    }
}

.fixed-board {
    min-width: 0;
}

.board-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    margin-left: 10px;

    h2 {
        margin: 10px 0 0;
        font-size: 26px;
        color: var(--text-color);
        line-height: 1.1;

        &:is(.dark .board-header h2) {
            color: rgba(255, 255, 255, 0.94);
        }
    }
}

.rank-list {
    display: grid;
    gap: 10px;
}

.compact-rank-list {
    max-height: 560px;
    overflow-y: auto;
    padding: 6px;
}

.compact-rank-list::-webkit-scrollbar {
    width: 6px;
}

.compact-rank-list::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(var(--primary-color-rgb), 0.28);
}

.rank-item {
    width: 100%;
    border: 1px solid transparent !important;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding: 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.82) !important;
    cursor: pointer;
    text-align: left;
    transition: transform 0.22s ease, border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;

    &:is(.dark .rank-item) {
        background: rgba(255, 255, 255, 0.05) !important;
    }

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(var(--primary-color-rgb), 0.18) !important;
        background: rgba(var(--primary-color-rgb), 0.08) !important;
        box-shadow: 0 14px 28px rgba(208, 110, 154, 0.12);

        .dark & {
            box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
        }
    }
}

.rank-index {
    width: 34px;
    height: 34px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-color);
    font-weight: 800;
    font-size: 13px;

    &.top {
        background: linear-gradient(135deg, var(--page-accent-soft), var(--page-accent-strong));
        color: #fff;
    }
}

.rank-info {
    display: grid;
    gap: 4px;
    min-width: 0;
}

.rank-keyword {
    color: var(--text-color);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;

    &:is(.dark .rank-keyword) {
        color: rgba(255, 255, 255, 0.94);
    }
}

.rank-meta {
    color: var(--page-text-muted);
    font-size: 12px;
    line-height: 1.4;
}

.empty-board {
    min-height: 240px;
    display: flex;
    flex-direction: column;
}

@media (max-width: 960px) {
    .boards-shell {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .recommended-search-page {
        padding: 20px 14px 34px;
    }

    .search-panel,
    .boards-shell {
        padding: 12px;
        border-radius: 24px;
    }

    .board-card,
    .status-card {
        padding: 22px 18px;
        border-radius: 22px;
    }

    .search-box {
        grid-template-columns: 1fr;
        padding: 14px;

        i {
            display: none;
        }

        button {
            width: 100%;
        }
    }

    .board-header {
        flex-direction: column;
    }

    .side-board-switcher {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
