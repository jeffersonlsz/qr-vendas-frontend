<script setup>
import { RouterView } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'
import { useAlert } from '@/services/useAlert'

const { alertState, hideAlert } = useAlert()
</script>

<template>
  <RouterView />

  <!-- O Modal de Alerta Global fica aqui, pronto para ser ativado de qualquer lugar. -->
  <AlertModal
    :is-open="alertState.isOpen"
    :title="alertState.title"
    :message="alertState.message"
    :type="alertState.type"
    @close="hideAlert"
  />
</template>

<style>
/* Remove o reset e margin global padrão do Vite para que a tela não fique com bordas */
#app {
  max-width: 100%;
  margin: 0;
  padding: 0;
  display: block;
}
</style>
