<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue';
import CartazPreview from './CartazPreview.vue';
import { templateService } from '../services/templateService';

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  partner: {
    type: Object,
    default: null,
  },
  template: {
    type: Object,
    required: true,
  },
  templates: {
    type: Array,
    default: () => []
  },
  templateImages: {
    type: Object,
    default: () => ({})
  },
  selectedTemplateId: {
    type: String,
    default: null
  },
  isPrinting: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close', 'print', 'save-layout', 'update:selectedTemplateId']);

const internalSelectedTemplateId = computed({
  get: () => props.selectedTemplateId,
  set: (value) => emit('update:selectedTemplateId', value)
});

const cartazData = computed(() => {
  if (!props.partner) return null;
  const BASE_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const qrCodeUrl = `${BASE_URL}/lp?ref=${props.partner.id}`;
  return {
    qrCodeUrl: qrCodeUrl,
  };
});

// --- Lógica do Modo de Edição de Template ---
const editMode = ref(false);
const loadingLayout = ref(false);
const editedTemplate = reactive({ layout: { elements: { qr: {} } } });

const handleTemplateUpdate = (newConfig) => {
  // Atualiza a configuração de um elemento específico
  Object.assign(editedTemplate.layout.elements[newConfig.id], newConfig.data);
};

// --- Lógica de Escala Dinâmica ---
const previewArea = ref(null);
const posterScale = ref(0.3); // Valor inicial
let resizeObserver = null;

const calculateScale = () => {
  if (previewArea.value) {
    const availableHeight = previewArea.value.clientHeight;
    const posterHeightMM = 297; // A4 height
    // Fator de conversão aproximado de mm para pixels em uma tela padrão.
    // Este valor pode precisar de ajuste fino, mas 3.78 é um bom ponto de partida (96 DPI).
    const posterHeightPX = posterHeightMM * 3.78; 
    
    // Calcula a escala para que o cartaz ocupe ~75% da altura disponível, com um pouco de margem.
    const scale = (availableHeight * 0.82) / posterHeightPX;

    // Define uma escala mínima para evitar que o cartaz fique ilegível em telas muito pequenas
    posterScale.value = Math.max(0.2, scale);
  }
};

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    console.group("=== MODAL CARTAZ ABERTO ===");
    console.log("Partner completo:", props.partner);
    console.log("codigo_cartao:", props.partner?.codigo_cartao);
    console.log("Template:", props.template);
    console.log("cartazData:", cartazData.value);
    console.groupEnd();
    editMode.value = false;
    // Garante que o cálculo da escala ocorra após o modal estar visível
    setTimeout(calculateScale, 50);
    // Carrega o layout do template selecionado ao abrir o modal
    await fetchAndApplyLayout(props.template);
  }
});

const fetchAndApplyLayout = async (template) => {
  loadingLayout.value = true;
  // 1. Define o layout de fallback imediatamente
  Object.assign(editedTemplate, JSON.parse(JSON.stringify(template)));
  console.log("1 - Após copiar template:");
 console.log(JSON.stringify(editedTemplate.layout.elements, null, 2));
  try {
    // 2. Tenta buscar o layout salvo no backend
    console.log("Template original:", template.layout.elements);
    const savedLayout = await templateService.getLayout(template.id);
    
    console.log("2 - Layout vindo do backend:");
    console.log(JSON.stringify(savedLayout.elements, null, 2));
    if (savedLayout && savedLayout.elements) {
      //Object.assign(editedTemplate.layout, savedLayout);
      editedTemplate.layout = {
        ...editedTemplate.layout,
        ...savedLayout,
        elements: {
          ...editedTemplate.layout.elements,
          ...savedLayout.elements
        }
      };
      console.log("3 - Após Object.assign:");
      console.log(JSON.stringify(editedTemplate.layout.elements, null, 2));
      
    }
  } catch (error) {
    // Se der 404 ou outro erro, o fallback já está em uso. Não é necessário fazer nada.
  } finally {
    loadingLayout.value = false;
  }
};

