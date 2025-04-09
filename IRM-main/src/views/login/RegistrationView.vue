<template>
  <div class="container">

    <el-form :model="form" :rules="rules" ref="ruleFormRef" label-width="auto" class="form" :label-position="top"
      status-icon>

      <!-- Wintec Logo -->
      <div style="display: flex; justify-content: center;">
        <img src="@/assets/Logo/Industry Internship System Logo_Orange and Blue.svg" class="industry-internship-system-logo" />
      </div>

      <!-- Form item for selecting the user role -->
      <el-form-item prop="role" class="mt-2" @change="handleChange">
        <template #label>Role <span class="gold-asterisk">*</span></template>
        <el-radio-group v-model="form.role">
          <el-radio value="Student" size="large" class="radio">Student</el-radio>
          <el-radio value="Industry" size="large" class="radio">Industry</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- Form item for email input -->
      <el-form-item prop="email" class="mt-2">
        <template #label>Email <span class="gold-asterisk">*</span></template>
        <el-input v-model="form.email" clearable placeholder="id@student.wintec.ac.nz" v-if="autoComplete"
          @blur="handleBlur" data-test="username-field" />
        <el-input v-model="form.email" clearable placeholder="mail@example.com" data-test="username-field" v-else />
      </el-form-item>

      <!-- Form item for password input with strength meter -->
      <el-form-item prop="password">
        <template #label>Password <span class="gold-asterisk">*</span></template>
        <el-input
          v-model="form.password"
          type="password"
          clearable
          placeholder="******"
          show-password
          @input="checkStrength"
          data-test="password-field"
        />
        <el-progress
          :percentage="strengthPercent"
          :status="progressStatus"
          style="margin-top: 5px"
        />
        <div style="margin-top: 5px;">Strength: {{ strengthLabel }}</div>
      </el-form-item>

      <!-- Confirm Password -->
      <el-form-item prop="confirmedPassword">
        <template #label>Confirm Password <span class="gold-asterisk">*</span></template>
        <el-input v-model="form.confirmedPassword" type="password" clearable placeholder="******" show-password 
          data-test="confirm-password-field" />
      </el-form-item>

      <!-- Submit button -->
      <el-form-item>
        <el-button type="primary" style="margin: 0 auto;" @click="handleRegistration(ruleFormRef)">Create
          Account</el-button>
      </el-form-item>

      <!-- Login link -->
      <div style="text-align: center;">
        <el-text size="small">Already have an account? <RouterLink to="/login">Log in</RouterLink> </el-text>
      </div>

    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { FormProps, FormRules, FormInstance } from 'element-plus'
import type { AxiosInstance } from 'axios'

// Inject Axios
const axios: AxiosInstance = inject('$axios') as AxiosInstance
const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['loading'])

// Form model interface
interface RuleForm {
  email: string,
  password: string,
  confirmedPassword: string,
  role: string,
  currentTime: Date
}

const ruleFormRef = ref<FormInstance>()

const triggerLoading = (value: boolean) => {
  emit('loading', value)
}

// Form model
const form = reactive<RuleForm>({
  email: '',
  password: '',
  confirmedPassword: '',
  role: 'Student',
  currentTime: new Date()
})

// Password strength meter logic
const strengthPercent = ref(0)
const strengthLabel = ref('Too weak')
const progressStatus = ref<'success' | 'warning' | 'exception'>('exception')

const checkStrength = () => {
  const value = form.password
  let score = 0

  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[a-z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  switch (score) {
    case 0:
    case 1:
      strengthPercent.value = 20
      strengthLabel.value = 'Too weak'
      progressStatus.value = 'exception'
      break
    case 2:
    case 3:
      strengthPercent.value = 50
      strengthLabel.value = 'Weak'
      progressStatus.value = 'warning'
      break
    case 4:
      strengthPercent.value = 75
      strengthLabel.value = 'Moderate'
      progressStatus.value = 'success'
      break
    case 5:
      strengthPercent.value = 100
      strengthLabel.value = 'Strong'
      progressStatus.value = 'success'
      break
  }
}

// Password validation
const passwordValidation = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('This field is required'))

  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)

  if (value.length < 8) {
    callback(new Error('Password must be at least 8 characters long.'))
  } else if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    callback(new Error('Password must include uppercase, lowercase letters, and numbers.'))
  } else {
    callback()
  }
}

