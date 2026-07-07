<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  partner: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  nome: '',
  telefone: '',
  percentual_comissao: 10,
  ativo: true
})

watch(() => props.partner, (newPartner) => {
  if (newPartner) {
    formData.value = {
      nome: newPartner.nome || '',
      telefone: newPartner.telefone || '',
      percentual_comissao: newPartner.percentual_comissao || 10,
      ativo: newPartner.ativo !== undefined ? newPartner.ativo : true,
    }
  }
})

const modalTitle = computed(() => {
  if (props.partner?.codigo_cartao) {
    return `Associar Cartão ${props.partner.codigo_cartao}`
  }
  return 'Associar Cartão'
})

const handleSave = () => {
  if (!formData.value.nome) {
    alert('O nome é obrigatório.')
    return
  }
  emit('save', { ...formData.value })
}

const handleClose = () => {
  if (!props.isSaving) {
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
            <h2>{{ modalTitle }}</h2>
            <button class="close-btn" @click="handleClose" :disabled="isSaving">&times;</button>
          </div>
          
          <div v-if="partner" class="modal-body">
            <div class="card-info-header">
              <span class="code-highlight">{{ partner.codigo_cartao }}</span>
              <span class="status-badge status-available">Disponível</span>
            </div>

            <div class="form-group">
              <label for="nome">Nome do Parceiro *</label>
              <input 
                id="nome"
                type="text" 
                v-model="formData.nome" 
                class="form-control" 
                :disabled="isSaving"
                placeholder="Ex: João da Silva"
              />
            </div>
            
            <div class="form-group">
              <label for="telefone">Telefone / WhatsApp</label>
              <input 
                id="telefone"
                type="text" 
                v-model="formData.telefone" 
                class="form-control" 
                :disabled="isSaving"
                placeholder="(61) 99999-9999"
              />
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="comissao">Comissão (%)</label>
                <input 
                  id="comissao"
                  type="number" 
                  v-model.number="formData.percentual_comissao" 
                  class="form-control" 
                  :disabled="isSaving"
                  min="0"
                  max="100"
                />
              </div>
              
              <div class="form-group switch-group">
                <label for="ativo">Status</label>
                <label class="switch">
                  <input type="checkbox" v-model="formData.ativo" :disabled="isSaving" id="ativo">
                  <span class="slider round"></span>
                </label>
                <span class="switch-label">{{ formData.ativo ? 'Ativo' : 'Inativo' }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose" :disabled="isSaving">Cancelar</button>
            <button 
              class="btn-success" 
              @click="handleSave" 
              :disabled="isSaving || !formData.nome"
            >
              <span v-if="isSaving">Salvando...</span>
              <span v-else>Associar Cartão</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Base Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.modal-content { background: #ffffff; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 24px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1f2937; }
.close-btn { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #4b5563; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 12px; }

/* Card Info Header */
.card-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}
.code-highlight { font-size: 1.1rem; font-weight: 700; color: #1f2937; }
.status-badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.status-available { background: #fef08a; color: #a16207; }

/* Form Styles */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
.form-control { width: 100%; padding: 12px 16px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; color: #1f2937; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
.form-control:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.form-control:disabled { background: #f9fafb; cursor: not-allowed; }

/* Buttons */
.btn-cancel, .btn-success { padding: 10px 20px; border-radius: 8px; font-size: 0.95rem; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-cancel { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }
.btn-success:disabled { background-color: #a7f3d0; cursor: not-allowed; }

/* Switch Toggle */
.switch-group { display: flex; flex-direction: column; align-items: flex-start; }
.switch { position: relative; display: inline-block; width: 52px; height: 28px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #10b981; }
input:focus + .slider { box-shadow: 0 0 1px #10b981; }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 28px; }
.slider.round:before { border-radius: 50%; }
.switch-label { margin-top: 4px; font-size: 0.8rem; color: #6b7280; margin-left: 4px;}

/* Dark Theme */
.theme-dark .modal-content { background: #1f2937; }
.theme-dark .modal-header, .theme-dark .modal-footer { border-color: #374151; }
.theme-dark .modal-header h2 { color: #f9fafb; }
.theme-dark .modal-footer, .theme-dark .modal-body { background: #111827; }
.theme-dark .card-info-header { background: #374151; }
.theme-dark .code-highlight { color: #f9fafb; }
.theme-dark .status-available { background: #a16207; color: #fef08a; }
.theme-dark .form-group label { color: #d1d5db; }
.theme-dark .form-control { background: #374151; border-color: #4b5563; color: #f9fafb; }
.theme-dark .form-control:disabled { background: #1f2937; }
.theme-dark .btn-cancel { background: #374151; color: #e5e7eb; border-color: #4b5563; }
.theme-dark .btn-cancel:hover { background: #4b5563; }
.theme-dark .switch-label { color: #9ca3af; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .modal-content { animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-leave-active .modal-content { animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse; }
@keyframes modal-in {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
