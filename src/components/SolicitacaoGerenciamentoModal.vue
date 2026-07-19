<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { solicitacaoService } from '@/services/solicitacaoService';
import { cloneDeep, isEqual } from 'lodash-es';

const props = defineProps({
  solicitacaoId: {
    type: String,
    default: null,
  },
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'solicitacao-updated']);

// State for data fetching
const loading = ref(false);
const error = ref(null);

// State for editing
const originalData = ref(null);
const editableData = ref(null);
const historico = ref([]);
const isSaving = ref(false);
const saveError = ref(null);
const saveSuccess = ref(false);

const statusOptions = ['nova', 'em_atendimento', 'convertida', 'perdida'];

// Deep compare original and editable data to detect changes
const isDirty = computed(() => {
  if (!originalData.value || !editableData.value) {
    return false;
  }
  return !isEqual(originalData.value, editableData.value);
});

const formattedVidas = computed(() => {
  if (!editableData.value || !editableData.value.vidas || editableData.value.vidas.length === 0) {
    return 'N/A';
  }

  // Caso especial para Pessoa Jurídica (idade 99)
  if (editableData.value.vidas.length === 1 && editableData.value.vidas[0].idade === 99) {
    return 'N/A (Pessoa Jurídica)';
  }

  return editableData.value.vidas.map(v => v.idade).join(', ');
});

const resetFormState = () => {
  saveError.value = null;
  saveSuccess.value = false;
};

const fetchData = async (id) => {
  if (!id) return;
  
  loading.value = true;
  error.value = null;
  resetFormState();

  try {
    const [solicitacaoData, historicoData] = await Promise.all([
      solicitacaoService.buscar(id),
      solicitacaoService.buscarHistorico(id),
    ]);
    
    // Use cloneDeep to prevent reactivity bleeding
    originalData.value = cloneDeep(solicitacaoData);
    editableData.value = cloneDeep(solicitacaoData);
    historico.value = historicoData || [];

    // Fallback for null dados_comerciais to prevent template errors
    if (editableData.value && editableData.value.dados_comerciais === null) {
      editableData.value.dados_comerciais = {
        operadora: '',
        plano: '',
        valor_mensal: null,
        valor_adesao: null,
        vendedor: '',
        observacoes: ''
      };
    }

  } catch (err) {
    error.value = err.message || 'Falha ao carregar os dados da solicitação.';
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!isDirty.value) return;

  isSaving.value = true;
  resetFormState();

  const promises = [];
  const changes = { status: false, comercial: false };

  // Check if status has changed
  if (editableData.value.status !== originalData.value.status) {
    changes.status = true;
    promises.push(solicitacaoService.alterarStatus(props.solicitacaoId, editableData.value.status));
  }

  // Check if commercial data has changed
  if (!isEqual(editableData.value.dados_comerciais, originalData.value.dados_comerciais)) {
    changes.comercial = true;
    promises.push(solicitacaoService.atualizarDadosComerciais(props.solicitacaoId, editableData.value.dados_comerciais));
  }

  try {
    const results = await Promise.allSettled(promises);
    
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      let errorMessage = 'Falha ao salvar: ';
      if (changes.status && failures.some(f => f.reason.message.includes('status'))) errorMessage += 'Erro ao atualizar status. ';
      if (changes.comercial && failures.some(f => !f.reason.message.includes('status'))) errorMessage += 'Erro ao atualizar dados comerciais.';
      throw new Error(errorMessage.trim());
    }

    saveSuccess.value = true;
    // Reload data to get the latest version and reset dirty state
    await fetchData(props.solicitacaoId);
    // Emit event to notify parent component
    emit('solicitacao-updated', originalData.value); 
    // Close the modal after successful save
    emit('close');

  } catch (err) {
    saveError.value = err.message;
  } finally {
    isSaving.value = false;
    setTimeout(() => { saveSuccess.value = false }, 3000); // Hide success message after 3s
  }
};


watch(() => props.isOpen, (newVal) => {
  if (newVal && props.solicitacaoId) {
    fetchData(props.solicitacaoId);
  } else {
    // Clear data when modal is closed
    originalData.value = null;
    editableData.value = null;
    historico.value = [];
    resetFormState();
  }
});

