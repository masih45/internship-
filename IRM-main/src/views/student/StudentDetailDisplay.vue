<template>
  <div class="student-detail-page">
    <StudentDetailComponent :studentId="id" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import StudentDetailComponent from '@/components/StudentAppliedPanelDetailComponent.vue';

const route = useRoute();
const id = ref(Number(route.params.id));
</script>
