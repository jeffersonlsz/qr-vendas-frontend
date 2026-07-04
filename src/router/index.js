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
            path: '/solicitacoes',
            name: 'dashboard-solicitacoes',
            component: () => import('../views/SolicitacoesDashboard.vue')
        }
    ]
})

export default router
