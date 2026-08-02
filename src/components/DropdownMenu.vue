<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleItemClick = (item) => {
  if (item.action) {
    item.action()
  }
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="dropdown-container" ref="dropdownRef">
    <button class="btn-primary-action" @click.stop="toggleDropdown">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      <span>Novo</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ 'is-open': isOpen }"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>

    <Transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-menu">
        <ul>
          <li v-for="(item, index) in items" :key="index" @click="handleItemClick(item)" class="dropdown-item">
            <span class="item-icon" v-html="item.icon"></span>
            <div class="item-text">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.btn-primary-action {
  background: #111827;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-primary-action:hover {
  background: #374151;
}
.theme-dark .btn-primary-action {
  background: #f9fafb;
  color: #111827;
}
.theme-dark .btn-primary-action:hover {
  background: #e5e7eb;
}
.chevron {
  transition: transform 0.2s ease-in-out;
}
.chevron.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  width: 280px;
  z-index: 100;
  overflow: hidden;
  display: block;
}
.theme-dark .dropdown-menu {
  background-color: #1f2937;
  border-color: #374151;
}
.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 8px;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.dropdown-item:hover {
  background-color: #f3f4f6;
}
.theme-dark .dropdown-item:hover {
  background-color: #374151;
}
.item-icon { font-size: 1.5rem; line-height: 1; }
.item-text { display: flex; flex-direction: column; }
.item-label { font-weight: 600; color: #1f2937; }
.theme-dark .item-label { color: #f9fafb; }
.item-description { font-size: 0.8rem; color: #6b7280; }
.theme-dark .item-description { color: #9ca3af; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>