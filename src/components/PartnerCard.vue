<script setup>
import { ref, computed } from 'vue';
import CartazModal from './CartazModal.vue';
import { useAlert } from '@/services/useAlert';

const props = defineProps({
  partner: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['generate', 'download', 'view-solicitacoes', 'associate-card']);

const { showAlert } = useAlert();

const isCartazModalOpen = ref(false);
const selectedPartnerForCartaz = ref(null);

const isAvailable = computed(() => props.partner.status_cartao !== 'EM_USO');
const cardStatus = computed(() => isAvailable.value ? 'Disponível' : 'Em uso');
const cardStatusClass = computed(() => isAvailable.value ? 'status-available' : 'status-in-use');
const isPartnerDataValidForPoster = computed(() => !!props.partner.codigo_cartao);

const handleGerarCartaz = () => {
  if (!props.partner.codigo_cartao) {
    showAlert(
      'Atenção',
      'Este parceiro não tem um código de cartão associado para gerar o cartaz.',
      'warning'
    );
    return;
  }
  selectedPartnerForCartaz.value = props.partner;
  isCartazModalOpen.value = true;
};

const closeCartazModal = () => {
  isCartazModalOpen.value = false;
  selectedPartnerForCartaz.value = null;
};
</script>

<template>
  <CartazModal 
    :open="isCartazModalOpen" 
    :partner="selectedPartnerForCartaz"
    @close="closeCartazModal()"
  />

  <div class="partner-card">
    <div class="card-header">
      <div class="avatar">
        {{ partner.nome.charAt(0).toUpperCase() }}
      </div>
      <div class="partner-info">
        <h3 class="name">
          {{ partner.nome }}
          <span :class="['status-badge', cardStatusClass]">{{ cardStatus }}</span>
        </h3>
        <!-- <span v-if="partner.codigo_cartao" class="code-highlight">{{ partner.codigo_cartao }}</span> -->
        <span class="badge" :class="{'secondary-id': partner.codigo_cartao}">{{ partner.id.slice(5).toUpperCase() }}</span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="contact-info" v-if="!isAvailable">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <span>{{ partner.telefone }}</span>
      </div>

      <!-- Métricas de Desempenho (Mini Dashboard) -->
      <div v-if="!isAvailable">
        <div class="partner-stats" v-if="partner.stats">
          <div class="stat-item">
            <span class="stat-value">{{ partner.stats.total_solicitacoes || 0 }}</span>
            <span class="stat-label">Solic.</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ partner.stats.total_convertidos || 0 }}</span>
            <span class="stat-label">Conv.</span>
          </div>
        </div>
        <div class="partner-stats-skeleton" v-else>
          Carregando métricas...
        </div>
      </div>
       <div v-else class="available-card-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="placeholder-icon"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
        <p>Aguardando associação</p>
      </div>
    </div>

    <div class="card-footer">
      <button v-if="!isAvailable" class="btn btn-secondary btn-full" @click="$emit('view-solicitacoes', partner)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Ver Solicitações
      </button>

      <div class="actions-main">
        <!-- Botão Condicional: Associar ou Editar -->
        <button 
          v-if="isAvailable"
          class="btn btn-primary" 
          @click="$emit('associate-card', partner)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Associar Cartão
        </button>

        <button 
          v-else-if="!isAvailable"
          class="btn btn-outline" 
          disabled 
          title="Funcionalidade disponível em breve."
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          Editar Parceiro
        </button>
        
        <button v-if="!isAvailable" class="btn btn-primary" @click="$emit('generate', partner)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          Gerar QR
        </button>
        <button v-if="!isAvailable" class="btn btn-outline" @click="$emit('download', partner)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Baixar
        </button>
      </div>
      <button class="btn btn-text btn-full" @click="handleGerarCartaz" :disabled="!isPartnerDataValidForPoster" :title="!isPartnerDataValidForPoster ? 'Associe um cartão para gerar o cartaz' : 'Gerar cartaz'">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>Gerar Cartaz</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pdf-generation-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  z-index: -1;
}

.partner-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.partner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  border-color: #e5e7eb;
}

.card-header {
  padding: 20px 20px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f8f9fa;
  min-height: 80px; /* Adjust to ensure enough space for new elements */
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
  flex-shrink: 0; /* Prevent shrinking when text wraps */
}

