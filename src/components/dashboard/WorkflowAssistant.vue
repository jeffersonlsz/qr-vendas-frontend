<template>
  <div class="workflow-assistant-card">
    <!-- Card Header -->
    <header class="assistant-header">
      <div class="icon-wrapper">
        <i class="bi bi-stars"></i>
      </div>
      <div class="title-wrapper">
        <h2 class="assistant-title">Assistente</h2>
        <p class="assistant-subtitle">Acompanhando sua operação em tempo real</p>
      </div>
    </header>

    <!-- Sections -->
    <main class="assistant-body">
      <!-- Status Section -->
      <section class="assistant-section status-section">
        <span :class="['status-indicator', `status-${workflow.status}`]"></span>
        <p class="status-text">
          <span v-if="workflow.status === 'ok'">🟢 Tudo funcionando normalmente.</span>
          <span v-else-if="workflow.status === 'attention'">🟡 Requer atenção em alguns pontos.</span>
          <span v-else>🔴 Há problemas críticos.</span>
          {{ workflow.statusText }}
        </p>
      </section>

      <!-- Next Action Section -->
      <section class="assistant-section next-action-section">
        <h3 class="section-title">⭐ Próxima ação recomendada</h3>
        <p class="next-action-description">
          Você possui <strong>{{ workflow.proximaAcao.quantidade }} solicitações</strong> aguardando contato. Entrar em contato agora aumenta significativamente a chance de conversão.
        </p>
        <button class="btn btn-success btn-lg w-100 action-button">
          Ver solicitações
        </button>
      </section>

      <!-- Checklist Section -->
      <section class="assistant-section">
        <h3 class="section-title">Fluxo do negócio</h3>
        <ul class="checklist">
          <li v-for="item in workflow.checklist" :key="item.text" class="checklist-item">
            <span class="checklist-icon">{{ item.icon }}</span>
            <span class="checklist-text">{{ item.text }}</span>
          </li>
        </ul>
      </section>
      
      <!-- Summary Section -->
      <section class="assistant-section">
         <h3 class="section-title">Resumo rápido</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-value">{{ workflow.resumo.parceiros }}</span>
            <span class="summary-label">Parceiros ativos</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">{{ workflow.resumo.cartoes }}</span>
            <span class="summary-label">Cartões disponíveis</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">{{ workflow.resumo.aguardando }}</span>
            <span class="summary-label">Solicitações</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">{{ workflow.resumo.convertidos }}</span>
            <span class="summary-label">Conversões</span>
          </div>
        </div>
      </section>

      <!-- Insight Section -->
      <section class="assistant-section insight-section">
        <h3 class="section-title">Insights</h3>
        <div class="info-box insight-box">
          <p>{{ workflow.insight }}</p>
        </div>
      </section>

      <!-- Tip Section -->
      <section class="assistant-section">
        <h3 class="section-title">💡 Dica</h3>
        <div class="info-box tip-box">
          <p>{{ workflow.dica }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const workflow = ref({
  status: "ok",
  statusText: "Todos os parceiros ativos estão recebendo solicitações normalmente.",
  proximaAcao: {
    titulo: "Entrar em contato com novos leads",
    quantidade: 5
  },
  checklist: [
    { icon: '✅', text: 'Cartões gerados' },
    { icon: '✅', text: 'Cartazes impressos' },
    { icon: '✅', text: 'Parceiros cadastrados' },
    { icon: '🟡', text: 'Cartões aguardando associação' },
    { icon: '🟡', text: 'Solicitações aguardando atendimento' },
    { icon: '⬜', text: 'Conversões deste mês' },
    { icon: '⬜', text: 'Pagamento de comissão' },
  ],
  insight: "Parceiros que recebem o cartaz no mesmo dia da associação costumam gerar mais solicitações.",
  dica: "Associe os cartões disponíveis antes de imprimir novos cartazes.",
  resumo: {
    parceiros: 12,
    cartoes: 7,
    aguardando: 5,
    convertidos: 3
  }
});
</script>

<style scoped>
.workflow-assistant-card {
  background-color: #f7f7f7;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9e9e9;
  max-width: 400px;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.icon-wrapper {
  font-size: 2rem;
  color: #6a44ff;
  background-color: #e9e3ff;
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.assistant-subtitle {
  margin: 0;
  color: #777;
  font-size: 0.9rem;
}

.assistant-body {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.assistant-section {
  position: relative;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

/* Status Section */
.status-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 1rem;
}
.status-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
}

/* Next Action Section */
.next-action-section {
  background: linear-gradient(145deg, #f0f4ff, #e6edff);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ff;
}
.next-action-description {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #3f51b5;
}
.action-button {
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}
.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

/* Checklist Section */
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #444;
}
.checklist-icon {
  font-size: 1.1rem;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.summary-item {
  background: #fff;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: background-color 0.2s ease;
}

.summary-item:hover {
    background-color: #f0f0f0;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}
.summary-label {
  font-size: 0.8rem;
  color: #777;
}

/* Info Boxes (Insights & Tips) */
.info-box {
  padding: 1.25rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
}
.info-box p {
  margin: 0;
}

.insight-box {
  background-color: #e3f2fd;
  color: #0d47a1;
  border: 1px solid #bbdefb;
}

.tip-box {
  background-color: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #c8e6c9;
}
</style>
