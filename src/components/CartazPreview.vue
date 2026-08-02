<script setup>
import { nextTick, watch } from 'vue';
import { ref, computed } from 'vue';
import QRCode from 'qrcode';
import EditableElement from './EditableElement.vue';

const props = defineProps({
  template: {
    type: Object,
    required: true
  },
  partnerCode: {
    type: String,
    default: ''
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  editMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:template']);

const containerRef = ref(null);





const editableElements = computed(() => {
  const elements = props.template.layout?.elements || {};
  console.log("Elementos encontrados:", Object.keys(elements));
  console.log(props.template.layout);
  console.log(JSON.stringify(props.template.layout, null, 2));
  console.log("");
  console.log("containerRef:", containerRef.value);
  
  console.log("");

  return Object.entries(elements).map(([id, config]) => ({
    id,
    ...config
  }));

  
});

watch(editableElements, async () => {
  await nextTick();

  const el = containerRef.value;

  console.log("clientWidth :", el.clientWidth);
  console.log("scrollWidth :", el.scrollWidth);

  console.log("clientHeight:", el.clientHeight);
  console.log("scrollHeight:", el.scrollHeight);
});

const handleElementUpdate = (update) => {
  emit('update:template', update);
};

const generateQRCode = async (canvas, size) => {
  if (props.qrCodeUrl && canvas) {
    try {
      await QRCode.toCanvas(canvas, props.qrCodeUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('Erro na renderização do QRCode:', err);
    }
  }
};

const partnerCodeStyle = (config) => {
  if (!containerRef.value) return {};
  const containerWidth = containerRef.value.offsetWidth;
  const fontSize = containerWidth * (config.fontSizePercent || 0.01);
  return {
    fontSize: `${fontSize}px`,
    color: '#4b5563', // Cor discreta
    fontWeight: 'normal',
  };
};
</script>

<template>
  <div class="poster-preview-container" ref="containerRef">
    <img :src="template.image" alt="Template do Cartaz" class="background-image" /> <!-- template.image ainda é passado no objeto geral -->

    <!-- Elementos Editáveis -->
    <EditableElement
      v-for="element in editableElements"
      :key="element.id"
      :element-id="element.id"
      :config="element"
      :edit-mode="editMode"
      :container-ref="containerRef"
      @update="handleElementUpdate"
    >
      <!-- Renderização condicional do conteúdo do elemento -->
      <template #default="{ canvasRef, size }">
        <canvas v-if="element.id === 'qr'" :ref="el => { if (el) { canvasRef = el; generateQRCode(el, size); } }" class="qr-code-canvas"></canvas>
        
        <div v-if="element.id === 'partnerCode'" :style="partnerCodeStyle(element)">
          {{ partnerCode }}
        </div>
      </template>
    </EditableElement>

  </div>
</template>

<style scoped>
.poster-preview-container {
  position: relative;
  width: 100%; height: 100%;
  display: block;
}
.background-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.qr-code-canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>