<script setup>
import { ref, onMounted, computed } from 'vue'
import QRCode from 'qrcode'
import CartazTemplateA from '../components/CartazTemplate.vue' // Renomeado para o novo
import PartnerCard from '../components/PartnerCard.vue'
import BulkGenerationModal from '../components/BulkGenerationModal.vue'
import AssociarCartaoModal from '../components/AssociarCartaoModal.vue'
import OperadorModal from '../components/OperadorModal.vue'
import { parceiroService } from '../services/parceiroService'
import { operadorService } from '../services/operadorService'
import { useAlert } from '@/services/useAlert'

// Estado
const partners = ref([])
const operadores = ref([])
const loading = ref(false)
const loadingMessages = ['Aguarde um pouco..', 'Estamos trabalhando...', 'Quase lá', 'Estamos processando...']
const currentMessageIndex = ref(0)
const loadingInterval = ref(null)

// Alerta Global
const { showAlert } = useAlert()

// Controle de Tema
const theme = ref(localStorage.getItem('theme') || 'light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

const modalQrOpen = ref(false)
const modalPosterOpen = ref(false)
const modalAddPartnerOpen = ref(false)
const modalBulkOpen = ref(false)
const isSavingBulk = ref(false)
const modalAssociateOpen = ref(false)
const isSavingAssociation = ref(false)
const modalSolicitacoesOpen = ref(false)
const modalOperadorOpen = ref(false)
const isSavingOperador = ref(false)
const selectedPartner = ref(null)
const selectedPartnerSolicitacoes = ref([])
const qrDataUrl = ref('')
const qrUrlText = ref('')

// Formulário de Novo Parceiro
const newPartner = ref({
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  operador_id: null
})

const isSavingPartner = ref(false)

// Usa variável de ambiente para permitir acesso via rede (QR Code) e produção
// Definir VITE_PUBLIC_URL no .env para acesso via IP local (ex: http://192.168.0.10:5173)
const BASE_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin

// KPIs Computados do Sistema
const  kpiGerais = computed(() => {
  const totalParceiros = partners.value.length;
  let solicitacoes = 0;
  let convertidos = 0;

  partners.value.forEach(p => {
    if (p.stats) {
      solicitacoes += parseInt(p.stats.total_solicitacoes) || 0;
      convertidos += parseInt(p.stats.total_convertidos) || 0;
    }
  });

  return {
    totalParceiros,
    totalSolicitacoes: solicitacoes,
    totalConvertidos: convertidos,
  };
});

// Métodos
const fetchPartnerSummary = async (partner) => {
  try {
    const summary = await parceiroService.buscarResumo(partner.id)
    
    // Suportar retornos com wrapper { data: {...}} ou response plana
    const data = summary.data || summary
    const leads = data.total_solicitacoes || 0
    const vendas = data.total_vendas || 0
    const convertidos = data.total_convertidos || 0
    
    
    partner.stats = {
      total_solicitacoes: leads,
      total_convertidos: convertidos,
      total_vendas: vendas
    }
  } catch (err) {
    // Valores de fallback se o backend estiver incompleto p/ esse parceiro
    partner.stats = { total_solicitacoes: 0, total_convertidos: 0 }
  }
}

const fetchPartners = async () => {
  loading.value = true
  currentMessageIndex.value = 0
  
  const startTime = Date.now()
  
  // Inicia o intervalo de mensagens (1 mensagem por segundo)
  loadingInterval.value = setInterval(() => {
    if (currentMessageIndex.value < loadingMessages.length - 1) {
      currentMessageIndex.value++
    }
  }, 1000)

  try {
    const json = await parceiroService.listar(1, 20)

    if (json.success) {
      partners.value = json.data
      await Promise.all(partners.value.map(p => fetchPartnerSummary(p)))
    }
    
    // Garantir que dure pelo menos 4 segundos
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 4000 - elapsedTime)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
  } catch (error) {
    console.error("Erro ao buscar parceiros", error)
  } finally {
    clearInterval(loadingInterval.value)
    loading.value = false
  }
}

const fetchOperadores = async () => {
  try {
    const response = await operadorService.listar()
    operadores.value = response.data || response
  } catch (error) {
    console.error('Erro ao buscar operadores:', error)
    operadores.value = []
  }
}

const handleViewSolicitacoes = async (partner) => {
  selectedPartner.value = partner
  try {
    const json = await parceiroService.buscarSolicitacoes(partner.id)
    
    selectedPartnerSolicitacoes.value = json.solicitacoes || []
    modalSolicitacoesOpen.value = true
  } catch (error) {
    console.error('Erro ao buscar solicitações', error)
  }
}


onMounted(() => {
  fetchPartners()
  fetchOperadores()
})

