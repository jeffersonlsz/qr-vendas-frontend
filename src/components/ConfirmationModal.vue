<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Confirmar Ação'
  },
  message: String,
});

const emit = defineEmits(['close', 'confirm']);

const close = () => {
  emit('close');
};

const confirm = () => {
  emit('confirm');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content glass-effect">
        <div class="alert-container">
          <div class="alert-icon icon-warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>

          <h2>{{ title }}</h2>
          <p class="subtitle">
            {{ message }}
          </p>

          <div class="button-group">
            <button @click="close" class="btn-secondary">
              Cancelar
            </button>
            <button @click="confirm" class="btn-danger">
              Confirmar
            </button>
          </div>
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
}

.icon-warning { color: #facc15; }

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

.button-group {
  display: flex;
  gap: 12px;
}

.btn-secondary, .btn-danger {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

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
