<template>
  <button class="theme-toggle" @click="$emit('toggle')">
    <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
    <span>{{ isDark ? 'Claro' : 'Escuro' }}</span>
  </button>
</template>

<script setup>
defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})
defineEmits(['toggle'])
</script>

<style scoped>
.theme-toggle {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 40px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.theme-toggle:hover {
  transform: scale(1.02);
  border-color: var(--primary);
}
</style>