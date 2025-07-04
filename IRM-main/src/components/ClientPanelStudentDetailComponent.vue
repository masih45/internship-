<template>
  <div class="admin-panel-student-detail-comp">
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
        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Student Programme</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.programme_of_study }}</el-text>
          </div>
        </el-col>
        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Student ID</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.wintec_id }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Phone Number</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.phone_number }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Student Email</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.student_email }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Area of Study</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.area_of_study }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">First Preference for Placement</el-text>
          </div>
          <div>
            <el-text class="value" size="large">Internship</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Personal Email</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.personal_email }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Average Grade</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.average_grade }}</el-text>
          </div>
        </el-col>

        <el-col :span="8">
          <div>
            <el-text class="attribute" size="large">Second Preference for Placement</el-text>
          </div>
          <div>
            <el-text class="value" size="large">Industry Project</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Personal Statement</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.personal_statement }}</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Skills / Experience</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.skills }}</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Favourite Courses</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.favourite_courses }}.</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Two Tutors for Reference</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.reference }}</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Preferred Companies</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.preferred_companies }}</el-text>
          </div>
        </el-col>

        <el-col :span="24">
          <div>
            <el-text class="attribute" size="large">Internship Options</el-text>
          </div>
          <div>
            <el-text class="value" size="large">{{ student.internship_options }}</el-text>
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

const axios: AxiosInstance = inject('$axios') as AxiosInstance
const authStore = useAuthStore()
const route = useRoute()
const authKey = authStore.authKey
const application_id = route.params.id

const student = reactive({
  name: '',
  wintec_id: '',
  personal_email: '',
  student_email: '',
  phone_number: '',
  personal_statement: '',
  cv_link: '',
  linkedin_link: '',
  portfolio_link: '',
  github_link: '',
  average_grade: '',
  programme_of_study: '',
  area_of_study: '',
  internship_options: '',
  preferred_companies: '',
  first_preference: '',
  second_preference: '',
  skills: '',
  favourite_courses: '',
  reference: '',
  gender: '',
  intern_status: 3,
})

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
      } else {
        console.log('Response Error')
      }
    })
    .catch(err => {
      if (err.response) {
        console.error('Server Error:', err.response.status, err.response.data)
      } else if (err.request) {
        console.error('Network Error:', err.request)
      } else {
        console.error('Request Error:', err.message)
      }
    })
})
</script>

<style scoped>
.mt-1 {
  margin-top: 1rem;
}

.mt-3 {
  margin-top: 3rem;
}

.admin-panel-student-detail-comp {
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
  color: #0D99FF;
  font-weight: bold;
}

.value {
  color: #3A3541;
}

.el-col {
  margin-top: 2rem;
}
</style>
