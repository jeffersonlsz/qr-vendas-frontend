<script setup>
import { ref, computed, reactive } from 'vue';

const props = defineProps({
  elementId: { type: String, required: true },
  config: { type: Object, required: true },
  editMode: { type: Boolean, default: false },
  containerRef: { type: Object, default: null }
});

const emit = defineEmits(['update']);

const isDragging = ref(false);
const isResizing = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const initialResizeConfig = reactive({ x: 0, size: 0, font: 0 });

const elementRef = ref(null);
const canvasRef = ref(null);

const guideLines = reactive({ vertical: null, horizontal: null });

const pixelToPercent = (pixelValue, totalPixels) => totalPixels > 0 ? pixelValue / totalPixels : 0;
const percentToPixel = (percentValue, totalPixels) => percentValue * totalPixels;

const elementStyle = computed(() => {
  if (!props.containerRef) return {};
  const containerWidth = props.containerRef.offsetWidth;
  const size = percentToPixel(props.config.sizePercent || 0, containerWidth);

  const style = {
    top: `${props.config.topPercent * 100}%`,
    left: `${props.config.leftPercent * 100}%`,
  };

  if (props.config.sizePercent) {
    style.width = `${size}px`;
    style.height = `${size}px`;
  }

  return style;
});

const sizeInPixels = computed(() => {
  if (!props.containerRef) return 0;
  return percentToPixel(props.config.sizePercent || 0, props.containerRef.offsetWidth);
});

const startDrag = (event) => {
  if (!props.editMode) return;
  isDragging.value = true;
  const rect = event.currentTarget.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event) => {
  if (!isDragging.value || !props.containerRef) return;
  const containerRect = props.containerRef.getBoundingClientRect();
  const newX = event.clientX - containerRect.left - dragOffsetX.value;
  const newY = event.clientY - containerRect.top - dragOffsetY.value;

  const newLeftPercent = pixelToPercent(newX, containerRect.width);
  const newTopPercent = pixelToPercent(newY, containerRect.height);

  emit('update', { id: props.elementId, data: { ...props.config, leftPercent: newLeftPercent, topPercent: newTopPercent } });

  const size = percentToPixel(props.config.sizePercent || 0, containerRect.width);
  const centerX = newX + size / 2;
  const centerY = newY + size / 2;
  guideLines.vertical = Math.abs(centerX - containerRect.width / 2) < 5 ? '50%' : null;
  guideLines.horizontal = Math.abs(centerY - containerRect.height / 2) < 5 ? '50%' : null;
};

const stopDrag = () => {
  isDragging.value = false;
  guideLines.vertical = null;
  guideLines.horizontal = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event, config) => {
  event.stopPropagation();
  if (!props.editMode) return;
  isResizing.value = true;

  // Armazena a posição inicial e os valores para o cálculo do delta
  initialResizeConfig.x = event.clientX;
  initialResizeConfig.size = config.sizePercent || 0;
  initialResizeConfig.font = config.fontSizePercent || 0;

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (event) => {
  if (!isResizing.value || !props.containerRef || !elementRef.value) return;

  const containerRect = props.containerRef.getBoundingClientRect();
  const deltaX = event.clientX - initialResizeConfig.x;
  const deltaPercent = pixelToPercent(deltaX, containerRect.width);

  const updatedData = { ...props.config };

  if (props.config.sizePercent !== undefined) {
    // Lógica para elementos com tamanho (como QR Code)
    updatedData.sizePercent = Math.max(0.01, initialResizeConfig.size + deltaPercent);
  } else if (props.config.fontSizePercent !== undefined) {
    // Lógica para elementos com fonte (como partnerCode)
    // O fator 0.5 torna o ajuste de fonte menos sensível que o de tamanho
    updatedData.fontSizePercent = Math.max(0.005, initialResizeConfig.font + (deltaPercent * 0.5));
  }

  emit('update', { id: props.elementId, data: updatedData });
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};
</script>

<template>
  <div
    ref="elementRef"
    class="editable-element"
    :class="{ 'edit-mode': editMode, 'dragging': isDragging }"
    :style="elementStyle"
    @mousedown="startDrag"
  >
    <slot :canvasRef="canvasRef" :size="sizeInPixels"></slot>
    <div v-if="editMode && (config.sizePercent || config.fontSizePercent)" class="resize-handle" @mousedown.stop="startResize($event, config)"></div>
  </div>

  <!-- Linhas-guia -->
  <div v-if="guideLines.vertical" class="guide-line vertical" :style="{ left: guideLines.vertical }"></div>
  <div v-if="guideLines.horizontal" class="guide-line horizontal" :style="{ top: guideLines.horizontal }"></div>
</template>

<style scoped>
.editable-element {
  position: absolute;
  /* Adiciona um mínimo de tamanho para elementos de texto serem clicáveis */
  min-width: 10px;
  min-height: 10px;
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
  z-index: 100;
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
  z-index: 101;
}

.guide-line {
  position: absolute;
  background-color: rgba(255, 0, 255, 0.8);
  z-index: 99;
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
</style>