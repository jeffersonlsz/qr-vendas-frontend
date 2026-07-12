<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  operadores: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'generate'])

const quantidade = ref(5)
const selectedOperadorId = ref(null)
const validationError = ref(false)


watch(quantidade, (newValue) => {
  if (newValue < 1) {
    quantidade.value = 1
  }
  if (newValue > 1000) {
    quantidade.value = 1000
  }
})

const handleGenerate = () => {
  validationError.value = false
  if (!selectedOperadorId.value) {
    validationError.value = true
    return
  }
  
  if (quantidade.value >= 1 && quantidade.value <= 1000) {
    emit('generate', { 
      quantidade: quantidade.value,
      operadorId: selectedOperadorId.value 
    })
  }
}

const handleClose = () => {
  if (!props.isSaving) {
    selectedOperadorId.value = null
    validationError.value = false
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Gerar cartões em lote</h2>
            <button class="close-btn" @click="handleClose" :disabled="isSaving">&times;</button>
          </div>
          
          <div class="modal-body">
            <p class="modal-description">
              Informe quantos cartões deverão ser criados e o operador responsável.
              <br>
              Cada cartão ficará disponível para posterior distribuição aos parceiros.
            </p>

            <div class="form-group">
              <label for="quantidade">Quantidade</label>
              <input 
                id="quantidade"
                type="number" 
                v-model.number="quantidade" 
                min="1" 
                max="1000" 
                class="form-control" 
                :disabled="isSaving"
              />
            </div>
            <div v-if="quantidade < 1 || quantidade > 1000" class="error-message">
              A quantidade deve ser entre 1 e 1000.
            </div>

            <div class="form-group">
              <label for="operador">Operador Responsável</label>
              <select 
                id="operador" 
                v-model="selectedOperadorId"
                class="form-control"
                :disabled="isSaving || !operadores.length"
              >
                <option :value="null" disabled>
                  {{ operadores.length ? 'Selecione um operador' : 'Nenhum operador disponível' }}
                </option>
                <option v-for="operador in operadores" :key="operador.id" :value="operador.id">
                  {{ operador.nome }}
                </option>
              </select>
            </div>
            <div v-if="validationError" class="error-message">
              É obrigatório selecionar um operador.
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose" :disabled="isSaving">Cancelar</button>
            <button 
              class="btn-success" 
              @click="handleGenerate" 
              :disabled="isSaving || quantidade < 1 || quantidade > 1000 || !selectedOperadorId"
            >
              <span v-if="isSaving">Gerando...</span>
              <span v-else>Gerar cartões</span>
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

.modal-body {
  padding: 24px;
}

.modal-description {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 12px;
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

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 8px;
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

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-success:disabled {
  background-color: #a7f3d0;
  cursor: not-allowed;
}

.theme-dark .modal-content {
  background: #1f2937;
}
.theme-dark .modal-header, .theme-dark .modal-footer {
  border-color: #374151;
}
.theme-dark .modal-header h2 {
  color: #f9fafb;
}
.theme-dark .modal-footer, .theme-dark .modal-body {
  background: #111827;
}

.theme-dark .modal-description {
    color: #9ca3af;
}

.theme-dark .form-group label {
  color: #d1d5db;
}
.theme-dark .form-control {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
.theme-dark .form-control:focus {
  border-color: #10b981;
}

.theme-dark .btn-cancel {
  background: #374151;
  color: #e5e7eb;
  border-color: #4b5563;
}
.theme-dark .btn-cancel:hover {
  background: #4b5563;
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
