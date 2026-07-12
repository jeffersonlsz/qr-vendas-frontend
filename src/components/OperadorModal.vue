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
/* Styles are inherited from the global scope (e.g., from QrGeneratorView.vue or style.css) */
/* This keeps the component lean and consistent with the project's design. */
</style>
