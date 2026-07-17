<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Atenção'
  },
  message: String,
  type: {
    type: String,
    default: 'warning' // pode ser 'warning', 'error', 'success', 'info'
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const iconPath = computed(() => {
  switch (props.type) {
    case 'error':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
    case 'success':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    case 'info':
      return 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z';
    case 'warning':
    default:
      return 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
  }
});

const iconClass = computed(() => {
  return `icon-${props.type}`;
});
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content glass-effect">
        <div class="alert-container">
          <div class="alert-icon" :class="iconClass">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path :d="iconPath" />
            </svg>
          </div>

          <h2>{{ title }}</h2>
          <p class="subtitle">
            {{ message }}
          </p>

          <button @click="close" class="btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(5, 10, 24, 0.85); display: flex;
  justify-content: center; align-items: center; z-index: 1050;
  backdrop-filter: blur(10px);
}
.modal-content {
  background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
  padding: 40px 32px; border-radius: 32px; width: 90%; max-width: 400px;
  text-align: center; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.alert-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 24px;
  animation: pop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.icon-warning { color: #facc15; } /* Amarelo */
.icon-error { color: #f87171; } /* Vermelho */
.icon-success { color: #4ade80; } /* Verde */
.icon-info { color: #60a5fa; } /* Azul */

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}

.subtitle {
  color: #cbd5e1;
  font-size: 15px;
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
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