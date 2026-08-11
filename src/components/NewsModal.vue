<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')">&times;</button>
      
      <span class="tag">
        <i :class="noticia.icone"></i> {{ noticia.categoria }}
      </span>
      
      <h2>{{ noticia.titulo }}</h2>
      <p>{{ noticia.resumo }}</p>
      
      <p class="ai-note">
        <i class="fas fa-robot"></i> Conteúdo remodelado por IA a partir de fontes confiáveis.
      </p>
      
      <div class="meta">
        <span><i class="fas fa-newspaper"></i> {{ noticia.fonte }}</span>
        <span><i class="fas fa-clock"></i> {{ noticia.hora }}</span>
        <span><i class="fas fa-shield-alt"></i> Uso transformador (fair use)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['noticia'])
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--surface);
  max-width: 600px;
  width: 100%;
  border-radius: var(--radius);
  padding: 32px 28px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
}

.modal-close:hover {
  color: var(--text);
  transform: rotate(90deg);
}

.tag {
  background: var(--primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 40px;
  display: inline-block;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.modal h2 {
  font-size: 1.6rem;
  margin-bottom: 12px;
  line-height: 1.3;
}

.modal p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 16px;
}

.ai-note {
  font-style: italic;
  color: var(--text-secondary);
}

.meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border);
  padding-top: 16px;
  margin-top: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>