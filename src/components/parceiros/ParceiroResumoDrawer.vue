<template>
  <div class="drawer-container" :class="{ 'is-open': show }">
    <div class="drawer-overlay" @click="closeDrawer"></div>
    <div class="drawer-content">
      <div v-if="loading">
        <div class="skeleton-item" style="height: 40px; width: 60%; margin-bottom: 20px;"></div>
        <div class="skeleton-item" style="height: 20px; width: 40%; margin-bottom: 40px;"></div>
        <div class="d-flex flex-wrap justify-content-between">
          <div v-for="i in 6" :key="i" class="skeleton-card"></div>
        </div>
      </div>
      <div v-else-if="error">
        <div class="alert alert-danger">
          Não foi possível carregar o resumo do parceiro.
        </div>
      </div>
      <div v-else-if="resumo">
        <div class="drawer-header">
          <h5 class="drawer-title">{{ resumo.nome }}</h5>
          <p class="text-muted">{{ resumo.parceiro_id }}</p>
          <button type="button" class="btn-close" @click="closeDrawer"></button>
        </div>
        <div class="drawer-body">
          <div class="summary-card">
            <div class="summary-title">Solicitações</div>
            <div class="summary-value">{{ resumo.total_solicitacoes }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Conversões</div>
            <div class="summary-value">{{ resumo.total_convertidos }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Vendas</div>
            <div class="summary-value">{{ resumo.total_vendas }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Valor vendido</div>
            <div class="summary-value">{{ formatCurrency(resumo.valor_total_vendas) }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Comissão gerada</div>
            <div class="summary-value">{{ formatCurrency(resumo.total_comissao) }}</div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="btn btn-secondary" @click="closeDrawer">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { parceiroService } from '@/services/parceiroService.js';

const props = defineProps({
  parceiroId: {
    type: String,
    default: null,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const error = ref(null);
const resumo = ref(null);

const fetchResumo = async () => {
  if (!props.parceiroId) return;

  loading.value = true;
  error.value = null;
  resumo.value = null;

  try {
    const response = await parceiroService.buscarResumo(props.parceiroId);
    if (response.success) {
      resumo.value = response.data;
    } else {
      throw new Error('Failed to fetch summary');
    }
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal && props.parceiroId) {
    fetchResumo();
  }
});

const closeDrawer = () => {
  emit('close');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
</script>

<style scoped>
.drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  pointer-events: none;
  visibility: hidden;
}

.drawer-container.is-open {
  pointer-events: auto;
  visibility: visible;
}

.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.3s ease;
}

.drawer-container.is-open .drawer-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 420px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0,0,0,.1);
  padding: 20px;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.drawer-container.is-open .drawer-content {
  transform: translateX(0);
}

.drawer-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 15px;
  margin-bottom: 20px;
  position: relative;
}

.drawer-title {
  margin-bottom: 0.5rem;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
}


.summary-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  text-align: center;
}

.summary-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 500;
}

.drawer-footer {
  margin-top: 20px;
  text-align: right;
}

.skeleton-item {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-card {
    width: 48%;
    height: 80px;
    margin-bottom: 15px;
    background-color: #e0e0e0;
    border-radius: 8px;
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
