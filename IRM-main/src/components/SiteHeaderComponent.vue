<template>
  <header>
    <div>
      <img src="@/assets/Logo/IIS and Wintec logo_blue.svg" class="logo" />
    </div>

    <div class="nav">

      <div class="nav-links">

        <div class="link-item" @click="handleRouter('/student/application')" @mouseover="hover = 'application'" @mouseleave="hover = ''">
          <div class="link" :class="{ active: hover === 'application' || currentPath === '/student/application'}">
            <img src="@/assets/HeaderIcon/application_icon_white.svg" class="icon" v-show="hover === 'application' || currentPath === '/student/application'" />
            <img src="@/assets/HeaderIcon/application_icon_blue.svg" class="icon" v-show="currentPath !== '/student/application' && hover !== 'application'" />
            <span>Application</span>
          </div>
        </div>
        <div class="link-item" @click="handleRouter('/student/submitted')" @mouseover="hover = 'submitted'" @mouseleave="hover = ''">
          <div class="link" :class="{ active: hover === 'submitted' || currentPath.startsWith('/student/submitted') }">
            <img src="@/assets/HeaderIcon/submitted.svg" class="icon" v-show="hover === 'submitted' || currentPath === '/student/submitted'" />
            <img src="@/assets/HeaderIcon/submitted.svg" class="icon" v-show="currentPath !== '/student/submitted' && hover !== 'submitted'" />
            <span>Applied Applications</span>
        </div>
      </div>

      <div class="link-item" @click="handleRouter('/student/contact-us')" @mouseover="hover = 'contact-us'" @mouseleave="hover = ''">
      <div class="link" :class="{ active: hover === 'contact-us' || currentPath.startsWith('/student/contact-us') }">
        <img src="@/assets/HeaderIcon/contact_us_icon_white.svg" class="icon" v-show="hover === 'contact-us'" />
        <img src="@/assets/HeaderIcon/contact_us_icon_blue.svg" class="icon" v-show="hover !== 'contact-us'" />
        <span>Contact Us</span>
      </div>
    </div>

        <div v-if="isLoggedIn">
          <div class="link-item" @mouseover="showMenu" @mouseout="hideMenu">
            <div class="link">
              <img src="@/assets/HeaderIcon/sign_in_icon_blue.svg" class="icon" />
              <span>{{ username }}</span>
            </div>
            <div class="sub-menu" v-show="showSubMenu">
              <div class="sub-menu-item" @click="handleRouter('/student/home')">Home</div>
              <div class="sub-menu-item" @click="handleRouter('/student/application')">Application</div>
              <div class="sub-menu-item" @click="handleRouter('/student/submitted')">Applied Applications</div>
              <div class="sub-menu-item" @click="handleRouter('/student/profile')">Profile</div>
              <div class="sub-menu-divider"></div>
              <div class="sub-menu-item" @click="handleRouter('/student/contact-us')">Contact Us</div>
              <div class="sub-menu-divider"></div>
              <div class="sub-menu-item logout" @click="logOut">Log Out</div>
            </div>
          </div>
        </div>
        <div class="link-item active" v-else @click="handleRouter('/login')">
          <div class="link">
            <img src="@/assets/HeaderIcon/sign_in_icon_white.svg" class="icon" />
            <span>Sign In</span>
          </div>
        </div>
      </div>

    </div>

  </header>

</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.authKey)
const username = computed(() => authStore.name)
const showSubMenu = ref(false)
const currentPath = ref('')
const hover = ref('')

const handleRouter = (path: string) => {
  router.push(path)
}

const logOut = () => {
  authStore.clearAuthData()
  window.location.reload()
}

const hideMenu = () => {
  showSubMenu.value = false
}

const showMenu = () => {
  showSubMenu.value = true
  console.log(currentPath)
}

watch(route, (newRoute) => {
  currentPath.value = newRoute.path
})

onMounted(() => {
  currentPath.value = route.path
})

</script>

<style scoped>
header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  border-top: #1E5192 15px solid;
}

.nav {
  display: flex;
}

/* .el-text {
  margin-left: 15px;
} */

.logo {
  height: 80px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.link-item {
  position: relative;
  color: #0052A5;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
}

.link-item .icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
}

.link-item:hover {
  cursor: pointer;
}

.link-item>span:hover {
  color: #7092bd;
}

.link {
  display: flex;
  align-items: center;
}

.active {
  display: flex;
  align-items: center;
  background-color: #ff6600;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.active .icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
}

.sub-menu {
  position: absolute;
  top: 100%;
  left: -50px;
  z-index: 1000;
  width: 160px;
  border: rgba(0, 0, 0, 0.12) 1px solid;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-sizing: border-box;
}

.sub-menu>div {
  padding-left: 15px;
}

.sub-menu>div:hover {
  color: rgb(79, 166, 255);
  background-color: rgb(236, 245, 253);
}


/* Phone */
@media screen and (max-width: 768px) {
  span {
    font-size: 12px;
  }

  .logo {
    height: 40px;
    width: 40px;
  }
}

/* Tablet */
@media screen and (max-width: 992px) and (min-width: 768px) {
  span {
    font-size: 18px;
  }

  .logo {
    height: 80px;
  }
}

/* Computer */
@media screen and (min-width: 992px) {
  span {
    font-size: 20px;
  }

  .logo {
    height: 80px;
  }

}
.sub-menu {
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  border-radius: 8px;
  min-width: 180px;
  font-size: 14px;
}

.sub-menu-label {
  font-weight: bold;
  padding: 6px 16px;
  color: #1e5192;
  font-size: 13px;
}

.sub-menu-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.sub-menu-item:hover {
  background-color: #f2f6fc;
  color: #1e5192;
}

.sub-menu-divider {
  border-top: 1px solid #e0e0e0;
  margin: 8px 0;
}

.logout {
  color: #d32f2f;
  font-weight: bold;
}

</style>