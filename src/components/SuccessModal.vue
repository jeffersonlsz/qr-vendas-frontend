<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  protocol: String
});

const emit = defineEmits(['close']);

const isLoading = ref(false);

const openWhatsApp = () => {
  isLoading.value = true;
  const message = encodeURIComponent(`Olá! Acabei de registrar uma solicitação de cotação. Meu protocolo é: ${props.protocol}. Gostaria de continuar o atendimento.`);
  const whatsappLink = `https://wa.me/5561986450951?text=${message}`;
  window.location.href = whatsappLink;
};

const close = () => {
  emit('close');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content glass-effect">
        <div class="success-container">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          <h1>Solicitação Recebida!</h1>
          <p class="subtitle">
            Um especialista irá analisar seu perfil e preparar uma proposta personalizada.
          </p>

          <div class="protocol-box">
            <span class="protocol-label">Protocolo</span>
            <span class="protocol-number">{{ protocol }}</span>
          </div>

          <button @click="openWhatsApp" :disabled="isLoading" class="btn-whatsapp">
            <span class="btn-text">{{ isLoading ? 'Redirecionando...' : 'Continuar no WhatsApp' }}</span>
          </button>

          <button @click="close" class="btn-back">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos do Modal (semelhantes ao SolicitacaoModal) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(5, 10, 24, 0.85); display: flex;
  justify-content: center; align-items: center; z-index: 1010;
  backdrop-filter: blur(10px);
}
.modal-content {
  background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
  padding: 40px 32px; border-radius: 32px; width: 90%; max-width: 420px;
  text-align: center; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.success-icon {
  color: #25d366;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  animation: pop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
  margin-bottom: 28px;
  line-height: 1.5;
}

.protocol-box {
  background: rgba(0, 209, 255, 0.05);
  border: 1px dashed rgba(0, 209, 255, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 28px;
}

.protocol-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #00d1ff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.protocol-number {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'monospace';
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
  margin-bottom: 12px;
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-whatsapp:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
}
.btn-whatsapp:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-back {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 8px;
}

.btn-back:hover {
  color: #ffffff;
}

/* Transições do Modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: scale(0.9) translateY(30px);
  opacity: 0;
}
</style>