onMounted(() => {
  if (previewArea.value) {
    resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(previewArea.value);
  }
});

// Assiste a mudanças no template selecionado no componente pai e atualiza a cópia local.
// Isso garante que a troca de modelo no ComboBox reflita na imagem de preview.
watch(() => props.selectedTemplateId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    const baseTemplate = props.templates.find(t => t.id === newId);
    const newTemplate = {
      ...baseTemplate,
      image: props.templateImages[baseTemplate.image]
    };
    await fetchAndApplyLayout(newTemplate);
  }
});

onUnmounted(() => {
  if (resizeObserver && previewArea.value) {
    resizeObserver.unobserve(previewArea.value);
  }
});

const handleClose = () => {
  if (!props.isPrinting) {
    emit('close');
  }
};

const handlePrint = () => {
  emit('print');
};

const handleExitEditMode = () => {
  // 1. Capturar as coordenadas atuais do QR.
  // 2. Montar o objeto de layout.
  const newLayout = {
    version: 1, // ou props.template.layout.version
    elements: JSON.parse(JSON.stringify(editedTemplate.layout.elements))
  };
console.log(
  "LAYOUT ENVIADO AO PAI:",
  JSON.stringify(newLayout, null, 2)
);
  // 3. Enviar o objeto para o componente pai persistir
  emit('save-layout', { templateId: props.template.id, layout: newLayout });
  editMode.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <div class="modal-content">
            <!-- Cabeçalho -->
            <div class="modal-header">
              <div class="header-title">
                <div class="header-icon">🖼️</div>
                <div>
                  <h2 class="modal-title">Pré-visualização do Cartaz</h2>
                  <p class="modal-subtitle">Confira como o material será impresso antes de gerar o PDF.</p>
                </div>
              </div>
              <button class="close-btn" @click="handleClose" :disabled="isPrinting" aria-label="Fechar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>

            <!-- Corpo Principal (Layout Bipartido) -->
            <div class="modal-body-wrapper">
              <!-- Área de Pré-visualização (Esquerda) -->
              <div class="preview-area" ref="previewArea">
                <div class="poster-wrapper-outer">
                  <Transition name="poster-fade">
                    <div 
                      v-if="open"
                      class="poster-wrapper-inner" 
                      id="poster-preview-content-wrapper"
                      :style="{ transform: `scale(${posterScale})` }"
                    >
                      <div v-if="loadingLayout" class="layout-loading-state">
                        <div class="loading-spinner"></div>
                        <p>Carregando layout...</p>
                      </div>

                      <CartazPreview
                        v-else-if="partner && cartazData"
                        :template="editedTemplate"
                        :qr-code-url="cartazData.qrCodeUrl"
                        :partner-code="partner.codigo_cartao"
                        :edit-mode="editMode"
                        @update:template="handleTemplateUpdate"
                      />
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Painel de Informações (Direita) -->
              <aside class="info-panel" :class="{ 'info-panel-editing': editMode }">
                <!-- Painel Padrão -->
                <div v-if="!editMode">
                  <div class="info-card">
                    <label for="template-select" class="info-label">Modelo</label>
                    <select id="template-select" v-model="internalSelectedTemplateId" class="form-control-select">
                      <option 
                        v-for="tpl in templates" 
                        :key="tpl.id" 
                        :value="tpl.id">
                        {{ tpl.name }}
                      </option>
                    </select>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Formato</span>
                    <span class="info-value">A4 Retrato</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">QR Code</span>
                    <span class="info-value success-text">✓ Será incorporado automaticamente</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Parceiro</span>
                    <span class="info-value">{{ partner?.nome || 'N/A' }}</span>
                  </div>
                  <div v-if="partner?.codigo_cartao" class="info-card">
                    <span class="info-label">Código</span>
                    <span class="info-value">{{ partner.codigo_cartao }}</span>
                  </div>
                </div>

                <!-- Painel de Edição -->
                <div v-if="editMode" class="edit-panel-content">
                  <h4>Ajuste de Elementos</h4>
                  <p class="edit-panel-subtitle">Arraste ou redimensione o QR Code na pré-visualização.</p>

                  <div v-for="(element, key) in editedTemplate.layout.elements" :key="key" class="info-card">
                    <span class="info-label" style="text-transform: capitalize;">{{ key }}</span>
                    <div class="element-coords">
                      <span>X: {{ (element.leftPercent * 100).toFixed(1) }}%</span>
                      <span>Y: {{ (element.topPercent * 100).toFixed(1) }}%</span>
                      <span v-if="element.sizePercent">W: {{ (element.sizePercent * 100).toFixed(1) }}%</span>
                      <span v-if="element.fontSizePercent">F: {{ (element.fontSizePercent * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>

                <div class="info-card">
                  <p v-if="!editMode" class="info-card-note-text">Os elementos dinâmicos serão gerados automaticamente no PDF final.</p>
                  <p v-else class="info-card-note-text">Clique em "Sair do Modo de Ajuste" para salvar a nova configuração do template.</p>
                </div>
              </aside>
            </div>

            <!-- Rodapé -->
            <div class="modal-footer">
              <div class="footer-info">
                <span>📄 Formato A4</span>
                <span>•</span>
                <span>✓ QR incorporado</span>
                <span>•</span>
                <span>Pronto para impressão</span>
              </div>
              <button class="btn btn-text" @click="editMode ? handleExitEditMode() : (editMode = true)">
                {{ editMode ? 'Sair do Modo de Ajuste' : 'Modo de Ajuste' }}
              </button>
              <div class="footer-actions">
                <button class="btn btn-cancel" @click="handleClose" :disabled="isPrinting">Cancelar</button>
                <button class="btn btn-success" @click="handlePrint" :disabled="isPrinting">
                  <svg v-if="isPrinting" class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  <span>{{ isPrinting ? 'Gerando PDF...' : 'Imprimir PDF' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Estilo para o novo select */
.form-control-select {
  width: 100%;
  padding: 8px 12px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: var(--modal-text);
  font-size: 0.9rem;
  font-weight: 500;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
/* --- Variáveis de Estilo --- */
:host {
  --modal-bg: #ffffff;
  --modal-text: #1f2937;
  --modal-subtitle-text: #6b7280;
  --modal-border-color: #5c74a3;
  --preview-bg: #f3f4f6;
  --btn-primary-bg: #10b981;
  --btn-primary-hover-bg: #059669;
  --btn-primary-disabled-bg: #a7f3d0;
  --btn-secondary-bg: #ffffff;
  --btn-secondary-text: #374151;
  --btn-secondary-border: #d1d5db;
  --btn-secondary-hover-bg: #f9fafb;
}

/* --- Overlay e Animação de Entrada --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5); /* Fundo branco semi-transparente */
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-enter-active .modal-container { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-enter-from .modal-container { transform: scale(0.95); opacity: 0; }
.fade-leave-active .modal-container { transition: all 0.2s ease; }
.fade-leave-to .modal-container { transform: scale(0.95); opacity: 0; }

.poster-fade-enter-active { transition: opacity 0.2s ease 0.1s; }
.poster-fade-enter-from { opacity: 0; }

/* --- Estrutura Principal do Modal --- */
.modal-container {
  width: 100%;
  height: 100%;
  padding: 5vh 5vw;
  box-sizing: border-box;
  color: rgb(61, 27, 27);
}

.modal-content {
  background: var(--preview-bg);
  border-radius: 12px;
  width: 100%;
  height: 90vh;
  max-height: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* --- Cabeçalho --- */
.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #c1b7b7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: var(--modal-bg);
}

.header-title { display: flex; align-items: center; gap: 12px; }
.header-icon { font-size: 1.25rem; color: #000000; } /* Ícone preto */
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #000000; } /* Título preto */
.modal-subtitle { margin: 2px 0 0; font-size: 0.85rem; color: var(--modal-subtitle-text); }

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}
.close-btn:hover:not(:disabled) { background: #e5e7eb; color: #1f2937; }
.close-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* --- Corpo Principal (Wrapper) --- */
.modal-body-wrapper {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  border-top: 1px solid var(--modal-border-color);
}

/* --- Área de Pré-visualização (Esquerda) --- */
.preview-area {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 2rem;
  background: var(--preview-bg);
}

.poster-wrapper-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.poster-wrapper-inner {
  width: 210mm;
  height: 297mm;
  transform-origin: center center;
  transition: transform 0.3s ease-out;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,0.05);
  border-radius: 8px;
  background: white;
  flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.05);
}

/* --- Painel de Informações (Direita) --- */
.info-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--modal-bg);
  border-left: 1px solid var(--modal-border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.info-panel-editing {
  background-color: #f9fafb; /* Fundo ligeiramente diferente em modo de edição */
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--modal-border-color);
}
.info-panel .edit-panel-content > .info-card:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.info-panel div > .info-card:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.info-panel .edit-panel-content > .info-card:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--modal-subtitle-text);
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--modal-text);
}
.info-value.monospace {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  font-weight: 600;
}

.success-text {
  color: var(--btn-primary-bg);
  font-weight: 600;
}

.info-card-note-text {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: auto; /* Empurra para o final */
}
.info-card-note-text {
  margin: 0;
  font-size: 0.8rem;
  color: var(--modal-subtitle-text);
  line-height: 1.5;
}

.edit-panel-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--modal-text);
}

.edit-panel-content .edit-panel-subtitle {
  font-size: 0.85rem;
  color: var(--modal-subtitle-text);
  margin: 0 0 1.5rem 0;
}

.element-coords {
  display: flex;
  gap: 12px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

/* --- Rodapé --- */
.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--modal-bg);
  border-top: 1px solid #c1b7b7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 1rem;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--modal-subtitle-text);
}
.footer-info span {
  white-space: nowrap;
}

