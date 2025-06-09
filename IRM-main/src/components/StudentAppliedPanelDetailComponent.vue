<template>
<SiteHeaderComponent />
  <div class="student-panel-student-detail-comp">
    <div class="header-section">
      <div class="header-text">
        <el-text>{{ student.name }}</el-text>
      </div>

      <div class="header-logo">
        <img src="@/assets/SocialIcon/cv_icon_orange.svg" @click="navigate(student.cv_link)" />
        <img src="@/assets/SocialIcon/linkedin_icon_orange.svg" @click="navigate(student.linkedin_link)" />
        <img src="@/assets/SocialIcon/github_icon_orange.svg" @click="navigate(student.github_link)" />
        <img src="@/assets/SocialIcon/portfolio_icon_orange.svg" @click="navigate(student.portfolio_link)" />
      </div>
    </div>

    <div>
      <el-row :gutter="20">
        <!-- Short fields in 3 columns -->
        <el-col :span="8" v-for="(label, key) in shortFields" :key="key">
            <div>
                <div>
                    <el-text class="attribute" size="large">{{ label }}:</el-text>
                </div>
                <div>
                    <el-text class="value" size="large">{{ student[key] }}</el-text>
                </div>
            </div>
        </el-col>
        <!-- Long fields full width -->
        <el-col :span="24" v-for="(label, key) in longFields" :key="key">
    <div>
        <div>
            <el-text class="attribute" size="large">{{ label }}:</el-text>
        </div>
        <div>
            <el-text class="value" size="large">{{ student[key] }}</el-text>
        </div>
    </div>
    </el-col>

      </el-row>
    </div>

    <div class="footer-section mt-1">
      <img src="@/assets/SocialIcon/web_development_icon.svg">
      <img src="@/assets/SocialIcon/business_analysis_icon.svg">
      <img src="@/assets/SocialIcon/design_icon.svg">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, inject, onMounted } from 'vue'
import type { AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import SiteHeaderComponent from '@/components/SiteHeaderComponent.vue'

const axios: AxiosInstance = inject('$axios') as AxiosInstance
const authStore = useAuthStore()
const route = useRoute()
const authKey = authStore.authKey
const application_id = route.params.id

const student = reactive<any>({})

const shortFields: Record<string, string> = {
  wintec_id: 'Student ID',
  programme_of_study: 'Student Programme',
  phone_number: 'Phone Number',
  student_email: 'Student Email',
  area_of_study: 'Area of Study',
  personal_email: 'Personal Email',
  average_grade: 'Average Grade',
  first_preference: 'First Preference',
  second_preference: 'Second Preference'
}

const longFields: Record<string, string> = {
  personal_statement: 'Personal Statement',
  skills: 'Skills / Experience',
  favourite_courses: 'Favourite Courses',
  reference: 'Two Tutors for Reference',
  preferred_companies: 'Preferred Companies',
  internship_options: 'Internship Options'
}

const navigate = (url: string) => {
  window.open(url, '_blank')
}

onMounted(() => {
  axios({
    url: '/api/userProfileByApplicationId',
    method: 'post',
    data: {
      application_id: application_id,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authKey
    }
  })
    .then(res => {
      if (res.data && res.data.student) {
        const s = res.data.student
        Object.assign(student, {
          ...s,
          preferred_companies: Array.isArray(s.preferred_companies)
            ? s.preferred_companies.join(', ')
            : (JSON.parse(s.preferred_companies || '[]') || []).join(', '),
          internship_options: Array.isArray(s.internship_options)
            ? s.internship_options.join(', ')
            : (JSON.parse(s.internship_options || '[]') || []).join(', ')
        })
      }
    })
    .catch(console.error)
})
</script>

<style scoped>
.mt-1 {
  margin-top: 1rem;
}

.student-panel-student-detail-comp {
  background-color: white;
  border: 2px #FE6601 solid;
  border-radius: 24px;
  padding: 15px 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
}

.header-text>.el-text:first-child {
  font-size: 32px;
  font-weight: bold;
  color: black;
}

.header-logo>img {
  margin: 0 15px;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

.footer-section>img {
  margin: 10px 20px 0 0;
  width: 40px;
  height: 40px;
}

.attribute {
  color: #ff8c00;
  font-weight: bold;
}

.value {
  color: #3A3541;
}

.el-col {
  margin-top: 2rem;
}
</style>
