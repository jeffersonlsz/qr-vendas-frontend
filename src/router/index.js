import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/lp',
            name: 'landing',
            component: LandingPage
        },
        {
            path: '/admin/qr',
            name: 'qr-generator',
            component: () => import('../views/QrGeneratorView.vue')
        },
        {
            path: '/',
            redirect: '/lp'
        },
        {
            path: '/leads',
            name: 'dashboard-leads',
            component: () => import('../views/LeadsDashboard.vue')
        }
    ]
})

export default router
