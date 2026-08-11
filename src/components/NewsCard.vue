<template>
  <div class="card" @click="$emit('click')">
    <span class="card-tag">
      <i :class="noticia.icone"></i> {{ noticia.categoria }}
    </span>
    <h3>{{ noticia.titulo }}</h3>
    <p>{{ noticia.resumo }}</p>
    <div class="card-footer">
      <span class="source">
        <i class="fas fa-newspaper"></i> {{ noticia.fonte }}
      </span>
      <span>{{ noticia.hora }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps(['noticia'])
defineEmits(['click'])
</script>

<style scoped>
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px 22px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: var(--transition);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.card-tag {
  display: inline-block;
  background: var(--primary);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 3px 12px;
  border-radius: 40px;
  margin-bottom: 12px;
  align-self: flex-start;
}

.card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
}

.card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

.source {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>