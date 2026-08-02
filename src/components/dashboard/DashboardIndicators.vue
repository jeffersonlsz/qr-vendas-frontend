<template>
  <div class="dashboard-indicators">
    <div class="row g-4">
      <div v-for="(indicator, index) in indicadores" :key="index" class="col-12 col-md-6 col-lg-3">
        <div class="card kpi-card shadow-sm h-100">
          <div class="card-body d-flex flex-column justify-content-between">
            <div class="d-flex align-items-center mb-3">
              <div :class="['icon-wrapper', `bg-${indicator.cor}-light`, `text-${indicator.cor}`]">
                <i :class="['bi', indicator.icone]"></i>
              </div>
              <h5 class="card-title mb-0 ms-3">{{ indicator.titulo }}</h5>
            </div>
            <div class="main-value mb-1">
              {{ indicator.valor }}
            </div>
            <div class="d-flex justify-content-between align-items-end">
              <p class="card-subtitle text-muted mb-0">{{ indicator.subtitulo }}</p>
              <span class="trend-indicator text-success">
                <i class="bi bi-arrow-up-right"></i> +10%
                <!-- Placeholder for actual trend, can be dynamic later -->
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const indicadores = ref([
  {
    titulo: 'Solicitações novas',
    valor: 5,
    subtitulo: 'Precisam de atenção',
    icone: 'bi-people',
    cor: 'success'
  },
  {
    titulo: 'Em atendimento',
    valor: 8,
    subtitulo: 'Aguardando retorno',
    icone: 'bi-clock',
    cor: 'warning'
  },
  {
    titulo: 'Convertidas',
    valor: 3,
    subtitulo: '+50% vs mês anterior',
    icone: 'bi-check-circle',
    cor: 'primary'
  },
  {
    titulo: 'Comissão do mês',
    valor: 'R$ 1.240,00',
    subtitulo: 'Pendente: R$ 620,00',
    icone: 'bi-currency-dollar',
    cor: 'info'
  }
]);
</script>

<style scoped>
.dashboard-indicators {
  padding: 2rem 0;
}

.kpi-card {
  border: none;
  border-radius: 1rem;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.kpi-card .card-body {
  padding: 1.5rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  /* Adjust background colors for light variants */
  background-color: var(--bs-success-bg-subtle);
}

.bg-success-light { background-color: var(--bs-success-bg-subtle, #d1e7dd); }
.bg-warning-light { background-color: var(--bs-warning-bg-subtle, #fff3cd); }
.bg-primary-light { background-color: var(--bs-primary-bg-subtle, #cfe2ff); }
.bg-info-light { background-color: var(--bs-info-bg-subtle, #cff4fc); }


.kpi-card .card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #333;
}

.main-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #222;
  line-height: 1;
}

.kpi-card .card-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6c757d;
}

.trend-indicator {
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.trend-indicator i {
  margin-right: 0.25rem;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .col-md-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (min-width: 992px) {
  .col-lg-3 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}
</style>