.partner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px; /* Space between name and status badge */
}

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap; /* Prevent badge text from wrapping */
  align-items: center;
  justify-content: center;
}

.status-available {
  background: #fef08a; /* Yellow */
  color: #a16207;
}

.status-in-use {
  background: #dcfce7; /* Green */
  color: #16a34a;
}

.code-highlight {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937; /* Darker color for emphasis */
  margin-bottom: 2px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.secondary-id {
  font-size: 0.65rem; /* Smaller font for technical ID */
  color: #6b7280;
  background: transparent;
  padding: 0;
}

.card-body {
  padding: 16px 20px;
  flex: 1;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
}

.icon {
  color: #9ca3af;
}

.card-footer {
  padding: 16px 20px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f3f4f6;
}

.actions-main {
  display: flex;
  gap: 10px;
}

.mb-3 {
  margin-bottom: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
  flex: 1;
}

.btn-primary {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-primary:hover {
  background: #059669;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-text {
  background: transparent;
  color: #6b7280;
  padding: 8px;
}

.btn-text:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-secondary {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-full {
  width: 100%;
}

/* Stats Styles */
.partner-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.65rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.highlight-stat .stat-value {
  color: #10b981;
}

.partner-stats-skeleton {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
}

.available-card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px 0;
  height: 100%;
}

.placeholder-icon {
  color: #e5e7eb;
  margin-bottom: 8px;
}

.available-card-placeholder p {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

.btn .spinner {
  animation: rotate 2s linear infinite;
  width: 16px;
  height: 16px;
}

.btn .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Manual Dark Mode Theme */
:deep(.theme-dark) .partner-card,
.theme-dark .partner-card {
  background: #1f2937;
  border-color: #374151;
}
:deep(.theme-dark) .card-header,
:deep(.theme-dark) .card-footer,
.theme-dark .card-header,
.theme-dark .card-footer {
  border-color: #374151;
}
:deep(.theme-dark) .card-footer,
.theme-dark .card-footer {
  background: #111827;
}
:deep(.theme-dark) .name,
.theme-dark .name {
  color: #f9fafb;
}
.theme-dark .badge,
.theme-dark .badge {
  background: #374151;
  color: #e5e7eb;
}
:deep(.theme-dark) .status-available,
.theme-dark .status-available {
  background: #a16207; /* Darker yellow */
  color: #fef08a;
}
:deep(.theme-dark) .status-in-use,
.theme-dark .status-in-use {
  background: #16a34a; /* Darker green */
  color: #dcfce7;
}
:deep(.theme-dark) .code-highlight,
.theme-dark .code-highlight {
  color: #f9fafb;
}
:deep(.theme-dark) .secondary-id,
.theme-dark .secondary-id {
  color: #9ca3af;
}
:deep(.theme-dark) .contact-info,
.theme-dark .contact-info {
  color: #9ca3af;
}
:deep(.theme-dark) .btn-outline,
.theme-dark .btn-outline {
  background: transparent;
  color: #e5e7eb;
  border-color: #4b5563;
}
:deep(.theme-dark) .btn-outline:hover,
.theme-dark .btn-outline:hover {
  background: #374151;
  border-color: #6b7280;
}
:deep(.theme-dark) .btn-text,
.theme-dark .btn-text {
  color: #9ca3af;
}
:deep(.theme-dark) .btn-text:hover,
.theme-dark .btn-text:hover {
  background: #374151;
  color: #f9fafb;
}
:deep(.theme-dark) .stat-value,
.theme-dark .stat-value {
  color: #f9fafb;
}
:deep(.theme-dark) .stat-label,
.theme-dark .stat-label {
  color: #9ca3af;
}
:deep(.theme-dark) .btn-secondary,
.theme-dark .btn-secondary {
  background: #374151;
  color: #f9fafb;
}
:deep(.theme-dark) .btn-secondary:hover,
.theme-dark .btn-secondary:hover {
  background: #4b5563;
}
:deep(.theme-dark) .available-card-placeholder .placeholder-icon,
.theme-dark .available-card-placeholder .placeholder-icon {
  color: #374151;
}
:deep(.theme-dark) .available-card-placeholder p,
.theme-dark .available-card-placeholder p {
  color: #6b7280;
}
</style>