// Confirm password match
const confirmPasswordValidation = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('Passwords do not match.'))
  } else {
    callback()
  }
}

// Validation rules
const rules = reactive<FormRules<RuleForm>>({
  email: [
    { required: true, message: 'This field is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'This field is required', trigger: 'blur' },
    { validator: passwordValidation, trigger: 'blur' }
  ],
  confirmedPassword: [
    { required: true, message: 'This field is required', trigger: 'blur' },
    { validator: confirmPasswordValidation, trigger: 'blur' }
  ],
  role: [
    { required: true, message: 'This field is required', trigger: 'blur' }
  ]
})

const top = ref<FormProps['labelPosition']>('top')
const autoComplete = ref(true)

const handleChange = () => {
  autoComplete.value = form.role === "Student"
}

const handleBlur = () => {
  const correctDomain = '@student.wintec.ac.nz'
  if (!form.email.endsWith(correctDomain)) {
    form.email = form.email.includes('@')
      ? form.email.split('@')[0] + correctDomain
      : form.email + correctDomain
  }
}

const handleRegistration = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      triggerLoading(true)
      axios({
        url: '/api/registration',
        method: 'post',
        data: {
          email: form.email,
          password: form.password,
          type: form.role,
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        ElMessage.success(res.data.description)
        triggerLoading(false)
        authStore.setServerRef(res.data.server_ref, form.email)
        router.push('/emailVerification')
      }).catch(error => {
        console.log(error)
        if (error.response?.data) {
          ElMessage.error(error.response.data.error)
        } else {
          ElMessage.error('Network error or server not responding. Please try again later.')
        }
        triggerLoading(false)
      })
    } else {
      console.log(fields)
      triggerLoading(false)
      ElMessage.error("Submit Failure. Please check the error message down input fields")
    }
  })
}
</script>

<style scoped>
:deep(.el-form-item__label::before) {
  content: "" !important;
  display: none !important;
}
.gold-asterisk {
  color: #FB9333;
  font-weight: bold;
  margin-left: 4px;
}
a {
  text-decoration: none;
  color: #FB9333;
}
button {
  width: 100%;
}
.el-radio-group {
  width: 100%;
}
.el-radio {
  display: flex;
  justify-content: center;
}
.mt-2 {
  margin-top: 2rem;
}
.mt-3 {
  margin-top: 3rem;
}

/* Responsive styles */
@media screen and (max-width: 768px) {
  .form {
    width: 280px;
    height: 620px;
    border-radius: 24px;
    padding: 1rem;
    background-color: rgba(250, 250, 250, 0.8);
  }
  .industry-internship-system-logo {
    height: 120px;
  }
  .radio {
    flex: 0 0 43%;
    border-radius: 9px;
    background-color: white;
  }
}
@media screen and (max-width: 992px) and (min-width: 768px) {
  .form {
    width: 480px;
    height: 640px;
    border-radius: 24px;
    padding: 2rem;
    background-color: rgba(250, 250, 250, 0.8);
  }
  .industry-internship-system-logo {
    height: 150px;
  }
  .radio {
    flex: 0 0 45%;
    border-radius: 9px;
    background-color: white;
  }
}
@media screen and (min-width: 992px) {
  .form {
    width: 480px;
    height: 640px;
    border-radius: 24px;
    padding: 2rem;
    background-color: rgba(250, 250, 250, 0.8);
  }
  .industry-internship-system-logo {
    height: 150px;
  }
  .radio {
    flex: 0 0 45%;
    border-radius: 9px;
    background-color: white;
  }
}
</style>

