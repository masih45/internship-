<template>
  <div class="container">
    <el-form
      :model="form"
      :rules="rules"
      ref="ruleFormRef"
      label-width="auto"
      class="form"
      :label-position="top"
      status-icon
    >
      <!-- Wintec Logo -->
      <div style="display: flex; justify-content: center;">
        <img
          src="@/assets/Logo/Industry Internship System Logo_Orange and Blue.svg"
          class="industry-internship-system-logo"
        />
      </div>

      <!-- Instruction text for password reset -->
      <el-form-item class="mt-1">
        <el-text class="email-reset-text">
          Enter the email you used to create your account so we can send you instructions on how to reset your password.
        </el-text>
      </el-form-item>

      <!-- Email input field -->
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="form.email"
          :prefix-icon="Message"
          clearable
          placeholder="id@student.wintec.ac.nz"
        />
      </el-form-item>

      <el-form-item class="mt-2" prop="recaptcha">
        <div id="recaptcha-container"></div>
      </el-form-item>

      <!-- Button to send password reset request -->
      <el-form-item>
        <el-button type="primary" @click="handleSendButton(ruleFormRef)">
          Reset password
        </el-button>
      </el-form-item>

      <!-- Button to navigate back to login -->
      <el-form-item>
        <el-button style="color: #FB9333;" @click="handleNavButton">
          Back to Login
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, onMounted } from 'vue'
import { ElMessage, type FormProps, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { Message } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { AxiosInstance } from 'axios'

const siteKey = '6LeLaAwrAAAAAIPhPnb-yiHkaOuUkzFhu0-VmT3u'

onMounted(() => {
  const tryRenderCaptcha = () => {
    if ((window as any).grecaptcha) {
      (window as any).grecaptcha.render('recaptcha-container', {
        sitekey: siteKey
      })
    } else {
      setTimeout(tryRenderCaptcha, 500)
    }
  }

  tryRenderCaptcha()
})

const axios: AxiosInstance = inject('$axios') as AxiosInstance
const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['loading'])
const ruleFormRef = ref<FormInstance>()

interface RuleForm {
  email: string
}

const form = reactive<RuleForm>({
  email: ''
})

const rules = reactive<FormRules<RuleForm>>({
  email: [
    { required: true, message: 'This field is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email address', trigger: 'blur' }
  ]
})

const top = ref<FormProps['labelPosition']>('top')

// Loading trigger (emits to parent if used)
const triggerLoading = (value: boolean) => {
  emit('loading', value)
}

const handleSendButton = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      const recaptchaToken = (window as any).grecaptcha?.getResponse()
      if (!recaptchaToken) {
        ElMessage.error('Please verify the CAPTCHA.')
        return
      }

      triggerLoading(true)
      axios({
        url: '/api/forgotPassRequest',
        method: 'post',
        data: {
          email: form.email,
          recaptcha: recaptchaToken
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          authStore.setServerRef(res.data.server_ref, form.email)
          ElMessage.success(res.data.description)
          router.push('/resetPassVerification')
          triggerLoading(false)
          ;(window as any).grecaptcha?.reset()
        })
        .catch((error) => {
          console.log(error)
          if (error.response && error.response.data) {
            ElMessage.error(error.response.data.error)
          } else {
            ElMessage.error('Network error or server not responding. Please try again later.')
          }
          triggerLoading(false)
          ;(window as any).grecaptcha?.reset()
        })
    } else {
      triggerLoading(false)
    }
  })
}

const handleNavButton = () => {
  router.push('/login')
}
</script>

<style scoped>
.mt-1 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 2rem;
}

.el-button {
  width: 100%;
}

.email-reset-text {
  color: #6C6B6B;
  font-weight: bold;
}

/* Phone */
@media screen and (max-width: 768px) {
  .form {
    width: 280px;
    height: 460px;
    border-radius: 24px;
    padding: 1rem;
    background-color: rgba(250, 250, 250, 0.8);
  }

  .industry-internship-system-logo {
    height: 120px;
  }

  .email-reset-text {
    font-size: 12px;
  }
}

/* Tablet */
@media screen and (max-width: 992px) and (min-width: 768px) {
  .form {
    width: 480px;
    height: 500px;
    border-radius: 24px;
    padding: 2rem;
    background-color: rgba(250, 250, 250, 0.8);
  }

  .industry-internship-system-logo {
    height: 150px;
  }

  .email-reset-text {
    font-size: 16px;
  }
}

/* Computer */
@media screen and (min-width: 992px) {
  .form {
    width: 480px;
    height: 600px;
    border-radius: 24px;
    padding: 2rem;
    background-color: rgba(250, 250, 250, 0.8);
  }

  .industry-internship-system-logo {
    height: 150px;
  }

  .email-reset-text {
    font-size: 16px;
  }
}
</style>
