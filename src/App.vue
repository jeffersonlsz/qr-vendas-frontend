<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
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
