<script setup>
defineProps({
  partner: {
    type: Object,
    required: true
  }
})

defineEmits(['generate', 'download', 'poster', 'view-leads'])
</script>

<template>
  <div class="partner-card">
    <div class="card-header">
      <div class="avatar">
        {{ partner.nome.charAt(0).toUpperCase() }}
      </div>
      <div class="partner-info">
        <h3 class="name">{{ partner.nome }}</h3>
        <span class="badge">{{ partner.id }}</span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="contact-info">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <span>{{ partner.telefone }}</span>
      </div>

      <!-- Métricas de Desempenho (Mini Dashboard) -->
      <div class="partner-stats" v-if="partner.stats">
        <div class="stat-item">
          <span class="stat-value">{{ partner.stats.total_leads || 0 }}</span>
          <span class="stat-label">Leads</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ partner.stats.total_convertidos || 0 }}</span>
          <span class="stat-label">Conv.</span>
        </div>
        <div class="stat-item highlight-stat">
          <span class="stat-value">{{ partner.stats.taxa_conversao || '0%' }}</span>
          <span class="stat-label">Taxa</span>
        </div>
      </div>
      <div class="partner-stats-skeleton" v-else>
        Carregando métricas...
      </div>
    </div>

    <div class="card-footer">
      <!-- Botão para visualizar leads associados -->
      <button class="btn btn-secondary btn-full mb-3" @click="$emit('view-leads', partner)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Ver Leads
      </button>

      <div class="actions-main">
        <button class="btn btn-primary" @click="$emit('generate', partner)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          Gerar QR
        </button>
        <button class="btn btn-outline" @click="$emit('download', partner)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Baixar
        </button>
      </div>
      <button class="btn btn-text" @click="$emit('poster', partner)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        Gerar Cartaz
      </button>
    </div>
  </div>
</template>

<style scoped>
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
}

.partner-info {
  flex: 1;
}

.name {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
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
  justify-content: space-between;
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
:deep(.theme-dark) .badge,
.theme-dark .badge {
  background: #374151;
  color: #e5e7eb;
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
</style>
