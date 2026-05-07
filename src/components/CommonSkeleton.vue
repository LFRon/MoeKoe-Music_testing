<template>
    <div v-if="variant === 'song-list'" class="skeleton-song-list">
        <div v-for="index in count" :key="index" class="song-item">
            <div class="cover"></div>
            <div class="song-info">
                <div class="line"></div>
                <div class="line short"></div>
            </div>
            <div class="song-meta">
                <div class="line tiny"></div>
                <div class="line tiny"></div>
            </div>
        </div>
    </div>

    <div v-else-if="variant === 'search-grid'" class="skeleton-search-grid">
        <div v-for="index in count" :key="index" class="search-grid-card">
            <div :class="['grid-cover', { avatar }]"></div>
            <div class="line"></div>
            <div v-if="!avatar" class="line short"></div>
        </div>
    </div>

    <div v-else-if="variant === 'compact-grid'" class="skeleton-compact-grid">
        <div v-for="index in count" :key="index" class="compact-item">
            <div class="compact-cover"></div>
            <div class="compact-info">
                <div class="line"></div>
                <div class="line short"></div>
            </div>
        </div>
    </div>

    <div v-else class="skeleton-card-grid">
        <div v-for="index in count" :key="index" class="card">
            <div class="card-cover"></div>
            <div class="card-info">
                <div class="card-title"></div>
                <div class="card-text"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    variant: {
        type: String,
        default: 'card-grid'
    },
    count: {
        type: Number,
        default: 10
    },
    avatar: {
        type: Boolean,
        default: false
    }
});
</script>

<style lang="scss" scoped>
@keyframes shimmer {
    0% {
        background-position: -468px 0;
    }

    100% {
        background-position: 468px 0;
    }
}

.line,
.cover,
.grid-cover,
.compact-cover,
.card-cover,
.card-title,
.card-text {
    background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
    background-size: 800px 104px;
    animation: shimmer 1.5s linear infinite forwards;
}

.skeleton-card-grid {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: space-evenly;
}

.card {
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 10px;
    width: 200px;
    text-align: center;
    height: 250px;
}

.card-cover {
    width: 100%;
    height: 200px;
    border-radius: 8px;
}

.card-info {
    margin-top: 10px;
}

.card-title {
    width: 60%;
    height: 16px;
    margin: 10px auto;
    border-radius: 4px;
}

.card-text {
    width: 80%;
    height: 12px;
    margin: 5px auto;
    border-radius: 4px;
}

.skeleton-song-list {
    width: 100%;
}

.song-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 5px;
    gap: 10px;
    margin-bottom: 15px;
}

.cover {
    width: 50px;
    height: 50px;
    border-radius: 5px;
}

.song-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.song-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 120px;
    align-items: flex-end;
}

.line {
    height: 16px;
    border-radius: 3px;
    width: 100%;
    margin-top: 5px;

    &.short {
        width: 60%;
    }

    &.tiny {
        width: 40%;
        height: 12px;
    }
}

.skeleton-search-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
}

.skeleton-compact-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 10px;
}

.compact-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 250px;
    height: 68px;
    padding-left: 10px;
    border-radius: 10px;
    background-color: #f0f0f0;
}

.compact-cover {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 10px;
}

.compact-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 190px;
    flex: 1;
}

.search-grid-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.grid-cover {
    width: 150px;
    height: 150px;
    border-radius: 8px;
    margin: 0 auto 10px;

    &.avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
    }
}
</style>
