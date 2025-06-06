<template>
  <div class="container">
    <!-- Breadcrumb navigation -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/adminLayout' }">Homepage</el-breadcrumb-item>
        <el-breadcrumb-item>All Applications</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- Filter and search section -->
    <div class="select-section mt-3">
      <div>
        <el-select v-model="programme" placeholder="Programme" size="large" class="select">
          <el-option v-for="item in programmes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="specialisation" placeholder="Specialisation" size="large" class="select">
          <el-option v-for="item in specialisations" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="status" placeholder="Internship Status" size="large" class="select">
          <el-option v-for="item in internshipStatus" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <div>
        <el-input v-model="input" size="large" placeholder="Search by name or email" :prefix-icon="Search" />
      </div>
    </div>

    <!-- Card grid for student applications -->
    <div class="card-section mt-3">
      <el-row :gutter="20">
        <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24" v-for="item in filteredStudents" :key="item.student_id">
          <CandidateCard
            class="card"
            :name="item.name"
            :status="item.intern_status"
            :cv_link="item.cv_link"
            :linkedin_link="item.linkedin_link"
            :github_link="item.github_link"
            :portfolio_link="item.portfolio_link"
            :personal_statement="item.personal_statement"
            :internship_options="item.internship_options"
            @click="navigate(item.application_id)"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Search } from '@element-plus/icons-vue'
import type { AxiosInstance } from 'axios'
import { useRouter } from 'vue-router'
import CandidateCard from '@/components/StudentCardComponent.vue'

const axios: AxiosInstance = inject('$axios') as AxiosInstance
const authStore = useAuthStore()
const authKey = authStore.authKey
const router = useRouter()

const programme = ref('')
const specialisation = ref('')
const status = ref('')
const input = ref('')

const students = ref<any[]>([])

onMounted(() => {
  axios({
    url: '/api/allApplications',
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + authKey
    }
  }).then(res => {
    if (res.data && res.data.applications) {
      students.value = res.data.applications
    }
  }).catch(err => console.error(err))
})

const programmes = [
  { value: '', label: 'All Programmes' },
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Postgraduate', label: 'Postgraduate' },
  { value: 'Master', label: 'Master' }
]

const specialisations = [
  { value: '', label: 'All Specialisations' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Networking Engineering', label: 'Networking Engineering' },
  { value: 'Database or Data Analytics', label: 'Database or Data Analytics' }
]

const internshipStatus = [
  { value: '', label: 'All Statuses' },
  { value: 0, label: 'For Review' },
  { value: 1, label: 'Available' },
  { value: 2, label: 'Placed' }
]

const navigate = (application_id: number) => {
  router.push({ name: 'candidateDetails', params: { id: application_id } })
}

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchProgramme = !programme.value || student.programme_of_study === programme.value
    const matchSpecialisation = !specialisation.value || student.area_of_study === specialisation.value
    const matchStatus = status.value === '' || student.intern_status === status.value
    const matchInput = !input.value || student.name.toLowerCase().includes(input.value.toLowerCase()) || student.student_email?.toLowerCase().includes(input.value.toLowerCase())
    return matchProgramme && matchSpecialisation && matchStatus && matchInput
  })
})
</script>

<style scoped>
.container {
  background-color: white;
  height: 100%;
  padding-bottom: 2rem;
}

.select-section {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.select {
  width: 240px;
  margin-right: 20px;
  margin-bottom: 10px;
}

.mt-3 {
  margin-top: 3rem;
}

.card-section {
  margin-top: 2rem;
  padding-left: 10px;
  padding-right: 10px;
}

.card {
  width: 110%;
  height: auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  word-wrap: break-word;
  box-sizing: border-box;
}
.card:hover {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
}
</style>
