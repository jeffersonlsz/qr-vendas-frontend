<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div>
            <h1>Gestão de Leads</h1>
            <p>Acompanhe e gerencie os leads captados pelos parceiros</p>
          </div>
        </div>
      </div>
    </header>

    <main class="dashboard-content">

      <!-- Contexto do parceiro se acessado pela URL -->
      <div v-if="activePartnerId" class="context-banner">
        <span>Exibindo leads do parceiro: <strong>{{ activePartnerId }}</strong></span>
        <button class="btn-clear" @click="clearPartnerContext">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Limpar
        </button>
      </div>

      <!-- KPIs Gerais no topo -->
      <div class="kpi-banner">
        <div class="kpi-card">
          <span class="kpi-label">Total de Leads</span>
          <span class="kpi-value">{{ kpi.total }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Leads Novos</span>
          <span class="kpi-value text-gray">{{ kpi.novos }}</span>
        </div>
        <div class="kpi-card highlight-kpi">
          <span class="kpi-label">Convertidos</span>
          <span class="kpi-value">{{ kpi.convertidos }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Taxa de Conversão</span>
          <span class="kpi-value">{{ kpi.taxa }}</span>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="filters-bar">
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchQuery" placeholder="Buscar por nome ou telefone..." />
        </div>
        
        <div class="select-group">
          <select v-model="currentStatusFilter" :disabled="isLoading">
            <option value="todos">Todos os Status</option>
            <option value="novo">Novo</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </select>
          <select v-model="currentPartnerFilter" :disabled="isLoading || activePartnerId !== null">
            <option value="todos">Todos os Parceiros</option>
            <option v-for="p in uniquePartners" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
      </div>

      <!-- Feedback Visual e Tabela -->
      <div class="table-container">
        
        <div v-if="isLoading && leads.length === 0" class="loading-state">
          <div class="spinner"></div>
          <span>Carregando leads...</span>
        </div>
        
        <div v-else-if="filteredLeads.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>Nenhum lead encontrado</h3>
          <p>Não há leads que correspondam aos filtros selecionados.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="leads-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Parceiro</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="lead in filteredLeads" 
                :key="lead.id" 
                :class="{ 'updating': isUpdating === lead.id }"
              >
                <td>
                  <div class="lead-name">{{ lead.nome || 'N/A' }}</div>
                </td>
                <td class="text-gray-500">{{ lead.telefone || 'N/A' }}</td>
                <td><span class="parceiro-badge">{{ lead.parceiro_id || 'SEM_REF' }}</span></td>
                <td>
                  <span :class="['status-badge', lead.status || 'novo']">
                    {{ formatStatus(lead.status) }}
                  </span>
                </td>
                <td class="text-gray-500">{{ formatDate(lead.created_at) }}</td>
                <td>
                  <div class="actions-cell">
                    <select 
                      :value="lead.status || 'novo'" 
                      @change="updateLeadStatus(lead.id, $event.target.value)"
                      :disabled="isLoading || isUpdating === lead.id"
                      class="action-select inline-select"
                    >
                      <option value="novo">Novo</option>
                      <option value="em_atendimento">Atender</option>
                      <option value="convertido">Converter</option>
                      <option value="perdido">Perder</option>
                    </select>
                    <div v-if="isUpdating === lead.id" class="mini-spinner"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// --- ESTADO ---
const leads = ref([]);
const currentStatusFilter = ref('todos');
const currentPartnerFilter = ref('todos');
const searchQuery = ref('');
const isLoading = ref(false);
const isUpdating = ref(null); // id do lead sendo modificado
const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

// Contexto do parceiro via URL da dashboard de parceiros
const activePartnerId = ref(new URLSearchParams(window.location.search).get('parceiro_id') || null);
if (activePartnerId.value) {
  currentPartnerFilter.value = activePartnerId.value;
}

const clearPartnerContext = () => {
  activePartnerId.value = null;
  currentPartnerFilter.value = 'todos';
  const url = new URL(window.location);
  url.searchParams.delete('parceiro_id');
  window.history.replaceState({}, '', url);
}

// --- DADOS DERIVADOS (COMPUTADOS) ---
const filteredLeads = computed(() => {
  let filtered = leads.value;
  
  if (currentStatusFilter.value !== 'todos') {
    filtered = filtered.filter(lead => lead.status === currentStatusFilter.value);
  }
  
  if (currentPartnerFilter.value !== 'todos') {
    filtered = filtered.filter(lead => lead.parceiro_id === currentPartnerFilter.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(lead => 
      (lead.nome && lead.nome.toLowerCase().includes(q)) || 
      (lead.telefone && lead.telefone.toLowerCase().includes(q))
    );
  }
  
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const uniquePartners = computed(() => {
  const partnersSet = new Set(leads.value.map(l => l.parceiro_id).filter(Boolean));
  return Array.from(partnersSet);
});

// KPIs dinamicos para a tabela (considerando o banco carregado)
const kpi = computed(() => {
  const source = currentPartnerFilter.value !== 'todos' ? filteredLeads.value : leads.value;
  const total = source.length;
  const novos = source.filter(l => (l.status === 'novo' || !l.status)).length;
  const convertidos = source.filter(l => l.status === 'convertido').length;
  const taxa = total > 0 ? ((convertidos / total) * 100).toFixed(1) + '%' : '0%';
  
  return { total, novos, convertidos, taxa };
});

// --- MÉTODOS DA API ---
const fetchLeads = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${baseUrl}/api/v1/leads`);
    if (!response.ok) throw new Error('Falha ao buscar os leads');
    
    const data = await response.json();
    leads.value = Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Erro ao listar leads:", error);
  } finally {
    isLoading.value = false;
  }
};

const updateLeadStatus = async (id, newStatus) => {
  isUpdating.value = id; 
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) throw new Error(`Falha na atualização do lead ${id}`);
    
    const index = leads.value.findIndex(l => l.id === id);
    if (index !== -1) {
      leads.value[index].status = newStatus;
    }
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    const index = leads.value.findIndex(l => l.id === id);
    if (index !== -1) {
      const original = leads.value[index].status;
      leads.value[index].status = ''; 
      setTimeout(() => leads.value[index].status = original, 50); 
    }
  } finally {
    isUpdating.value = null; 
  }
};

onMounted(() => {
  fetchLeads();
});

// --- FORMATADORES ---
const formatStatus = (status) => {
  const dictionary = {
    'novo': 'Novo',
    'em_atendimento': 'Em Atend.',
    'convertido': 'Convertido',
    'perdido': 'Perdido',
  };
  return dictionary[status || 'novo'] || status;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const isSeconds = String(dateValue).length === 10 && !isNaN(dateValue);
  const date = new Date(isSeconds ? dateValue * 1000 : dateValue);
  if (isNaN(date)) return 'Data Inválida';
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
/* Estilo Base alinhado ao Dashboard moderno */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: inherit;
  color: #1f2937;
}

.dashboard-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 32px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.title-area h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

.title-area p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* KPIs Topo */
.kpi-banner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025);
  border: 1px solid #f9fafb;
  gap: 8px;
}
.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.kpi-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}
.highlight-kpi {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}
.highlight-kpi .kpi-label {
  color: rgba(255,255,255,0.8);
}
.highlight-kpi .kpi-value {
  color: white;
}
.text-gray { color: #4b5563; }

/* Context Banner */
.context-banner {
  background-color: #ebf8ff;
  border: 1px solid #bee3f8;
  color: #2b6cb0;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
}
.btn-clear {
  background: transparent;
  color: #2b6cb0;
  border: 1px solid rgba(43, 108, 176, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-clear:hover {
  background: rgba(43, 108, 176, 0.1);
}

/* Filtros */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}
.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 100px;
  font-size: 0.9rem;
  outline: none;
  background: white;
  box-sizing: border-box;
  transition: all 0.2s;
}
.search-box input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.select-group {
  display: flex;
  gap: 12px;
}
.select-group select {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 100px;
  background-color: white;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  outline: none;
  font-weight: 500;
  transition: all 0.2s;
}
.select-group select:focus {
  border-color: #10b981;
}

/* Container de Tabela Moderno */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);
  border: 1px solid #f9fafb;
  overflow: hidden;
  position: relative;
}

/* Feedback Visual (Loading/Empty) */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: #6b7280;
  text-align: center;
}
.empty-state h3 {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.25rem;
}
.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}
.empty-icon {
  background: #f3f4f6;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-bottom: 8px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Tabela em si */
.table-wrapper {
  overflow-x: auto;
}
.leads-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.leads-table th, .leads-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}
.leads-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.leads-table tr {
  transition: background-color 0.15s ease;
}
.leads-table tbody tr:hover {
  background-color: #f9fafb;
}
.leads-table tr.updating {
  opacity: 0.4;
  pointer-events: none;
}

.text-gray-500 {
  color: #6b7280;
}
.lead-name {
  font-weight: 600;
  color: #111827;
}

.parceiro-badge {
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 8px;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Badges CSS (Cores exatas) */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}
.status-badge.novo { background-color: #f3f4f6; color: #4b5563; }
.status-badge.em_atendimento { background-color: #eff6ff; color: #2563eb; }
.status-badge.convertido { background-color: #ecfdf5; color: #059669; }
.status-badge.perdido { background-color: #fef2f2; color: #dc2626; }

/* Action Select & mini-spinner */
.actions-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.inline-select {
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: 8px;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
  cursor: pointer;
}
.inline-select:hover:not(:disabled) {
  border-color: #10b981;
  background-color: #f9fafb;
}
.inline-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .title-area h1 { font-size: 1.5rem; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
}
</style>
