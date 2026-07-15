<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close', 'save']);

const operador = ref({
  nome: '',
  telefone: '',
});

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    operador.value = {
      nome: '',
      telefone: '',
    };
  }
});

const handleSave = () => {
  if (!operador.value.nome || !operador.value.telefone) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }
  emit('save', { ...operador.value });
};

const handleClose = () => {
  if (!props.isSaving) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Novo Operador</h2>
            <button class="close-btn" @click="handleClose" :disabled="isSaving">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="nome">Nome do operador *</label>
              <input 
                id="nome"
                type="text" 
                v-model="operador.nome" 
                placeholder="Ex: João Silva" 
                class="form-control" 
              />
            </div>
            
            <div class="form-group">
              <label for="telefone">WhatsApp *</label>
              <input 
                id="telefone"
                type="text" 
                v-model="operador.telefone" 
                placeholder="(61) 99999-9999" 
                class="form-control" 
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose" :disabled="isSaving">Cancelar</button>
            <button class="btn-success" @click="handleSave" :disabled="isSaving">
              <span v-if="isSaving">Salvando...</span>
              <span v-else>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.close-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-success {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-cancel:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-success:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
