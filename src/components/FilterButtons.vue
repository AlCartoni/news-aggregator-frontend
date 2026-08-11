<template>
  <div class="filters">
    <button
      v-for="cat in categorias"
      :key="cat"
      class="filter-btn"
      :class="{ active: modelValue === cat }"
      @click="$emit('update:modelValue', cat)"
    >
      {{ rotulos[cat] || cat }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categorias: Array,
  modelValue: String
})
defineEmits(['update:modelValue'])

const rotulos = {
  all: '📰 Todas',
  tecnologia: '💻 Tecnologia',
  negocios: '📊 Negócios',
  saude: '🩺 Saúde',
  ciencia: '🔬 Ciência'
}
</script>