<script setup>
import { ref, onMounted, computed } from 'vue'
import QRCode from 'qrcode'
import PartnerCard from '../components/PartnerCard.vue'

// Estado
const partners = ref([])
const loading = ref(false)
const loadingMessages = ['Aguarde um pouco..', 'Estamos trabalhando...', 'Quase lá', 'Estamos processando...']
const currentMessageIndex = ref(0)
const loadingInterval = ref(null)

// Controle de Tema
const theme = ref(localStorage.getItem('theme') || 'light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

const modalQrOpen = ref(false)
const modalPosterOpen = ref(false)
const modalLeadsOpen = ref(false)
const modalAddPartnerOpen = ref(false)
const selectedPartnerLeads = ref([])
const selectedPartner = ref(null)
const qrDataUrl = ref('')
const qrUrlText = ref('')

// Formulário de Novo Parceiro
const newPartner = ref({
  nome: '',
  email: '',
  telefone: '',
  empresa: ''
})

const isSavingPartner = ref(false)

// Usa variável de ambiente para permitir acesso via rede (QR Code) e produção
// Definir VITE_PUBLIC_URL no .env para acesso via IP local (ex: http://192.168.0.10:5173)
const BASE_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// KPIs Computados do Sistema
const kpiGerais = computed(() => {
  const totalParceiros = partners.value.length;
  let leads = 0;
  let convertidos = 0;

  partners.value.forEach(p => {
    if (p.stats) {
      leads += parseInt(p.stats.total_leads) || 0;
      convertidos += parseInt(p.stats.total_convertidos) || 0;
    }
  });

  const taxaGeral = leads > 0 ? ((convertidos / leads) * 100).toFixed(1) + '%' : '0%';

  return {
    totalParceiros,
    totalLeads: leads,
    totalConvertidos: convertidos,
    taxaGeral
  };
});

// Métodos
const fetchPartnerSummary = async (partner) => {
  try {
    const summaryRes = await fetch(`${API_URL}/api/v1/parceiros/${partner.id}/resumo`)
    if (!summaryRes.ok) throw new Error('Resumo não encontrado')
    const summaryText = await summaryRes.text()
    if (!summaryText) throw new Error('Resumo vazio')
    const summary = JSON.parse(summaryText)
    
    // Suportar retornos com wrapper { data: {...}} ou response plana
    const data = summary.data || summary
    const leads = data.total_leads || 0
    const vendas = data.total_vendas || 0
    
    partner.stats = {
      total_leads: leads,
      total_convertidos: vendas,
      taxa_conversao: leads > 0 ? ((vendas / leads) * 100).toFixed(1) + '%' : '0%'
    }
  } catch (err) {
    // Valores de fallback se o backend estiver incompleto p/ esse parceiro
    partner.stats = { total_leads: 0, total_convertidos: 0, taxa_conversao: '0%' }
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
    const response = await fetch(`${API_URL}/api/v1/parceiros?page=1&page_size=20`)
    const json = await response.json()

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

const handleViewLeads = async (partner) => {
  selectedPartner.value = partner
  try {
    const response = await fetch(`${API_URL}/api/v1/leads?parceiro_id=${partner.id}`)
    const json = await response.json()
    // Aceita padronização global com json.data ou Array nativo
    selectedPartnerLeads.value = json.data || (Array.isArray(json) ? json : [])
    modalLeadsOpen.value = true
  } catch (error) {
    console.error('Erro ao buscar leads', error)
  }
}

onMounted(() => {
  fetchPartners()
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
  canvas.height = 1750; 
  const ctx = canvas.getContext('2d');
  
  // Cores
  const colorGreen = '#008445';
  const colorDark = '#0a1c2e';
  const colorLightGreen = '#e6f4ea';
  const colorWhite = '#ffffff';

  // Helper: Desenhar Retângulo Arredondado
  const roundRect = (x, y, w, h, r) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // 1. Fundo Verde (Moldura)
  ctx.fillStyle = colorGreen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 2. Card Branco Interno
  ctx.fillStyle = colorWhite;
  roundRect(30, 30, canvas.width - 60, canvas.height - 60, 40);
  ctx.fill();

  // 3. Header - Escudo com Plus
  ctx.strokeStyle = colorGreen;
  ctx.lineWidth = 10;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // Desenho simplificado do escudo
  ctx.beginPath();
  ctx.moveTo(540, 80);
  ctx.lineTo(600, 100);
  ctx.lineTo(600, 150);
  ctx.quadraticCurveTo(600, 200, 540, 230);
  ctx.quadraticCurveTo(480, 200, 480, 150);
  ctx.lineTo(480, 100);
  ctx.closePath();
  ctx.stroke();
  
  // Plus no escudo
  ctx.beginPath();
  ctx.moveTo(540, 125);
  ctx.lineTo(540, 185);
  ctx.moveTo(510, 155);
  ctx.lineTo(570, 155);
  ctx.stroke();

  // 4. Título Principal
  ctx.fillStyle = colorGreen;
  ctx.font = '900 80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ECONOMIZE', canvas.width / 2, 330);
  ctx.fillText('NO SEU PLANO', canvas.width / 2, 410);
  ctx.fillText('DE SAÚDE', canvas.width / 2, 490);

  // 5. WhatsApp Pill
  const pillW = 700;
  const pillH = 80;
  const pillX = (canvas.width - pillW) / 2;
  const pillY = 540;
  ctx.fillStyle = colorGreen;
  roundRect(pillX, pillY, pillW, pillH, 40);
  ctx.fill();
  
  ctx.fillStyle = colorWhite;
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillText('ATENDIMENTO RÁPIDO VIA WHATSAPP', canvas.width / 2 + 20, 592);

  // 6. Benefícios (Features)
  const drawFeature = (x, iconPath, text1, text2, text3) => {
    // Círculo ícone
    ctx.fillStyle = colorGreen;
    ctx.beginPath();
    ctx.arc(x, 700, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // Texto
    ctx.fillStyle = colorDark;
    ctx.font = '900 24px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text1, x + 60, 685);
    ctx.fillText(text2, x + 60, 715);
    if (text3) ctx.fillText(text3, x + 60, 745);
  };

  drawFeature(80, '', 'SEM', 'BUROCRACIA');
  drawFeature(390, '', 'PLANOS', 'INDIVIDUAIS', 'E FAMILIARES');
  drawFeature(740, '', 'AS MELHORES', 'OPERADORAS');

  // 7. QR Code Area
  // Sombra do box do QR
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  ctx.fillStyle = colorWhite;
  const qrBoxSize = 480;
  const qrBoxX = (canvas.width - qrBoxSize) / 2;
  const qrBoxY = 820;
  roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 40);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Desenho do QR (espera carregar)
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, qrBoxX + 40, qrBoxY + 40, qrBoxSize - 80, qrBoxSize - 80);
    
    // Scan Pill (Fica sobre o QR)
    ctx.fillStyle = colorDark;
    roundRect(qrBoxX + 60, qrBoxY + qrBoxSize - 40, qrBoxSize - 120, 70, 35);
    ctx.fill();
    
    ctx.fillStyle = colorWhite;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCANEIE E FALE CONOSCO', canvas.width / 2, qrBoxY + qrBoxSize + 5);

    // 8. Parceiro Box
    const partnerY = 1320;
    ctx.fillStyle = colorLightGreen;
    roundRect(80, partnerY, canvas.width - 160, 160, 30);
    ctx.fill();
    
    // Ícone Carro no Parceiro
    ctx.fillStyle = colorGreen;
    ctx.beginPath();
    ctx.arc(170, partnerY + 80, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Carro simplificado (SVG path-like)
    ctx.fillStyle = colorWhite;
    ctx.fillRect(140, partnerY + 75, 60, 20); // Base
    ctx.fillRect(150, partnerY + 60, 40, 15); // Topo
    
    ctx.fillStyle = colorGreen;
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PARCEIRO CREDENCIADO', 260, partnerY + 95);

    // 9. Footer Features (Icones + Texto)
    const footerY = 1550; // Aumentar altura se necessário ou ajustar
    // Devido ao tempo, farei apenas 3 colunas de texto no rodapé
    ctx.fillStyle = colorDark;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ATENDIMENTO', 200, 1600);
    ctx.fillText('AUTORIZADO', 200, 1630);
    
    ctx.fillText('CORRETORES', 540, 1600);
    ctx.fillText('ESPECIALIZADOS', 540, 1630);
    
    ctx.fillText('+500 ATENDIMENTOS', 880, 1600);
    ctx.fillText('REALIZADOS', 880, 1630);

    // Download
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cartaz_${selectedPartner.value.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = qrDataUrl.value;
}

const handleAddPartner = () => {
  newPartner.value = {
    nome: '',
    email: '',
    telefone: '',
    empresa: ''
  }
  modalAddPartnerOpen.value = true
}

const savePartner = async () => {
  if (!newPartner.value.nome) {
    alert('Por favor, preencha pelo menos o nome do parceiro.')
    return
  }

  isSavingPartner.value = true
  try {
    const response = await fetch(`${API_URL}/api/v1/parceiros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPartner.value)
    })

    const json = await response.json()
    if (json.success || response.ok) {
      alert('Parceiro adicionado com sucesso!')
      modalAddPartnerOpen.value = false
      fetchPartners() // Recarrega a lista
    } else {
      throw new Error(json.message || 'Erro ao salvar parceiro')
    }
  } catch (error) {
    console.error('Erro ao salvar parceiro:', error)
    alert('Ocorreu um erro ao salvar o parceiro. Verifique o console.')
  } finally {
    isSavingPartner.value = false
  }
}

const closeModal = () => {
  modalQrOpen.value = false
  modalPosterOpen.value = false
  modalLeadsOpen.value = false
  modalAddPartnerOpen.value = false
  setTimeout(() => {
    selectedPartner.value = null
    qrDataUrl.value = ''
    qrUrlText.value = ''
    selectedPartnerLeads.value = []
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
          <router-link to="/leads" class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Ver leads
          </router-link>
          
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
          <span class="kpi-label">Total Leads</span>
          <span class="kpi-value">{{ kpiGerais.totalLeads }}</span>
        </div>
        <div class="kpi-card highlight-kpi">
          <span class="kpi-label">Convertidos</span>
          <span class="kpi-value">{{ kpiGerais.totalConvertidos }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Taxa Média</span>
          <span class="kpi-value">{{ kpiGerais.taxaGeral }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loader-container">
          <div class="spinner"></div>
          <p class="loading-message">{{ loadingMessages[currentMessageIndex] }}</p>
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
          @view-leads="handleViewLeads"
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
                <div class="poster-card">
                  <div class="poster-inner">
                    <!-- Header -->
                    <div class="poster-header">
                      <div class="shield-plus">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="M12 8v8M8 12h8"/>
                        </svg>
                      </div>
                      <h1 class="poster-title">ECONOMIZE<br>NO SEU PLANO<br>DE SAÚDE</h1>
                      <div class="whatsapp-pill">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        ATENDIMENTO RÁPIDO VIA WHATSAPP
                      </div>
                    </div>

                    <!-- Features -->
                    <div class="poster-features">
                      <div class="p-feature">
                        <div class="f-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                        </div>
                        <div class="f-text">SEM<br>BUROCRACIA</div>
                      </div>
                      <div class="p-feature">
                        <div class="f-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <div class="f-text">PLANOS<br>INDIVIDUAIS<br>E FAMILIARES</div>
                      </div>
                      <div class="p-feature">
                        <div class="f-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
                          </svg>
                        </div>
                        <div class="f-text">AS MELHORES<br>OPERADORAS</div>
                      </div>
                    </div>

                    <!-- QR Code Area -->
                    <div class="poster-qr-section">
                      <div class="qr-decoration-left"></div>
                      <div class="qr-decoration-right"></div>
                      <div class="qr-white-box">
                        <img :src="qrDataUrl" alt="QR Code" />
                        <div class="scan-pill">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                          </svg>
                          ESCANEIE E FALE CONOSCO
                        </div>
                      </div>
                      <div class="qr-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#008445" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9"/>
                          <path d="M17 8l-5 4-5-4"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Partner Section -->
                    <div class="poster-partner-box">
                      <div class="partner-car-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
                        </svg>
                      </div>
                      <div class="partner-info">
                        <span class="partner-label">PARCEIRO CREDENCIADO</span>
                      </div>
                    </div>

                    <!-- Footer Info -->
                    <div class="poster-footer-features">
                      <div class="pf-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
                        </svg>
                        <span>ATENDIMENTO<br>AUTORIZADO</span>
                      </div>
                      <div class="pf-item border-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                        <span>CORRETORES<br>ESPECIALIZADOS</span>
                      </div>
                      <div class="pf-item border-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>+500<br>ATENDIMENTOS<br>REALIZADOS</span>
                      </div>
                    </div>
                  </div>
                </div>
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

    <!-- Modal Leads -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalLeadsOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content modal-lg">
            <div class="modal-header">
              <h2>Performance: {{ selectedPartner?.nome }}</h2>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <div class="modal-body bg-gray list-body" style="max-height: 60vh; overflow-y: auto;">
              <table class="leads-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Nome / Telefone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lead in selectedPartnerLeads" :key="lead.id">
                    <td>
                      {{ lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : 'N/A' }}
                    </td>
                    <td>
                      <div><strong>{{ lead.nome || 'Lead QR Code' }}</strong></div>
                      <div class="text-sm text-gray-500">{{ lead.telefone || 'N/A' }}</div>
                    </td>
                    <td>
                      <span :class="['status-badge', lead.status]">
                        {{ lead.status === 'em_atendimento' ? 'em andamento' : (lead.status || 'novo') }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="selectedPartnerLeads.length === 0">
                    <td colspan="3" class="text-center">Nenhum lead encontrado para este parceiro.</td>
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
.theme-dark .leads-table {
  background: #1f2937;
}
.theme-dark .leads-table th {
  background: #111827;
  color: #9ca3af;
}
.theme-dark .leads-table td {
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
.leads-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
.leads-table th, .leads-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}
.leads-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
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