const generateQrUrl = (partnerId) => {
  return `${BASE_URL}/lp?ref=${partnerId}`
}

const handleGenerateQr = async (partner) => {
  selectedPartner.value = partner
  qrUrlText.value = generateQrUrl(partner.id)
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrUrlText.value, { 
      width: 400, 
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' }
    })
    modalQrOpen.value = true
  } catch (err) {
    console.error('Erro ao gerar QR Code', err)
  }
}

const handleDownloadQr = async (partner) => {
  try {
    const url = generateQrUrl(partner.id)
    const dataUrl = await QRCode.toDataURL(url, { 
      width: 1024, 
      margin: 4,
      color: { dark: '#000000', light: '#ffffff' }
    })
    
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr_${partner.id}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.error('Erro ao baixar QR Code', err)
  }
}

const handleGeneratePoster = async (partner) => {
  selectedPartner.value = partner
  qrUrlText.value = generateQrUrl(partner.id)
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrUrlText.value, { 
      width: 600, 
      margin: 1,
      color: { dark: '#1f2937', light: '#ffffff' }
    })
    modalPosterOpen.value = true
  } catch (err) {
    console.error('Erro ao gerar Poster', err)
  }
}

const downloadPoster = () => {
  if (!selectedPartner.value) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920; // A4 aspect ratio approx.
  const ctx = canvas.getContext('2d');
  
  // Cores
  const colorGreen = '#008445';
  const colorDark = '#0a1c2e';
  const colorWhite = '#ffffff';
  const colorGray = '#f3f4f6';
  const colorTextGray = '#4B5563';

  // Helper para Retângulo Arredondado
  const roundRect = (x, y, w, h, r) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
  };

  // 1. Fundo branco
  ctx.fillStyle = colorWhite;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Imagem de fundo (simulada com um gradiente para o exemplo)
  const headerImg = new Image();
  headerImg.onload = () => {
    ctx.drawImage(headerImg, 0, 0, canvas.width, 672); // 35% of 1920
    
    // Degradê sobre a imagem
    const gradient = ctx.createLinearGradient(0, 470, 0, 672);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(0.65, 'rgba(255,255,255,0.45)');
    gradient.addColorStop(0.85, 'rgba(255,255,255,0.80)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 470, canvas.width, 202);

    // Título
    ctx.textAlign = 'center';
    ctx.fillStyle = colorGreen;
    ctx.font = 'bold 54px Roboto, sans-serif';
    ctx.fillText('ECONOMIZE', canvas.width / 2, 650);
    ctx.font = '900 115px Oswald, sans-serif';
    ctx.fillText('NO SEU PLANO', canvas.width / 2, 760);
    ctx.fillText('DE SAÚDE', canvas.width / 2, 870);

    // CTA Simulação
    ctx.font = 'bold 42px Roboto, sans-serif';
    ctx.fillStyle = colorDark;
    ctx.fillText('FAÇA UMA SIMULAÇÃO GRATUITA EM 1 MINUTO', canvas.width / 2, 950);

    // Seção QR Code
    ctx.font = '900 40px Roboto, sans-serif';
    ctx.fillStyle = colorGreen;
    ctx.textAlign = 'right';
    ctx.fillText('APONTE A CÂMERA', 280, 1080);
    ctx.fillText('E ESCANEIE', 280, 1130);
    ctx.textAlign = 'left';
    ctx.fillText('É RÁPIDO', 800, 1080);
    ctx.fillText('E SEGURO', 800, 1130);

    // Benefícios
    drawBenefit(210, 'SEM BUROCRACIA');
    drawBenefit(540, 'PLANOS INDIVIDUAIS E FAMILIARES');
    drawBenefit(870, 'AS MELHORES OPERADORAS');

    // Selo Parceiro
    ctx.fillStyle = colorGray;
    roundRect(80, 1500, canvas.width - 160, 120, 20).fill();
    ctx.font = '500 28px Roboto, sans-serif';
    ctx.fillStyle = colorTextGray;
    ctx.textAlign = 'left';
    ctx.fillText('PARCEIRO CREDENCIADO:', 120, 1545);
    ctx.font = 'bold 40px Roboto, sans-serif';
    ctx.fillStyle = colorDark;
    ctx.fillText(`${selectedPartner.value.nome} - ${selectedPartner.value.id.slice(0, 8)}`, 120, 1595);

    // Código do Cartão
    ctx.font = '500 28px Roboto, sans-serif';
    ctx.fillStyle = colorTextGray;
    ctx.textAlign = 'right';
    ctx.fillText('CÓDIGO DO CARTÃO:', canvas.width - 120, 1545);
    ctx.font = 'bold 40px Roboto, sans-serif';
    ctx.fillStyle = colorDark;
    ctx.fillText(selectedPartner.value.id.slice(5).toUpperCase(), canvas.width - 120, 1595);

    // Rodapé Logos
    ctx.font = 'bold 28px Roboto, sans-serif';
    ctx.fillStyle = colorTextGray;
    ctx.textAlign = 'center';
    ctx.fillText('OPERADORAS PARCEIRAS', canvas.width / 2, 1700);
    // Aqui viria o código para desenhar os logos...

    // Desenhar QR Code por último
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrBoxSize = 320;
      const qrBoxX = (canvas.width - qrBoxSize) / 2;
      const qrBoxY = 1000;
      ctx.fillStyle = colorWhite;
      ctx.strokeStyle = colorGreen;
      ctx.lineWidth = 8;
      roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 30).fill();
      roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 30).stroke();
      ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);

      // Download
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `cartaz_${selectedPartner.value.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    qrImg.src = qrDataUrl.value;
  };
  headerImg.src = '/lp-header.jpg'; // Caminho da imagem de fundo

  const drawBenefit = (x, text) => {
    ctx.fillStyle = colorGreen;
    ctx.beginPath();
    ctx.arc(x, 1400, 45, 0, Math.PI * 2);
    ctx.fill();
    // Ícone (simulado)
    ctx.fillStyle = colorWhite;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', x, 1415);

    ctx.fillStyle = colorDark;
    ctx.font = 'bold 28px Roboto, sans-serif';
    const lines = text.split(' ');
    if (lines.length > 2) {
      ctx.fillText(lines.slice(0, 2).join(' '), x, 1480);
      ctx.fillText(lines.slice(2).join(' '), x, 1510);
    } else {
      ctx.fillText(text, x, 1480);
    }
  };
}

const handleAddPartner = () => {
  newPartner.value = {
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    operador_id: null
  }
  modalAddPartnerOpen.value = true
}

const handleOpenBulkModal = () => {
  modalBulkOpen.value = true
}

const handleBulkGenerate = async ({ quantidade, operadorId }) => {
  isSavingBulk.value = true
  try {
    const response = await parceiroService.gerarLote({
      quantidade,
      operador_id: operadorId,
      prefixo_nome: 'Parceiro'
    })
    if (response.success) {
      showAlert('Sucesso', `${quantidade} parceiros gerados com sucesso!`, 'success')
      modalBulkOpen.value = false
      fetchPartners()
    } else {
      throw new Error(response.message || 'Erro ao gerar parceiros em lote')
    }
  } catch (error) {
    const message = error.message.includes('operador') 
      ? error.message
      : 'Ocorreu um erro ao gerar os parceiros. Verifique o console.'
    showAlert('Erro', message, 'error')
    console.error('Erro ao gerar parceiros:', error)
  } finally {
    isSavingBulk.value = false
  }
}

const handleOpenAssociateModal = (partner) => {
  selectedPartner.value = partner
  modalAssociateOpen.value = true
}

const handleSaveAssociation = async (formData) => {
  if (!selectedPartner.value) return

  isSavingAssociation.value = true
  try {
    const response = await parceiroService.associar(selectedPartner.value.id, formData)
    if (response.success) {
      showAlert('Sucesso', 'Cartão associado com sucesso!', 'success')
      modalAssociateOpen.value = false
      fetchPartners()
    } else {
      throw new Error(response.message || 'Erro ao associar cartão')
    }
  } catch (error) {
    showAlert('Erro', 'Ocorreu um erro ao associar o cartão. Verifique o console e os dados informados.', 'error')
    console.error('Erro ao associar cartão:', error)
  } finally {
    isSavingAssociation.value = false
  }
}

const savePartner = async () => {
  if (!newPartner.value.nome || !newPartner.value.operador_id) {
    showAlert(
      'Atenção', 
      'Por favor, preencha o nome e selecione o operador responsável.', 
      'warning'
    )
    return
  }

  isSavingPartner.value = true
  try {
    const json = await parceiroService.criar(newPartner.value)
    if (json.success) {
      showAlert('Sucesso', 'Parceiro adicionado com sucesso!', 'success')
      modalAddPartnerOpen.value = false
      fetchPartners() // Recarrega a lista
    } else {
      throw new Error(json.message || 'Erro ao salvar parceiro')
    }
  } catch (error) {
    showAlert('Erro', 'Ocorreu um erro ao salvar o parceiro. Verifique o console.', 'error')
    console.error('Erro ao salvar parceiro:', error)
  } finally {
    isSavingPartner.value = false
  }
}

const handleSaveOperador = async (formData) => {
  isSavingOperador.value = true
  try {
    const response = await operadorService.criar(formData)
    if (response.success || response.data) {
      showAlert('Sucesso', 'Operador adicionado com sucesso!', 'success')
      modalOperadorOpen.value = false
      fetchOperadores()
    } else {
      throw new Error(response.message || 'Erro ao salvar operador')
    }
  } catch (error) {
    showAlert('Erro', 'Ocorreu um erro ao salvar o operador. Verifique o console.', 'error')
    console.error('Erro ao salvar operador:', error)
  } finally {
    isSavingOperador.value = false
  }
}

const closeModal = () => {
  modalQrOpen.value = false
  modalPosterOpen.value = false
  modalAddPartnerOpen.value = false
  modalSolicitacoesOpen.value = false
  modalBulkOpen.value = false
  modalAssociateOpen.value = false
  modalOperadorOpen.value = false
  setTimeout(() => {
    selectedPartner.value = null
    qrDataUrl.value = ''
    qrUrlText.value = ''
    selectedPartnerSolicitacoes.value = []
  }, 300)
}
</script>

<template>
  <div class="dashboard-layout" :class="{ 'theme-dark': theme === 'dark' }">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          </div>
          <div>
            <h1>Gerador de QR Code</h1>
            <p>Gerencie seus parceiros e emita materiais de captação</p>
          </div>
        </div>
        
        <div class="header-actions">
          <router-link to="/solicitacoes" class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Ver solicitações
          </router-link>

          <button class="action-btn" @click="handleOpenBulkModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
            Gerar em Lote
          </button>
          
          <button class="action-btn" @click="modalOperadorOpen = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            + Operador
          </button>
          
          <button class="action-btn btn-success-light" @click="handleAddPartner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + parceiro
          </button>

          <button class="theme-toggle-btn" @click="toggleTheme">
            <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            {{ theme === 'light' ? 'Tema Escuro' : 'Tema Claro' }}
          </button>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- KPIs Gerais no topo (UX TOP) -->
      <div class="kpi-banner">
        <div class="kpi-card">
          <span class="kpi-label">Parceiros</span>
          <span class="kpi-value">{{ kpiGerais.totalParceiros }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total de Solicitações</span>
          <span class="kpi-value">{{ kpiGerais.totalSolicitacoes }}</span>
        </div>
        <div class="kpi-card highlight-kpi">
          <span class="kpi-label">Convertidos</span>
          <span class="kpi-value">{{ kpiGerais.totalConvertidos }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loader-container">
          <div class="spinner"></div>
          <p class="loading-message">{{ loadingMessages[currentMessageIndex] }}</p>
        </div>
      </div>
      <div v-else-if="partners.length === 0" class="empty-state">
        <div class="empty-container">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          </div>
          <h2>Não há parceiros cadastrados no momento</h2>
          <p>Comece adicionando um novo parceiro para gerar QR codes e cartazes.</p>
          <button class="btn-add-first" @click="handleAddPartner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Adicionar Primeiro Parceiro
          </button>
        </div>
      </div>
      <div v-else class="grid-container">
        <PartnerCard 
          v-for="partner in partners" 
          :key="partner.id" 
          :partner="partner"
          @generate="handleGenerateQr"
          @download="handleDownloadQr"
          @poster="handleGeneratePoster"
          @view-solicitacoes="handleViewSolicitacoes"
          @associate-card="handleOpenAssociateModal"
        />
      </div>
    </main>

    <!-- Modal QR Code Simples -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalQrOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>QR Code Gerado</h2>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <div class="modal-body">
              <div v-if="selectedPartner" class="context-info">
                <strong>{{ selectedPartner.nome }}</strong> - {{ selectedPartner.id }}
              </div>
              
              <div class="qr-container">
                <img :src="qrDataUrl" alt="QR Code" class="qr-image" />
              </div>
              
              <div class="url-display">
                <span class="url-label">URL de Destino:</span>
                <input type="text" readonly :value="qrUrlText" class="url-input" @focus="$event.target.select()"/>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">Fechar</button>
              <button class="btn-primary" @click="handleDownloadQr(selectedPartner)">
                Baixar Imagem
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Cartaz (Poster) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalPosterOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content modal-lg">
            <div class="modal-header">
              <h2>Visualização do Cartaz</h2>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <div class="modal-body bg-gray">
              <div class="poster-preview">
                <!-- O novo componente de cartaz será renderizado aqui -->
                <CartazTemplateA
                  v-if="selectedPartner"
                  :qr-code-url="qrUrlText"
                  :partner-name="selectedPartner.nome"
                  :partner-code="selectedPartner.id.slice(0, 8)"
                  :partner-id="selectedPartner.id"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">Cancelar</button>
              <button class="btn-success" @click="downloadPoster">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Baixar Cartaz (PNG)
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Solicitações -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalSolicitacoesOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content modal-lg">
            <div class="modal-header">
              <h2>Performance: {{ selectedPartner?.nome }}</h2>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <div class="modal-body bg-gray list-body" style="max-height: 60vh; overflow-y: auto;">
              <table class="solicitacoes-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Detalhes da Solicitação</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="solicitacao in selectedPartnerSolicitacoes" :key="solicitacao.id">
                    <td>
                      {{ solicitacao.created_at ? new Date(solicitacao.created_at).toLocaleDateString('pt-BR') : 'N/A' }}
                    </td>
                    <td>
                      <div><strong>Protocolo:</strong> {{ solicitacao.protocolo }}</div>
                      <div class="text-sm text-gray-500">
                        {{ solicitacao.vidas.length }} vida(s) | Cobertura: {{ solicitacao.cobertura }}
                      </div>
                    </td>
                    <td>
                      <span :class="['status-badge', solicitacao.status || 'novo']">
                        {{ solicitacao.status === 'em_atendimento' ? 'em andamento' : (solicitacao.status || 'novo') }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="selectedPartnerSolicitacoes.length === 0">
                    <td colspan="3" class="text-center">Nenhuma solicitação encontrada para este parceiro.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">Fechar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Adicionar Parceiro -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalAddPartnerOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Novo Parceiro</h2>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Nome Completo *</label>
                <input type="text" v-model="newPartner.nome" placeholder="Ex: João Silva" class="form-control" />
              </div>
              
              <div class="form-group">
                <label>E-mail</label>
                <input type="email" v-model="newPartner.email" placeholder="joao@email.com" class="form-control" />
              </div>
              
              <div class="form-group">
                <label>Telefone / WhatsApp</label>
                <input type="text" v-model="newPartner.telefone" placeholder="(61) 99999-9999" class="form-control" />
              </div>

              <div class="form-group">
                <label>Empresa / Referência</label>
                <input type="text" v-model="newPartner.empresa" placeholder="Ex: Uber BSB" class="form-control" />
              </div>

              <div class="form-group">
                <label for="operador_parceiro">Operador Responsável *</label>
                <select 
                  id="operador_parceiro" 
                  v-model="newPartner.operador_id"
                  class="form-control"
                  :disabled="isSavingPartner || !operadores.length"
                >
                  <option :value="null" disabled>
                    {{ operadores.length ? 'Selecione um operador' : 'Nenhum operador disponível' }}
                  </option>
                  <option v-for="operador in operadores" :key="operador.id" :value="operador.id">
                    {{ operador.nome }}
                  </option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal" :disabled="isSavingPartner">Cancelar</button>
              <button class="btn-success" @click="savePartner" :disabled="isSavingPartner">
                <span v-if="isSavingPartner">Salvando...</span>
                <span v-else>Salvar Parceiro</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Gerar em Lote -->
    <BulkGenerationModal
      :open="modalBulkOpen"
      :is-saving="isSavingBulk"
      :operadores="operadores"
      @close="closeModal"
      @generate="handleBulkGenerate"
    />

    <!-- Modal Associar Cartão -->
    <AssociarCartaoModal
      :open="modalAssociateOpen"
      :is-saving="isSavingAssociation"
      :partner="selectedPartner"
      @close="closeModal"
      @save="handleSaveAssociation"
    />

    <!-- Modal Novo Operador -->
    <OperadorModal
      :open="modalOperadorOpen"
      :is-saving="isSavingOperador"
      @close="closeModal"
      @save="handleSaveOperador"
    />
  </div>
</template>

<style scoped>
/* Layout Base */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: inherit;
  color: #1f2937;
}

.dashboard-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 32px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  text-decoration: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-success-light {
  background: #ecfdf5;
  color: #059669;
  border-color: #d1fae5;
}

.btn-success-light:hover {
  background: #d1fae5;
  border-color: #a7f3d0;
}

.theme-toggle-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: #e5e7eb;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.title-area h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

.title-area p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  min-height: 400px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-container h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-container p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.btn-add-first {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-add-first:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 6px 12px -1px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  min-height: 400px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
  margin: 0;
  min-height: 1.5em;
  transition: all 0.3s ease;
}

.theme-dark .loading-message {
  color: #9ca3af;
}

.theme-dark .spinner {
  border-color: #374151;
  border-top-color: #10b981;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 800px; /* Aumentado para o novo layout do cartaz */
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-body {
  padding: 24px;
}

.modal-body.bg-gray {
  background: #f9fafb;
}

.context-info {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 24px;
  text-align: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.url-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.url-input {
  width: 100%;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-family: monospace;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.url-input:focus {
  outline: 2px solid #10b981;
  border-color: transparent;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-primary, .btn-success {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #111827;
  color: white;
}

.btn-primary:hover {
  background: #374151;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

/* Poster Preview Design - Screenshot Inspired */
.poster-preview {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  transform: scale(0.85); /* Scale down to fit modal */
  transform-origin: top center;
}

.poster-card {
  width: 400px;
  height: 560px;
  background: #008445;
  border-radius: 24px;
  padding: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.poster-inner {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.poster-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.shield-plus {
  color: #008445;
  width: 32px;
  height: 32px;
}

.poster-title {
  margin: 0;
  color: #008445;
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.whatsapp-pill {
  background: #008445;
  color: white;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.whatsapp-pill svg {
  width: 14px;
  height: 14px;
}

.poster-features {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;
  padding: 0 8px;
}

.p-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.f-icon {
  width: 24px;
  height: 24px;
  background: #008445;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.f-icon svg {
  width: 14px;
  height: 14px;
}

.f-text {
  font-size: 0.45rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0a1c2e;
}

.poster-qr-section {
  margin-top: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-white-box {
  background: white;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  position: relative;
}

.qr-white-box img {
  width: 120px;
  height: 120px;
}

.scan-pill {
  background: #0a1c2e;
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.55rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: -10px;
  position: relative;
  z-index: 3;
}

.scan-pill svg {
  width: 10px;
  height: 10px;
}

.qr-arrow {
  position: absolute;
  left: 20%;
  bottom: 0;
  width: 40px;
  height: 40px;
  transform: rotate(-45deg);
}

.poster-partner-box {
  margin-top: 16px;
  background: #e6f4ea;
  border-radius: 12px;
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}

.partner-car-icon {
  width: 36px;
  height: 36px;
  background: #008445;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.partner-car-icon svg {
  width: 20px;
  height: 20px;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-label {
  font-size: 0.5rem;
  font-weight: 700;
  color: #008445;
}

.partner-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0a1c2e;
}

.poster-footer-features {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  border-top: 1px solid #f3f4f6;
}

.pf-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.pf-item svg {
  width: 16px;
  height: 16px;
  color: #008445;
}

.pf-item span {
  font-size: 0.4rem;
  font-weight: 700;
  color: #0a1c2e;
  line-height: 1.1;
}

.border-left {
  border-left: 1px solid #f3f4f6;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Manual Dark Mode Theme */
.theme-dark {
  background-color: #111827;
  color: #f9fafb;
}
.theme-dark .dashboard-header {
  background-color: #1f2937;
  border-color: #374151;
}
.theme-dark .theme-toggle-btn {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}
.theme-dark .theme-toggle-btn:hover {
  background: #4b5563;
}
.theme-dark .title-area h1 {
  color: #f9fafb;
}
.theme-dark .title-area p {
  color: #9ca3af;
}
.theme-dark .modal-content {
  background: #1f2937;
}
.theme-dark .modal-header, .theme-dark .modal-footer {
  border-color: #374151;
}
.theme-dark .modal-header h2 {
  color: #f9fafb;
}
.theme-dark .modal-footer, .theme-dark .modal-body.bg-gray {
  background: #111827;
}
.theme-dark .context-info {
  background: #374151;
  color: #d1d5db;
}
.theme-dark .qr-container {
  background: #374151;
  border-color: #4b5563;
}
.theme-dark .url-label {
  color: #d1d5db;
}
.theme-dark .url-input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
.theme-dark .btn-cancel {
  background: #374151;
  color: #e5e7eb;
  border-color: #4b5563;
}
.theme-dark .btn-cancel:hover {
  background: #4b5563;
}
.theme-dark .btn-primary {
  background: #f9fafb;
  color: #111827;
}
.theme-dark .btn-primary:hover {
  background: #e5e7eb;
}
.theme-dark .kpi-card {
  background: #1f2937;
  border-color: #374151;
}
.theme-dark .kpi-label {
  color: #9ca3af;
}
.theme-dark .kpi-value {
  color: #f9fafb;
}
.theme-dark .solicitacoes-table {
  background: #1f2937;
}
.theme-dark .solicitacoes-table th {
  background: #111827;
  color: #9ca3af;
}
.theme-dark .solicitacoes-table td {
  border-color: #374151;
  color: #e5e7eb;
}
.theme-dark .status-badge.novo { background-color: #374151; color: #d1d5db; }
.theme-dark .status-badge.em_atendimento { background-color: #1e3a8a; color: #93c5fd; }
.theme-dark .status-badge.convertido { background-color: #064e3b; color: #6ee7b7; }
.theme-dark .status-badge.perdido { background-color: #7f1d1d; color: #fca5a5; }
.theme-dark .text-gray-500 { color: #9ca3af; }

.theme-dark .action-btn {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}
.theme-dark .action-btn:hover {
  background: #4b5563;
}
.theme-dark .btn-success-light {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}
.theme-dark .btn-success-light:hover {
  background: rgba(16, 185, 129, 0.2);
}
.theme-dark .form-group label {
  color: #d1d5db;
}
.theme-dark .form-control {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
.theme-dark .form-control:focus {
  border-color: #10b981;
}

/* Dark Mode - Empty State */
.theme-dark .empty-icon {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #6b7280;
}

.theme-dark .empty-container h2 {
  color: #f9fafb;
}

.theme-dark .empty-container p {
  color: #9ca3af;
}

.theme-dark .btn-add-first {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.theme-dark .btn-add-first:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* KPI Banner - Leads style */
.kpi-banner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025);
  border: 1px solid #f9fafb;
  gap: 8px;
}
.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.kpi-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}
.highlight-kpi {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}
.highlight-kpi .kpi-label {
  color: rgba(255,255,255,0.8);
}
.highlight-kpi .kpi-value {
  color: white;
}

/* Leads Table in Modal */
.list-body {
  padding: 0;
}
.solicitacoes-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
.solicitacoes-table th, .solicitacoes-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}
.solicitacoes-table td {
  color: #111827;
}
.solicitacoes-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
  text-transform: uppercase;
  font-size: 0.75rem;
  position: sticky;
  top: 0;
}
.text-center { text-align: center; color: #6b7280; padding: 24px !important; }
.text-sm { font-size: 0.8rem; }
.text-gray-500 { color: #6b7280; }

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.novo { background: #f3f4f6; color: #4b5563; }
.status-badge.em_atendimento { background: #dbeafe; color: #1d4ed8; }
.status-badge.convertido { background: #dcfce3; color: #15803d; }
.status-badge.perdido { background: #fee2e2; color: #b91c1c; }
</style>

<style scoped>
/* Layout Base */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: inherit;
  color: #1f2937;
}

.dashboard-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 32px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  text-decoration: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-success-light {
  background: #ecfdf5;
  color: #059669;
  border-color: #d1fae5;
}

.btn-success-light:hover {
  background: #d1fae5;
  border-color: #a7f3d0;
}

.theme-toggle-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: #e5e7eb;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.title-area h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

.title-area p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  min-height: 400px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-container h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-container p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.btn-add-first {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-add-first:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 6px 12px -1px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  min-height: 400px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
  margin: 0;
  min-height: 1.5em;
  transition: all 0.3s ease;
}

.theme-dark .loading-message {
  color: #9ca3af;
}

.theme-dark .spinner {
  border-color: #374151;
  border-top-color: #10b981;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 600px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-body {
  padding: 24px;
}

.modal-body.bg-gray {
  background: #f9fafb;
}

.context-info {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 24px;
  text-align: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.url-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.url-input {
  width: 100%;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-family: monospace;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.url-input:focus {
  outline: 2px solid #10b981;
  border-color: transparent;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-primary, .btn-success {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #111827;
  color: white;
}

.btn-primary:hover {
  background: #374151;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

/* Poster Preview Design - Screenshot Inspired */
.poster-preview {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.poster-card {
  width: 400px;
  height: 560px;
  background: #008445;
  border-radius: 24px;
  padding: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.poster-inner {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.poster-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.shield-plus {
  color: #008445;
  width: 32px;
  height: 32px;
}

.poster-title {
  margin: 0;
  color: #008445;
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.whatsapp-pill {
  background: #008445;
  color: white;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.whatsapp-pill svg {
  width: 14px;
  height: 14px;
}

.poster-features {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;
  padding: 0 8px;
}

.p-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.f-icon {
  width: 24px;
  height: 24px;
  background: #008445;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.f-icon svg {
  width: 14px;
  height: 14px;
}

.f-text {
  font-size: 0.45rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0a1c2e;
}

.poster-qr-section {
  margin-top: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-white-box {
  background: white;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  position: relative;
}

.qr-white-box img {
  width: 120px;
  height: 120px;
}

.scan-pill {
  background: #0a1c2e;
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.55rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: -10px;
  position: relative;
  z-index: 3;
}

.scan-pill svg {
  width: 10px;
  height: 10px;
}

.qr-arrow {
  position: absolute;
  left: 20%;
  bottom: 0;
  width: 40px;
  height: 40px;
  transform: rotate(-45deg);
}

.poster-partner-box {
  margin-top: 16px;
  background: #e6f4ea;
  border-radius: 12px;
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}

.partner-car-icon {
  width: 36px;
  height: 36px;
  background: #008445;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.partner-car-icon svg {
  width: 20px;
  height: 20px;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-label {
  font-size: 0.5rem;
  font-weight: 700;
  color: #008445;
}

.partner-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0a1c2e;
}

.poster-footer-features {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  border-top: 1px solid #f3f4f6;
}

.pf-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.pf-item svg {
  width: 16px;
  height: 16px;
  color: #008445;
}

.pf-item span {
  font-size: 0.4rem;
  font-weight: 700;
  color: #0a1c2e;
  line-height: 1.1;
}

.border-left {
  border-left: 1px solid #f3f4f6;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active .modal-content {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Manual Dark Mode Theme */
.theme-dark {
  background-color: #111827;
  color: #f9fafb;
}
.theme-dark .dashboard-header {
  background-color: #1f2937;
  border-color: #374151;
}
.theme-dark .theme-toggle-btn {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}
.theme-dark .theme-toggle-btn:hover {
  background: #4b5563;
}
.theme-dark .title-area h1 {
  color: #f9fafb;
}
.theme-dark .title-area p {
  color: #9ca3af;
}
.theme-dark .modal-content {
  background: #1f2937;
}
.theme-dark .modal-header, .theme-dark .modal-footer {
  border-color: #374151;
}
.theme-dark .modal-header h2 {
  color: #f9fafb;
}
.theme-dark .modal-footer, .theme-dark .modal-body.bg-gray {
  background: #111827;
}
.theme-dark .context-info {
  background: #374151;
  color: #d1d5db;
}
.theme-dark .qr-container {
  background: #374151;
  border-color: #4b5563;
}
.theme-dark .url-label {
  color: #d1d5db;
}
.theme-dark .url-input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
.theme-dark .btn-cancel {
  background: #374151;
  color: #e5e7eb;
  border-color: #4b5563;
}
.theme-dark .btn-cancel:hover {
  background: #4b5563;
}
.theme-dark .btn-primary {
  background: #f9fafb;
  color: #111827;
}
.theme-dark .btn-primary:hover {
  background: #e5e7eb;
}
.theme-dark .kpi-card {
  background: #1f2937;
  border-color: #374151;
}
.theme-dark .kpi-label {
  color: #9ca3af;
}
.theme-dark .kpi-value {
  color: #f9fafb;
}
.theme-dark .solicitacoes-table {
  background: #1f2937;
}
.theme-dark .solicitacoes-table th {
  background: #111827;
  color: #9ca3af;
}
.theme-dark .solicitacoes-table td {
  border-color: #374151;
  color: #e5e7eb;
}
.theme-dark .status-badge.novo { background-color: #374151; color: #d1d5db; }
.theme-dark .status-badge.em_atendimento { background-color: #1e3a8a; color: #93c5fd; }
.theme-dark .status-badge.convertido { background-color: #064e3b; color: #6ee7b7; }
.theme-dark .status-badge.perdido { background-color: #7f1d1d; color: #fca5a5; }
.theme-dark .text-gray-500 { color: #9ca3af; }

.theme-dark .action-btn {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}
.theme-dark .action-btn:hover {
  background: #4b5563;
}
.theme-dark .btn-success-light {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}
.theme-dark .btn-success-light:hover {
  background: rgba(16, 185, 129, 0.2);
}
.theme-dark .form-group label {
  color: #d1d5db;
}
.theme-dark .form-control {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
.theme-dark .form-control:focus {
  border-color: #10b981;
}

/* Dark Mode - Empty State */
.theme-dark .empty-icon {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #6b7280;
}

.theme-dark .empty-container h2 {
  color: #f9fafb;
}

.theme-dark .empty-container p {
  color: #9ca3af;
}

.theme-dark .btn-add-first {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.theme-dark .btn-add-first:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* KPI Banner - Leads style */
.kpi-banner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025);
  border: 1px solid #f9fafb;
  gap: 8px;
}
.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.kpi-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}
.highlight-kpi {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}
.highlight-kpi .kpi-label {
  color: rgba(255,255,255,0.8);
}
.highlight-kpi .kpi-value {
  color: white;
}

/* Leads Table in Modal */
.list-body {
  padding: 0;
}
.solicitacoes-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
.solicitacoes-table th, .solicitacoes-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}
.solicitacoes-table td {
  color: #111827;
}
.solicitacoes-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
  text-transform: uppercase;
  font-size: 0.75rem;
  position: sticky;
  top: 0;
}
.text-center { text-align: center; color: #6b7280; padding: 24px !important; }
.text-sm { font-size: 0.8rem; }
.text-gray-500 { color: #6b7280; }

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.novo { background: #f3f4f6; color: #4b5563; }
.status-badge.em_atendimento { background: #dbeafe; color: #1d4ed8; }
.status-badge.convertido { background: #dcfce3; color: #15803d; }
.status-badge.perdido { background: #fee2e2; color: #b91c1c; }
</style>
