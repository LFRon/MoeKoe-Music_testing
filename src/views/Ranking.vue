<template>
    <RankingContent :player-control="playerControl" />
</template>

<script setup>
import RankingContent from '../components/discover/RankingContent.vue';

defineProps({
    playerControl: Object
});
</script>
