import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from 'vuex'

//member
import MemberView from '@/views/member/MemberView.vue'
import LoginView from '@/views/member/LoginView.vue'
import SignupView from '@/views/member/SignupView.vue'
import ResetPasswordView from '@/views/member/ResetPasswordView.vue'
import LineCallback from '@/views/member/LineCallbackView.vue'

//dashboard
import Dashboard from '@/views/dashboard/DashboardView.vue'
import Overview from '@/views/dashboard/OverviewView.vue'
import Schedule from '@/views/dashboard/ScheduleView.vue'
import Setting from '@/views/dashboard/SettingView.vue'

//test
import TestView from '@/views/test/TestView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requireLogin: true
    },
    children: [
      {
        path: '',
        name: 'Overview',
        component: Overview,
        meta: {
          requireLogin: true
        }
      },
      {
        path: 'schedule',
        name: 'Schedule',
        component: Schedule,
        meta: {
          requireLogin: true
        }
      },
      {
        path: 'setting',
        name: 'Setting',
        component: Setting,
        meta: {
          requireLogin: true
        }
      }
    ]
  },
  {
    path: '/member',
    name: 'Member',
    component: MemberView,
    redirect: '/member/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: {
          requireLogin: false
        }
      },
      {
        path: 'signup',
        name: 'Signup',
        component: SignupView,
        meta: {
          requireLogin: false
        }
      },
      {
        path: 'reset',
        name: 'ResetPassword',
        component: ResetPasswordView,
        meta: {
          requireLogin: false
        }
      },
      {
        path: 'line-callback',
        name: 'LineCallback',
        component: LineCallback,
        meta: {
          requireLogin: false
        }
      }
    ]
  },
  {
    path: '/test',
    name: 'Test',
    component: TestView,
    meta: {
      requireLogin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requireLogin = to.meta.requireLogin
  const store = useStore()
  const userToken = store.getters['user/getUserToken']
  if (to.name === 'LineCallback') {
    next()
    return
  }
  if (requireLogin) {
    if (userToken) {
      next()
    } else {
      next('/member/login')
    }
  } else {
    if (userToken) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
