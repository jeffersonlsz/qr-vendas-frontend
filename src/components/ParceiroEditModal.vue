<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  partner: Object,
});

const emit = defineEmits(['update:modelValue', 'save']);

const partnerData = ref({});

watch(() => props.partner, (newVal) => {
  if (newVal) {
    partnerData.value = { ...newVal };
  } else {
    partnerData.value = {};
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = () => {
  emit('save', partnerData.value);
  close();
};
</script>

<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Parceiro</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" v-model="partnerData.nome" class="form-control" />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="text" v-model="partnerData.telefone" class="form-control" />
          </div>
          <div class="form-group">
            <label>Percentual Comissão</label>
            <input type="number" step="0.01" v-model="partnerData.percentual_comissao" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="close" class="btn-cancel">Cancelar</button>
          <button @click="save" class="btn-success">Salvar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.close-btn {
    cursor: pointer;
    border: none;
    background: none;
    font-size: 1.5rem;
}
.form-group {
  margin-bottom: 15px;
}
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}
.btn-cancel, .btn-success {
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}
.btn-cancel {
    background-color: #f0f0f0;
}
.btn-success {
    background-color: #10b981;
    color: white;
}
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