const close = () => {
  emit('close');
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (isNaN(date)) return 'Data Inválida';
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatStatus = (status) => {
  const dictionary = {
    'nova': 'Nova', 'em_atendimento': 'Em Atendimento',
    'convertida': 'Convertida', 'perdida': 'Perdida',
  };
  return dictionary[status || 'nova'] || status;
};

</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="close-btn" @click="close">&times;</button>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Carregando dados...</span>
        </div>
        
        <div v-else-if="error" class="error-state">
          <h3>Erro ao Carregar</h3>
          <p>{{ error }}</p>
          <button @click="fetchData(solicitacaoId)" class="btn-secondary">Tentar Novamente</button>
        </div>

        <div v-else-if="editableData" class="management-container">
          <h1 class="main-title">Gerenciamento da Solicitação</h1>
          <p class="main-subtitle">ID: {{ editableData.id }}</p>

          <!-- Seção 1: Informações da Solicitação -->
          <section class="data-section">
            <h2>Informações da Solicitação</h2>
            <div class="info-grid">
              <div class="info-item"><label>Cliente</label><span>{{ editableData.nome_cliente || 'Não informado' }}</span></div>
              <div class="info-item"><label>CPF/CNPJ</label><span>{{ editableData.cpf || editableData.cnpj || 'N/A' }}</span></div>
              <div class="info-item"><label>Cidade</label><span>{{ editableData.cidade || 'N/A' }}</span></div>
              <div class="info-item"><label>UF</label><span>{{ editableData.uf || 'N/A' }}</span></div>
              <div class="info-item"><label>Qtd. Vidas</label><span>{{ editableData.vidas.length }}</span></div>
              <div class="info-item"><label>Idade das Vidas</label><span>{{ formattedVidas }}</span></div>
              <div class="info-item"><label>Cobertura</label><span>{{ editableData.cobertura }}</span></div>
              <div class="info-item"><label>Parceiro</label><span>{{ editableData.parceiro.nome || 'Sem nome' }}</span></div>
              <div class="info-item"><label>Criado em</label><span>{{ formatDate(editableData.created_at) }}</span></div>
            </div>
          </section>

          <!-- Seção 2: Status Atual -->
          <section class="data-section">
            <h2>Status Atual</h2>
            <select v-model="editableData.status" class="form-select">
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ formatStatus(status) }}
              </option>
            </select>
          </section>
          
          <!-- Seção 3: Dados Comerciais -->
          <section class="data-section">
            <h2>Dados Comerciais</h2>
            <div class="form-grid">
              <div class="form-group"><label>Operadora</label><input type="text" v-model="editableData.dados_comerciais.operadora" class="form-input" /></div>
              <div class="form-group"><label>Plano</label><input type="text" v-model="editableData.dados_comerciais.plano" class="form-input" /></div>
              <div class="form-group"><label>Valor Mensal</label><input type="number" step="0.01" v-model.number="editableData.dados_comerciais.valor_mensal" class="form-input" /></div>
              <div class="form-group"><label>Valor Adesão</label><input type="number" step="0.01" v-model.number="editableData.dados_comerciais.valor_adesao" class="form-input" /></div>
              <div class="form-group form-group-full"><label>Vendedor</label><input type="text" v-model="editableData.dados_comerciais.vendedor" class="form-input" /></div>
              <div class="form-group form-group-full"><label>Observações</label><textarea v-model="editableData.dados_comerciais.observacoes" class="form-textarea" rows="3"></textarea></div>
            </div>
          </section>
          
          <!-- Seção 4: Histórico -->
          <section class="data-section">
            <h2>Histórico de Status</h2>
            <ul v-if="historico.length > 0" class="history-list">
              <li v-for="item in historico" :key="item.data" class="history-item">
                <span class="history-date">{{ formatDate(item.data) }}</span>
                <span class="history-status">{{ formatStatus(item.status) }}</span>
              </li>
            </ul>
            <p v-else class="empty-text">Nenhum histórico de status para esta solicitação.</p>
          </section>

          <!-- Botão Salvar e Feedback -->
          <div class="footer-actions">
            <button @click="handleSave" :disabled="!isDirty || isSaving" class="btn-primary">
              <div v-if="isSaving" class="mini-spinner"></div>
              {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
            <div v-if="saveSuccess" class="feedback-msg success">Alterações salvas com sucesso!</div>
            <div v-if="saveError" class="feedback-msg error">{{ saveError }}</div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos anteriores omitidos para brevidade... */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 20, 30, 0.8);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(5px);
}
.modal-content {
  background: #ffffff; color: #111827;
  padding: 32px 40px; border-radius: 24px;
  width: 90%; max-width: 700px;
  max-height: 90vh; overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.close-btn {
  position: absolute; top: 16px; right: 20px;
  background: none; border: none; font-size: 30px;
  cursor: pointer; color: #9ca3af; transition: color 0.2s;
}
.close-btn:hover { color: #374151; }

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; padding: 80px 20px; color: #6b7280; text-align: center;
}
.spinner, .mini-spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #10b981;}
.mini-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.5); border-top-color: #fff; }

@keyframes spin { to { transform: rotate(360deg); } }

.main-title { font-size: 28px; font-weight: 800; text-align: center; margin: 0 0 4px 0; color: #1f2937; }
.main-subtitle { text-align: center; color: #6b7280; margin: 0 0 32px 0; font-family: monospace; }

.data-section { margin-bottom: 28px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
.data-section:last-child { border-bottom: none; }
.data-section h2 {
  font-size: 16px; font-weight: 700; color: #374151;
  margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;
}

/* Formulários e Grids */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-item label { font-size: 13px; color: #6b7280; font-weight: 500; }
.info-item span { font-size: 15px; color: #1f2937; font-weight: 600; }
.info-item-full { grid-column: 1 / -1; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group-full { grid-column: 1 / -1; }
.form-group label { font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 6px; }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 10px 14px;
  background: #f9fafb; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 15px; color: #111827;
  transition: all 0.2s; box-sizing: border-box;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none; border-color: #10b981; background: #fff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.history-list { list-style: none; padding: 0; margin: 0; }
.history-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #f3f4f6;
}
.history-item:last-child { border-bottom: none; }
.history-date { font-size: 14px; color: #6b7280; }
.history-status { font-weight: 600; color: #374151; }
.empty-text { color: #6b7280; font-size: 14px; }

/* Footer */
.footer-actions { text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; margin-top: 32px; }
.btn-primary {
  width: 100%; max-width: 300px; padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.2s; display: inline-flex;
  align-items: center; justify-content: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); }
.btn-primary:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; box-shadow: none; }

.feedback-msg { margin-top: 16px; font-size: 14px; font-weight: 600; padding: 10px; border-radius: 8px; }
.feedback-msg.success { color: #065f46; background-color: #d1fae5; }
.feedback-msg.error { color: #991b1b; background-color: #fee2e2; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