.footer-actions { display: flex; gap: 0.75rem; margin-left: auto; }

/* --- Botões --- */
.btn { padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-text { background: transparent; color: #4b5563; }
.btn-text:hover:not(:disabled) { background: #f3f4f6; }
.btn-cancel { background: var(--btn-secondary-bg); color: var(--btn-secondary-text); border: 1px solid var(--btn-secondary-border); }
.btn-cancel:hover:not(:disabled) { background: var(--btn-secondary-hover-bg); }
.btn-success { 
  background: var(--btn-primary-bg) !important; /* Garante o fundo verde */
  color: #fff !important; /* Força a cor do texto e do SVG para branco */
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}
.btn-success:hover:not(:disabled) { 
  background: var(--btn-primary-hover-bg) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}
.btn:disabled { cursor: not-allowed; opacity: 0.7; }
.btn-success:disabled { 
  background-color: var(--btn-primary-disabled-bg) !important;
}

/* --- Spinner --- */
.spinner { animation: rotate 2s linear infinite; width: 18px; height: 18px; }
.path { stroke: currentColor; stroke-linecap: round; animation: dash 1.5s ease-in-out infinite; }
@keyframes rotate { 100% { transform: rotate(360deg); } }
@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.layout-loading-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* --- Responsividade --- */
@media (max-width: 900px) {
  .modal-body-wrapper {
    flex-direction: column;
    overflow-y: auto;
  }
  .info-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--modal-border-color);
  }
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .footer-info {
    justify-content: center;
    flex-wrap: wrap;
  }
  .footer-actions {
    justify-content: flex-end;
  }
}
</style>
