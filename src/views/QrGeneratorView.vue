<script setup>
import { ref, onMounted, computed } from 'vue'
import QRCode from 'qrcode'
import PartnerCard from '../components/PartnerCard.vue'

// Estado
const partners = ref([])
const loading = ref(false)

const modalQrOpen = ref(false)
const modalPosterOpen = ref(false)
const modalLeadsOpen = ref(false)
const selectedPartnerLeads = ref([])
const selectedPartner = ref(null)
const qrDataUrl = ref('')
const qrUrlText = ref('')

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
  try {
    const response = await fetch(`${API_URL}/api/v1/parceiros?page=1&page_size=20`)
    const json = await response.json()

    if (json.success) {
      partners.value = json.data
      // Busca resumos em background para todos
      await Promise.all(partners.value.map(p => fetchPartnerSummary(p)))
    }
  } catch (error) {
    console.error("Erro ao buscar parceiros", error)
  } finally {
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
  canvas.height = 1350; 
  const ctx = canvas.getContext('2d');
  
  // Fundo com Gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#10b981'); 
  gradient.addColorStop(1, '#047857'); 
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Card Central
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  
  if (ctx.roundRect) {
    ctx.roundRect(140, 160, canvas.width - 280, canvas.height - 320, 60);
    ctx.fill();
  } else {
    ctx.fillRect(140, 160, canvas.width - 280, canvas.height - 320);
  }
  
  ctx.shadowColor = 'transparent'; // Reset shade
  
  // Texto: ESCANEIE E FALE CONOSCO
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 54px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESCANEIE E FALE', canvas.width / 2, 290);
  ctx.fillText('CONOSCO', canvas.width / 2, 360);
  
  // Desenho do QR
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, canvas.width / 2 - 250, 420, 500, 500);
    
    // Nome do parceiro
    ctx.fillStyle = '#4b5563';
    ctx.font = '500 42px Arial, sans-serif';
    ctx.fillText(selectedPartner.value.nome, canvas.width / 2, 1020);
    
    // Id
    ctx.fillStyle = '#9ca3af';
    ctx.font = '30px Arial, sans-serif';
    ctx.fillText(`ID: ${selectedPartner.value.id}`, canvas.width / 2, 1070);
    
    // Texto de Apoio
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('Use a câmera do seu celular', canvas.width / 2, 1260);
    
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cartaz_${selectedPartner.value.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = qrDataUrl.value;
}

const closeModal = () => {
  modalQrOpen.value = false
  modalPosterOpen.value = false
  modalLeadsOpen.value = false
  setTimeout(() => {
    selectedPartner.value = null
    qrDataUrl.value = ''
    qrUrlText.value = ''
    selectedPartnerLeads.value = []
  }, 300)
}
</script>

<template>
  <div class="dashboard-layout">
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
        Carregando parceiros e métricas...
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
                  <div class="poster-text">
                    <h2>ESCANEIE E FALE</h2>
                    <h2>CONOSCO</h2>
                  </div>
                  <img :src="qrDataUrl" alt="QR Code" class="poster-qr" />
                  <div class="poster-partner">
                    Parceiro: {{ selectedPartner?.nome }}
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
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 500;
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

/* Poster Preview Design */
.poster-preview {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.poster-card {
  width: 300px;
  height: 420px;
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  border-radius: 20px;
  padding: 30px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.poster-card::after {
  content: '';
  position: absolute;
  top: 30px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: white;
  border-radius: 12px;
  z-index: 1;
}

.poster-text, .poster-qr, .poster-partner {
  position: relative;
  z-index: 2;
}

.poster-text {
  text-align: center;
  margin-top: 40px;
}

.poster-text h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.2;
}

.poster-qr {
  width: 140px;
  height: 140px;
  margin-top: 20px;
  border: 4px solid white;
  border-radius: 8px;
}

.poster-partner {
  margin-top: auto;
  margin-bottom: 20px;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 600;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .dashboard-layout {
    background-color: #111827;
    color: #f9fafb;
  }
  .dashboard-header {
    background-color: #1f2937;
    border-color: #374151;
  }
  .title-area h1 {
    color: #f9fafb;
  }
  .title-area p {
    color: #9ca3af;
  }
  .modal-content {
    background: #1f2937;
  }
  .modal-header, .modal-footer {
    border-color: #374151;
  }
  .modal-header h2 {
    color: #f9fafb;
  }
  .modal-footer, .modal-body.bg-gray {
    background: #111827;
  }
  .context-info {
    background: #374151;
    color: #d1d5db;
  }
  .qr-container {
    background: #374151;
    border-color: #4b5563;
  }
  .url-label {
    color: #d1d5db;
  }
  .url-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  .btn-cancel {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  .btn-cancel:hover {
    background: #4b5563;
  }
  .btn-primary {
    background: #f9fafb;
    color: #111827;
  }
  .btn-primary:hover {
    background: #e5e7eb;
  }
}

/* KPI Banner */
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
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
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
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
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
