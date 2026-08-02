<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div>
            <h1>Gestão de Parceiros</h1>
            <p>Liste, edite e gerencie os parceiros da sua operação</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="router.push('/admin/qr')" class="action-btn">Voltar</button>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="table-container">
        
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Carregando parceiros...</span>
        </div>
        
        <div v-else-if="parceiros.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>Nenhum parceiro encontrado</h3>
          <p>Não há parceiros cadastrados ou ocorreu um erro ao buscar os dados.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="parceiros-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Comissão</th>
                <th>Status Cartão</th>
                <th>Cód. Cartão</th>
                <th>Operador</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="parceiro in parceiros" 
                :key="parceiro.id" 
              >
                <td class="partner-name" @click="openResumoDrawer(parceiro.id)">{{ parceiro.nome }}</td>
                <td>{{ parceiro.telefone }}</td>
                <td>{{ parceiro.percentual_comissao }}</td>
                <td>{{ parceiro.status_cartao }}</td>
                <td>{{ parceiro.codigo_cartao }}</td>
                <td>{{ parceiro.operador_nome }}</td>
                <td>
                  <div class="actions-cell">
                    <button @click="openEditModal(parceiro)" class="btn-manage">Editar</button>
                    <button @click="openConfirmModal(parceiro.id)" class="btn-delete">Deletar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <ConfirmationModal
      :is-open="isConfirmModalOpen"
      title="Confirmar Exclusão"
      message="Você tem certeza que deseja excluir este parceiro? Esta ação não poderá ser desfeita."
      @close="closeConfirmModal"
      @confirm="handleDeleteConfirmed"
    />

    <ParceiroEditModal
      v-model="isEditModalOpen"
      :partner="partnerToEdit"
      @save="handleUpdatePartner"
    />

    <ParceiroResumoDrawer
      :show="isResumoDrawerOpen"
      :parceiro-id="selectedParceiroId"
      @close="closeResumoDrawer"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parceiroService } from '@/services/parceiroService';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ParceiroEditModal from '@/components/ParceiroEditModal.vue';
import ParceiroResumoDrawer from '@/components/parceiros/ParceiroResumoDrawer.vue';
import { useAlert } from '@/services/useAlert';

const router = useRouter();
const parceiros = ref([]);
const isLoading = ref(false);
const { showAlert } = useAlert();

const isConfirmModalOpen = ref(false);
const partnerToDeleteId = ref(null);

const isEditModalOpen = ref(false);
const partnerToEdit = ref(null);

const isResumoDrawerOpen = ref(false);
const selectedParceiroId = ref(null);

const openResumoDrawer = (parceiroId) => {
  selectedParceiroId.value = parceiroId;
  isResumoDrawerOpen.value = true;
};

const closeResumoDrawer = () => {
  isResumoDrawerOpen.value = false;
  selectedParceiroId.value = null;
};

const openConfirmModal = (partnerId) => {
  partnerToDeleteId.value = partnerId;
  isConfirmModalOpen.value = true;
};

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
  partnerToDeleteId.value = null;
};

const handleDeleteConfirmed = async () => {
  if (!partnerToDeleteId.value) return;

  try {
    await parceiroService.deletar(partnerToDeleteId.value);
    parceiros.value = parceiros.value.filter(p => p.id !== partnerToDeleteId.value);
    showAlert('Sucesso', 'Parceiro deletado com sucesso!', 'success');
  } catch (error) {
    console.error("Erro ao deletar parceiro:", error);
    showAlert('Erro', 'Ocorreu um erro ao deletar o parceiro.', 'error');
  } finally {
    closeConfirmModal();
  }
};

const openEditModal = (partner) => {
  partnerToEdit.value = partner;
  isEditModalOpen.value = true;
};



const handleUpdatePartner = async (updatedData) => {
  if (!updatedData || !updatedData.id) return;

  try {
    const response = await parceiroService.atualizar(updatedData.id, updatedData);
    const index = parceiros.value.findIndex(p => p.id === updatedData.id);
    if (index !== -1) {
      parceiros.value[index] = response;
    }
    showAlert('Sucesso', 'Parceiro atualizado com sucesso!', 'success');
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error);
    showAlert('Erro', 'Ocorreu um erro ao atualizar o parceiro.', 'error');
  } finally {
    isEditModalOpen.value = false;
    partnerToEdit.value = null;
  }
};



const fetchParceiros = async () => {
  isLoading.value = true;
  try {
    const response = await parceiroService.listarTodos();
    parceiros.value = response.data;
  } catch (error) {
    console.error("Erro ao listar parceiros:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchParceiros();
});

</script>

<style scoped>
.dashboard-layout { min-height: 100vh; background-color: #f3f4f6; }
.dashboard-header { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 32px 0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
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
.title-area { display: flex; align-items: center; gap: 20px; }
.icon-box { width: 56px; height: 56px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); }
.title-area h1 { margin: 0; font-size: 2rem; font-weight: 700; color: #111827; }
.title-area p { margin: 4px 0 0 0; color: #6b7280; font-size: 1rem; }
.dashboard-content { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
.table-container { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025); border: 1px solid #f9fafb; overflow: hidden; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 20px; color: #6b7280; text-align: center; }
.empty-state h3 { margin: 0; color: #1f2937; font-weight: 600; font-size: 1.25rem; }
.empty-state p { margin: 0; font-size: 0.95rem; }
.empty-icon { background: #f3f4f6; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 8px; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-wrapper { overflow-x: auto; }
.parceiros-table { width: 100%; border-collapse: collapse; text-align: left; }
.parceiros-table th, .parceiros-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; white-space: nowrap; }
.parceiros-table th { background-color: #f9fafb; font-weight: 600; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.parceiros-table tbody tr:hover { background-color: #f9fafb; }
.partner-name {
  cursor: pointer;
  color: #10b981;
  font-weight: 600;
}
.partner-name:hover {
  text-decoration: underline;
}
.actions-cell { display: flex; align-items: center; gap: 8px; }
.btn-manage {
  padding: 8px 12px; font-size: 0.85rem; border-radius: 8px; background-color: #1f2937; color: white; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s;
}
.btn-manage:hover:not(:disabled) { background-color: #374151; }
.btn-delete {
  padding: 8px 12px; font-size: 0.85rem; border-radius: 8px; background-color: #ef4444; color: white; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s;
}
.btn-delete:hover:not(:disabled) { background-color: #dc2626; }
</style>
