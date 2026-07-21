<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  template: {
    type: Object,
    required: true
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
const qrCodeCanvas = ref(null);

// A estrutura agora pode ser { layout: { elements: { qr: ... } } }
const originalTemplate = JSON.parse(JSON.stringify(props.template.layout?.elements || props.template.elements || {}));

// --- Lógica de Elementos Editáveis ---
const elements = reactive({
  qr: {
    id: 'qr',
    ...(props.template.layout?.elements?.qr || props.template.elements?.qr || {}),
    isDragging: false,
    isResizing: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
  }
});

const activeElementId = ref(null);
const guideLines = reactive({
  vertical: null,
  horizontal: null,
});

// Converte as coordenadas de pixel para percentual
const pixelToPercent = (pixelValue, totalPixels) => pixelValue / totalPixels;

// Converte as coordenadas de percentual para pixel
const percentToPixel = (percentValue, totalPixels) => percentValue * totalPixels;

const elementStyle = computed(() => {
  if (!containerRef.value) return {};
  const containerWidth = containerRef.value.offsetWidth;
  const containerHeight = containerRef.value.offsetHeight;

  const el = elements.qr;
  const size = percentToPixel(el.sizePercent, containerWidth);

  return {
    top: `${el.topPercent * 100}%`,
    left: `${el.leftPercent * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
  };
});

const startDrag = (event, elementId) => {
  if (!props.editMode) return;
  activeElementId.value = elementId;
  const el = elements[elementId];
  el.isDragging = true;

  const rect = event.currentTarget.getBoundingClientRect();
  el.dragOffsetX = event.clientX - rect.left;
  el.dragOffsetY = event.clientY - rect.top;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event) => {
  const el = elements[activeElementId.value];
  if (!el || !el.isDragging || !containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const newX = event.clientX - containerRect.left - el.dragOffsetX;
  const newY = event.clientY - containerRect.top - el.dragOffsetY;

  el.leftPercent = pixelToPercent(newX, containerRect.width);
  el.topPercent = pixelToPercent(newY, containerRect.height);

  // Lógica das linhas-guia
  const centerX = newX + (percentToPixel(el.sizePercent, containerRect.width) / 2);
  const centerY = newY + (percentToPixel(el.sizePercent, containerRect.width) / 2);

  guideLines.vertical = Math.abs(centerX - containerRect.width / 2) < 5 ? '50%' : null;
  guideLines.horizontal = Math.abs(centerY - containerRect.height / 2) < 5 ? '50%' : null;
};

const stopDrag = () => {
  const el = elements[activeElementId.value];
  if (el) {
    el.isDragging = false;
    emitUpdate();
  }
  activeElementId.value = null;
  guideLines.vertical = null;
  guideLines.horizontal = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event, elementId) => {
  event.stopPropagation();
  if (!props.editMode) return;
  activeElementId.value = elementId;
  const el = elements[elementId];
  el.isResizing = true;

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (event) => {
  const el = elements[activeElementId.value];
  if (!el || !el.isResizing || !containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const elementRect = qrCodeCanvas.value.parentElement.getBoundingClientRect();

  const newWidth = event.clientX - elementRect.left;
  el.sizePercent = pixelToPercent(newWidth, containerRect.width);
};

const stopResize = () => {
  const el = elements[activeElementId.value];
  if (el) {
    el.isResizing = false;
    emitUpdate();
  }
  activeElementId.value = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

const emitUpdate = () => {
  // Emite a estrutura completa para ser compatível com o novo formato
  emit('update:template', { elements: { qr: { ...elements.qr } } });
};

const resetPosition = () => {
  // Acessa a configuração original do QR dentro de 'elements'
  Object.assign(elements.qr, originalTemplate.qr);
  emitUpdate();
};

const copyConfig = () => {
  // Monta o objeto completo para ser copiado
  const config = {
    version: 1,
    elements: {
      qr: {
        leftPercent: parseFloat(elements.qr.leftPercent.toFixed(4)),
        topPercent: parseFloat(elements.qr.topPercent.toFixed(4)),
        sizePercent: parseFloat(elements.qr.sizePercent.toFixed(4)),
      }
    }
  };
  navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  alert('Configuração de layout copiada para a área de transferência!');
};

const generateQRCode = async () => {
  if (props.qrCodeUrl && qrCodeCanvas.value) {
    try {
      const containerWidth = containerRef.value.offsetWidth;
      const sizeInPixels = percentToPixel(elements.qr.sizePercent, containerWidth);

      await QRCode.toCanvas(qrCodeCanvas.value, props.qrCodeUrl, {
        width: sizeInPixels,
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

watch(() => [elements.qr.sizePercent, props.qrCodeUrl], generateQRCode, { deep: true });

onMounted(generateQRCode);
</script>

<template>
  <div class="poster-preview-container" ref="containerRef">
    <img :src="template.image" alt="Template do Cartaz" class="background-image" /> <!-- template.image ainda é passado no objeto geral -->

    <!-- Elemento Editável (QR Code) -->
    <div 
      class="editable-element"
      :class="{ 'edit-mode': editMode, 'dragging': elements.qr.isDragging }"
      :style="elementStyle"
      @mousedown="startDrag($event, 'qr')"
    >
      <canvas ref="qrCodeCanvas" class="qr-code-canvas"></canvas>
      <div v-if="editMode" class="resize-handle" @mousedown.stop="startResize($event, 'qr')"></div>
    </div>

    <!-- Linhas-guia -->
    <div v-if="guideLines.vertical" class="guide-line vertical" :style="{ left: guideLines.vertical }"></div>
    <div v-if="guideLines.horizontal" class="guide-line horizontal" :style="{ top: guideLines.horizontal }"></div>

    <!-- UI de Edição -->
    <div v-if="editMode" class="edit-toolbar">
      <button @click="resetPosition" title="Resetar Posição">↺</button>
      <button @click="copyConfig" title="Copiar Configuração">📋</button>
    </div>
  </div>
</template>

<style scoped>
.poster-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
}
.background-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* --- Modo de Edição --- */
.editable-element {
  position: absolute;
}
.editable-element.edit-mode {
  border: 2px dashed rgba(23, 107, 222, 0.7);
  cursor: move;
  transition: border-color 0.2s;
}
.editable-element.edit-mode:hover {
  border-color: rgba(23, 107, 222, 1);
}
.editable-element.dragging {
  border-style: solid;
  opacity: 0.8;
}
.qr-code-canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.resize-handle {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #176bde;
  border-radius: 50%;
  cursor: nwse-resize;
}
.guide-line {
  position: absolute;
  background-color: rgba(255, 0, 255, 0.8);
  z-index: 10;
}
.guide-line.vertical {
  width: 1px;
  height: 100%;
  top: 0;
}
.guide-line.horizontal {
  height: 1px;
  width: 100%;
  left: 0;
}
.edit-toolbar {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 20;
}
.edit-toolbar button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-toolbar button:hover {
  background: rgba(255,255,255,0.15);
}
.edit-toolbar .btn-save {
  background-color: #176bde;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 12px;
  width: auto;
}
</style>