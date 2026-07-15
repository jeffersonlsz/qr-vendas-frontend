<script setup>
import { ref, computed } from 'vue';
import html2pdf from 'html2pdf.js';
import CartazTemplate from './CartazTemplate.vue';

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  partner: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const cartazContainer = ref(null);
const isPrinting = ref(false);

const cartazData = computed(() => {
  if (!props.partner) return null;
  const qrCodeUrl = `https://qr-saude-alpha.web.app/lp?ref=${props.partner.id}`;
  return {
    partnerName: props.partner.nome,
    partnerCode: props.partner.codigo_cartao,
    qrCodeUrl: qrCodeUrl,
    partnerId: props.partner.id,
  };
});

const handleClose = () => {
  if (!isPrinting.value) {
    emit('close');
  }
};

const handlePrint = async () => {
  if (isPrinting.value || !cartazContainer.value?.$el) {
    return;
  }
  isPrinting.value = true;

  try {
    await document.fonts.ready;
    const element = cartazContainer.value.$el;
    const filename = `cartaz-${props.partner.codigo_cartao}.pdf`;
    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
  } finally {
    isPrinting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Pré-visualização do Cartaz</h2>
            <button class="close-btn" @click="handleClose" :disabled="isPrinting">&times;</button>
          </div>
          
          <div v-if="partner" class="modal-body">
            <CartazTemplate 
              ref="cartazContainer" 
              v-if="cartazData"
              :partnerName="cartazData.partnerName"
              :partnerCode="cartazData.partnerCode"
              :qrCodeUrl="cartazData.qrCodeUrl"
              :partnerId="cartazData.partnerId"
            />
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose" :disabled="isPrinting">Fechar</button>
            <button 
              class="btn-success" 
              @click="handlePrint" 
              :disabled="isPrinting"
            >
              <span v-if="isPrinting">Imprimindo...</span>
              <span v-else>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.modal-content { background: #ffffff; border-radius: 20px; width: 100%; max-width: 90vw; max-height: 90vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 24px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1f2937; }
.close-btn { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #4b5563; }
.modal-body { overflow-y: auto; display: flex; justify-content: center; align-items: center; background: #f9fafb; }
.modal-body > :deep(div) { transform: scale(0.9); transform-origin: top; }
.modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 12px; }

.btn-cancel, .btn-success { padding: 10px 20px; border-radius: 8px; font-size: 0.95rem; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-cancel { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }
.btn-success:disabled { background-color: #a7f3d0; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .modal-content { animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-leave-active .modal-content { animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse; }
@keyframes modal-in {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
