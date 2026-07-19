<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div>
            <h1>Gestão de Solicitações</h1>
            <p>Acompanhe e gerencie as solicitações captadas pelos parceiros</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="router.push('/admin/qr')" class="action-btn">Voltar</button>
        </div>
      </div>
    </header>

    <main class="dashboard-content">

      <!-- Contexto do parceiro se acessado pela URL -->
      <div v-if="activePartnerId" class="context-banner">
        <span>Exibindo solicitações do parceiro: <strong>{{ activePartnerId }}</strong></span>
        <button class="btn-clear" @click="clearPartnerContext">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Limpar
        </button>
      </div>

      <!-- KPIs Gerais no topo -->
      <div class="kpi-banner">
        <div class="kpi-card">
          <span class="kpi-label">Total de Solicitações</span>
          <span class="kpi-value">{{ kpi.total }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Solicitações Novas</span>
          <span class="kpi-value text-gray">{{ kpi.novas }}</span>
        </div>
        <div class="kpi-card highlight-kpi">
          <span class="kpi-label">Convertidas</span>
          <span class="kpi-value">{{ kpi.convertidas }}</span>
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
          <input type="text" v-model="searchQuery" placeholder="Buscar por ID, cidade ou parceiro..." />
        </div>
        
        <div class="select-group">
          <select v-model="currentStatusFilter" :disabled="isLoading">
            <option value="todos">Todos os Status</option>
            <option value="nova">Nova</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="convertida">Convertida</option>
            <option value="perdida">Perdida</option>
          </select>
          <select v-model="currentPartnerFilter" :disabled="isLoading || activePartnerId !== null">
            <option value="todos">Todos os Parceiros</option>
            <option v-for="p in uniquePartners" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>

      <!-- Feedback Visual e Tabela -->
      <div class="table-container">
        
        <div v-if="isLoading && solicitacoes.length === 0" class="loading-state">
          <div class="spinner"></div>
          <span>Carregando solicitações...</span>
        </div>
        
        <div v-else-if="filteredSolicitacoes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>Nenhuma solicitação encontrada</h3>
          <p>Não há solicitações que correspondam aos filtros selecionados.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="solicitacoes-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Vidas</th>
                <th>Cobertura</th>
                <th>Cidade</th>
                <th>Parceiro</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="solicitacao in filteredSolicitacoes" 
                :key="solicitacao.id" 
                :class="{ 'updating': isUpdating === solicitacao.id }"
              >
                <td class="text-gray-500">{{ solicitacao.protocolo }}</td>
                <td class="text-gray-500">{{ solicitacao.vidas?.length || 0 }}</td>
                <td class="text-gray-500">{{ solicitacao.cobertura }}</td>
                <td class="text-gray-500">{{ solicitacao.cidade || 'N/A' }}</td>
                <td class="text-gray-500">{{ solicitacao.parceiro?.nome || solicitacao.parceiro?.id || 'SEM_REF' }}</td>
                <td>
                  <span :class="['status-badge', solicitacao.status || 'novo']">
                    {{ formatStatus(solicitacao.status) }}
                  </span>
                </td>
                <td class="text-gray-500">{{ formatDate(solicitacao.created_at) }}</td>
                <td>
                  <div class="actions-cell">
                    <button 
                      @click="openGerenciamentoModal(solicitacao.id)"
                      class="btn-manage"
                      :disabled="isLoading || isUpdating === solicitacao.id"
                    >
                      Gerenciar
                    </button>
                    <select 
                      :value="solicitacao.status || 'nova'" 
                      @change="updateSolicitacaoStatus(solicitacao.id, $event.target.value)"
                      :disabled="isLoading || isUpdating === solicitacao.id"
                      class="action-select inline-select"
                    >
                      <option value="nova">Nova</option>
                      <option value="em_atendimento">Atender</option>
                      <option value="convertida">Converter</option>
                      <option value="perdida">Perder</option>
                    </select>
                    <div v-if="isUpdating === solicitacao.id" class="mini-spinner"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <SolicitacaoGerenciamentoModal
      :is-open="isGerenciamentoModalOpen"
      :solicitacao-id="selectedSolicitacaoId"
      @close="closeGerenciamentoModal"
      @solicitacao-updated="handleSolicitacaoUpdate"
    />

    <OperadorModal
      :open="isOperadorModalOpen"
      :is-saving="isSavingOperador"
      @close="closeOperadorModal"
      @save="handleSaveOperador"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { solicitacaoService } from '@/services/solicitacaoService';
import { operadorService } from '@/services/operadorService';
import SolicitacaoGerenciamentoModal from '@/components/SolicitacaoGerenciamentoModal.vue';
import OperadorModal from '@/components/OperadorModal.vue';

const router = useRouter();

// Operador Modal State
const isOperadorModalOpen = ref(false);
const isSavingOperador = ref(false);

const openOperadorModal = () => {
  isOperadorModalOpen.value = true;
};

const closeOperadorModal = () => {
  isOperadorModalOpen.value = false;
};

const handleSaveOperador = async (operadorData) => {
  isSavingOperador.value = true;
  try {
    await operadorService.criar(operadorData);
    closeOperadorModal();
    // Maybe show a success message
  } catch (error) {
    console.error("Erro ao criar operador:", error);
    // Maybe show an error message
  } finally {
    isSavingOperador.value = false;
  }
};

// Modal State
const isGerenciamentoModalOpen = ref(false);
const selectedSolicitacaoId = ref(null);

const openGerenciamentoModal = (id) => {
  selectedSolicitacaoId.value = id;
  isGerenciamentoModalOpen.value = true;
};

const closeGerenciamentoModal = () => {
  isGerenciamentoModalOpen.value = false;
  selectedSolicitacaoId.value = null;
};

const handleSolicitacaoUpdate = (updatedSolicitacao) => {
  const index = solicitacoes.value.findIndex(s => s.id === updatedSolicitacao.id);
  if (index !== -1) {
    solicitacoes.value[index] = updatedSolicitacao;
  }
};



// Control of Theme
const theme = ref(localStorage.getItem('theme') || 'light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

const solicitacoes = ref([]);
const currentStatusFilter = ref('todos');
const currentPartnerFilter = ref('todos');
const searchQuery = ref('');
const isLoading = ref(false);
const isUpdating = ref(null);

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

const filteredSolicitacoes = computed(() => {
  let filtered = solicitacoes.value;
  
  if (currentStatusFilter.value !== 'todos') {
    filtered = filtered.filter(s => s.status === currentStatusFilter.value);
  }
  
  if (currentPartnerFilter.value !== 'todos') {
    filtered = filtered.filter(s => s.parceiro && s.parceiro.id === currentPartnerFilter.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(s => 
      (s.id && s.id.toLowerCase().includes(q)) || 
      (s.cidade && s.cidade.toLowerCase().includes(q)) ||
      (s.parceiro && s.parceiro.nome && s.parceiro.nome.toLowerCase().includes(q)) ||
      (s.parceiro && s.parceiro.id && s.parceiro.id.toLowerCase().includes(q))
    );
  }
  
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const uniquePartners = computed(() => {
  const partnersMap = new Map();
  solicitacoes.value.forEach(s => {
    if (s.parceiro && s.parceiro.id) {
      partnersMap.set(s.parceiro.id, s.parceiro.nome || s.parceiro.id);
    }
  });
  return Array.from(partnersMap, ([id, name]) => ({ id, name }));
});

const kpi = computed(() => {
  const source = currentPartnerFilter.value !== 'todos' ? filteredSolicitacoes.value : solicitacoes.value;
  const total = source.length;
  const novas = source.filter(s => (s.status === 'novo' || !s.status)).length;
  const convertidas = source.filter(s => s.status === 'convertida').length;
  const taxa = total > 0 ? ((convertidas / total) * 100).toFixed(1) + '%' : '0%';
  
  return { total, novas, convertidas, taxa };
});

const fetchSolicitacoes = async () => {
  isLoading.value = true;
  try {
    const data = await solicitacaoService.listar();
    solicitacoes.value = data.solicitacoes || [];
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
  } finally {
    isLoading.value = false;
  }
};

const updateSolicitacaoStatus = async (id, newStatus) => {
  isUpdating.value = id; 
  
  try {
    await solicitacaoService.alterarStatus(id, newStatus);
    
    const index = solicitacoes.value.findIndex(s => s.id === id);
    if (index !== -1) {
      solicitacoes.value[index] = { ...solicitacoes.value[index], status: newStatus };
    }
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
  } finally {
    isUpdating.value = null; 
  }
};

onMounted(() => {
  fetchSolicitacoes();
});

const formatStatus = (status) => {
  const dictionary = {
    'nova': 'Nova',
    'em_atendimento': 'Em Atend.',
    'convertida': 'Convertida',
    'perdida': 'Perdida',
  };
  return dictionary[status || 'nova'] || status;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (isNaN(date)) return 'Data Inválida';
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
/* Estilos são muito semelhantes aos anteriores, apenas renomeando a classe da tabela */
.dashboard-layout { min-height: 100vh; background-color: #f3f4f6; }
.dashboard-header { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 32px 0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.header-content { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 24px; 
  display: flex; /* Added */
  justify-content: space-between; /* Added */
  align-items: center; /* Added */
}
.header-actions {
  display: flex;
  gap: 12px;
}
.btn-primary-outline {
  background-color: transparent;
  color: #10b981;
  border: 1px solid #10b981;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-primary-outline:hover {
  background-color: #10b981;
  color: white;
}

/* Estilo do botão de ação, copiado do QrGeneratorView para consistência */
.action-btn {
  text-decoration: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.title-area { display: flex; align-items: center; gap: 20px; }
.icon-box { width: 56px; height: 56px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); }
.title-area h1 { margin: 0; font-size: 2rem; font-weight: 700; color: #111827; }
.title-area p { margin: 4px 0 0 0; color: #6b7280; font-size: 1rem; }
.dashboard-content { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
.kpi-banner { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
.kpi-card { background: white; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025); border: 1px solid #f9fafb; gap: 8px; }
.kpi-label { font-size: 0.85rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-value { font-size: 2.2rem; font-weight: 700; color: #111827; line-height: 1; }
.highlight-kpi { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
.highlight-kpi .kpi-label { color: rgba(255,255,255,0.8); }
.highlight-kpi .kpi-value { color: white; }
.text-gray { color: #4b5563; }
.context-banner { background-color: #ebf8ff; border: 1px solid #bee3f8; color: #2b6cb0; padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; font-size: 0.95rem; }
.btn-clear { background: transparent; color: #2b6cb0; border: 1px solid rgba(43, 108, 176, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-clear:hover { background: rgba(43, 108, 176, 0.1); }
.filters-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 250px; max-width: 400px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #d1d5db; border-radius: 100px; font-size: 0.9rem; background: white; box-sizing: border-box; transition: all 0.2s; }
.search-box input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); outline: none; }
.select-group { display: flex; gap: 12px; }
.select-group select { padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 100px; background-color: white; font-size: 0.9rem; color: #374151; cursor: pointer; font-weight: 500; transition: all 0.2s; }
.select-group select:focus { border-color: #10b981; outline: none; }
.table-container { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025); border: 1px solid #f9fafb; overflow: hidden; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 20px; color: #6b7280; text-align: center; }
.empty-state h3 { margin: 0; color: #1f2937; font-weight: 600; font-size: 1.25rem; }
.empty-state p { margin: 0; font-size: 0.95rem; }
.empty-icon { background: #f3f4f6; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 8px; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-wrapper { overflow-x: auto; }
.solicitacoes-table { width: 100%; border-collapse: collapse; text-align: left; }
.solicitacoes-table th, .solicitacoes-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; white-space: nowrap; }
.solicitacoes-table th { background-color: #f9fafb; font-weight: 600; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.solicitacoes-table tbody tr:hover { background-color: #f9fafb; }
.solicitacoes-table tr.updating { opacity: 0.4; pointer-events: none; }
.text-gray-500 { color: #6b7280; }
.solicitacao-id { font-weight: 600; color: #111827; font-family: monospace; font-size: 0.8rem;}
.parceiro-badge { background: #f3f4f6; padding: 6px 10px; border-radius: 8px; color: #4b5563; font-size: 0.8rem; font-weight: 600; }
.status-badge { display: inline-flex; padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.novo { background-color: #f3f4f6; color: black !important; }
.status-badge.em_atendimento { background-color: #eff6ff; color: black !important; }
.status-badge.convertido { background-color: #ecfdf5; color: black !important; }
.status-badge.perdido { background-color: #fef2f2; color: black !important; }

/* Dark Theme Adjustments for Status Badges */
.theme-dark .status-badge.novo { background-color: #374151; color: white !important; }
.theme-dark .status-badge.em_atendimento { background-color: #1e3a8a; color: white !important; }
.theme-dark .status-badge.convertido { background-color: #064e3b; color: white !important; }
.theme-dark .status-badge.perdido { background-color: #7f1d1d; color: white !important; }
.actions-cell { display: flex; align-items: center; gap: 8px; }
.inline-select { padding: 8px 12px; font-size: 0.85rem; border-radius: 8px; background-color: transparent; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; cursor: pointer; }
.inline-select:hover:not(:disabled) { border-color: #10b981; background-color: #f9fafb; }
.inline-select:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.btn-manage {
  padding: 8px 12px; font-size: 0.85rem; border-radius: 8px; background-color: #1f2937; color: white; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s;
}
.btn-manage:hover:not(:disabled) { background-color: #374151; }
.mini-spinner { width: 14px; height: 14px; border: 2px solid #e5e7eb; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
</style>
