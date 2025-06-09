<template>
  <div class="submitted-applications-page">
    <h2 class="title">Submitted Applications</h2>

    <el-row :gutter="20">
      <el-col
        v-for="application in applications"
        :key="application.application_id"
        :xl="6" :lg="8" :md="12" :sm="24" :xs="24"
      >
        <!-- 🔁 Wrap card in a clickable div -->
        <div @click="goToDetail(application.application_id)" style="cursor: pointer">
          <StudentCardComponent
            :name="application.name"
            :status="application.intern_status ?? 1"
            :cv_link="application.cv_link"
            :linkedin_link="application.linkedin_link"
            :github_link="application.github_link"
            :portfolio_link="application.portfolio_link"
            :personal_statement="application.personal_statement"
            :internship_options="formatValue(application.internship_options)"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from 'vue';
import type { AxiosInstance } from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import StudentCardComponent from '@/components/StudentCardComponent.vue';

const axios = inject('$axios') as AxiosInstance;
const router = useRouter();
const authStore = useAuthStore();
const authKey = authStore.authKey;
const userId = authStore.uid;

const applications = ref<any[]>([]);

const formatValue = (val: any) => {
  if (!val) return '';
  try {
    if (typeof val === 'string') {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.join(', ');
    }
    if (Array.isArray(val)) return val.join(', ');
  } catch {
    // not JSON
  }
  return val;
};

// 🔁 Navigate to detail page when a card is clicked
const goToDetail = (id: number) => {
  router.push({ name: 'submittedStudentDetail', params: { id } });
};

onMounted(() => {
  axios({
    url: '/api/userSubmittedApplications',
    method: 'post',
    data: { user_id: userId },
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authKey
    }
  })
    .then(res => {
      if (res.data && Array.isArray(res.data.applications)) {
        applications.value = res.data.applications;
      }
    })
    .catch(err => {
      console.error('Error loading submitted applications:', err);
    });
});
</script>

<style scoped>
.submitted-applications-page {
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #1E5192;
  margin-bottom: 30px;
}
</style>
