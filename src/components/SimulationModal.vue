<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const form = reactive({
  idade: '',
  valor_atual: '',
  regime_trabalho: 'CLT',
  cidade: 'Brasilia'
});

const loading = ref(false);
const error = ref(null);
const result = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

const handleSimulation = async () => {
  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const response = await fetch(`${baseUrl}/api/v1/cotacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idade: Number(form.idade),
        valor_atual: Number(form.valor_atual),
        regime_trabalho: form.regime_trabalho,
        cidade: form.cidade
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar cotação. Tente novamente mais tarde.');
    }

    const data = await response.json();
    result.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openWhatsApp = () => {
  const phone = '5561984974689'; // Example phone
  const message = encodeURIComponent(`Olá! Fiz uma simulação e gostaria de uma análise detalhada. 
  Idade: ${form.idade}
  Valor atual: ${formatCurrency(form.valor_atual)}
  Regime: ${form.regime_trabalho}`);
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

const close = () => {
  emit('close');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content glass-effect">
        <button class="close-btn" @click="close">&times;</button>
        
        <div class="simulation-container">
          <Transition name="fade" mode="out-in">
            <div class="form-section" v-if="!result" key="form">
              <h1>Simulação de Plano de Saúde</h1>
              <p class="subtitle">Descubra quanto você pode economizar hoje.</p>
              
              <form @submit.prevent="handleSimulation">
                <div class="form-group">
                  <label for="idade">Idade</label>
                  <input 
                    type="number" 
                    id="idade" 
                    v-model="form.idade" 
                    placeholder="Ex: 35" 
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="valor_atual">Valor atual do plano (R$)</label>
                  <input 
                    type="number" 
                    id="valor_atual" 
                    v-model="form.valor_atual" 
                    placeholder="Ex: 850" 
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="regime">Regime de Trabalho</label>
                  <select id="regime" v-model="form.regime_trabalho">
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ / Empresário</option>
                    <option value="Servidor Público">Servidor Público</option>
                    <option value="Estudante">Estudante</option>
                  </select>
                </div>

                <button type="submit" :disabled="loading" class="btn-primary">
                  {{ loading ? 'Calculando...' : 'Ver Simulação' }}
                </button>
              </form>

              <p v-if="error" class="error-msg">{{ error }}</p>
            </div>

            <!-- Result Card -->
            <div class="result-section" v-else key="result">
              <div class="section">
                <p class="label">Você informou que paga atualmente:</p>
                <p class="highlight-light">{{ formatCurrency(form.valor_atual) }} por mês</p>
              </div>

              <div class="divider"></div>

              <div class="section">
                <p class="success-text">Encontramos opções compatíveis com seu perfil.</p>
                <div class="savings">
                  <p class="label">Economia estimada:</p>
                  <p class="savings-monthly">{{ formatCurrency(result.economia_mensal || 212.50) }} por mês</p>
                  <p class="savings-yearly">{{ formatCurrency(result.economia_anual || 2550.00) }} por ano</p>
                </div>
              </div>

              <div class="divider"></div>

              <div class="section">
                <p class="label">Valor estimado:</p>
                <p class="highlight-blue">{{ formatCurrency(result.valor_estimado || 637.50) }} por mês</p>
              </div>

              <div class="divider"></div>

              <div class="section">
                <p class="label">Operadoras disponíveis:</p>
                <ul class="operators-list">
                  <li><span>✓</span> Amil</li>
                  <li><span>✓</span> Bradesco</li>
                  <li><span>✓</span> Hapvida</li>
                </ul>
              </div>

              <div class="divider"></div>

              <div class="message-box">
                <p>{{ result.mensagem || 'Existem opções compatíveis com seu perfil.' }}</p>
              </div>

              <button @click="openWhatsApp" class="btn-whatsapp">
                Quero uma análise detalhada
              </button>

              <button @click="result = null" class="btn-back">
                Refazer simulação
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 10, 24, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: #0f172a;
  padding: 32px;
  border-radius: 32px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-effect {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 25px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f8fafc;
}

.simulation-container {
  width: 100%;
}

h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #ffffff;
  text-align: center;
  font-weight: 800;
}

.subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 32px;
  font-size: 15px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #e2e8f0;
  font-size: 14px;
}

input, select {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  color: #ffffff;
  transition: all 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #00d1ff;
  background: rgba(255, 255, 255, 0.08);
}

select option {
  background-color: #0f172a;
  color: #ffffff;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00D1FF 0%, #007BFF 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 15px;
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ff4d4d;
  font-size: 14px;
  margin-top: 16px;
  text-align: center;
}

/* Result Styles */
.result-section {
  text-align: center;
}

.section {
  padding: 12px 0;
}

.label {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 4px;
}

.highlight-light {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.08);
  margin: 12px 0;
}

.success-text {
  color: #25d366;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 12px;
}

.savings-monthly {
  font-size: 24px;
  font-weight: 800;
  color: #25d366;
}

.savings-yearly {
  font-size: 14px;
  color: #94a3b8;
}

.highlight-blue {
  font-size: 28px;
  font-weight: 800;
  color: #00d1ff;
}

.operators-list {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 8px;
}

.operators-list li {
  font-weight: 700;
  font-size: 14px;
  color: #e2e8f0;
}

.operators-list span {
  color: #25d366;
}

.message-box {
  background-color: rgba(0, 209, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
  font-size: 14px;
  color: #cbd5e1;
  border-left: 4px solid #00d1ff;
  text-align: left;
}

.btn-whatsapp {
  width: 100%;
  padding: 16px;
  background-color: #25d366;
  color: #050a18;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 15px;
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
  transition: transform 0.2s;
}

.btn-whatsapp:hover {
  transform: translateY(-2px);
}

.btn-back {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #ffffff;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Fade Transition for content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
