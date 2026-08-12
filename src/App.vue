<template>
  <div id="app">
    <!-- HEADER -->
    <header class="app-header">
      <div class="logo">
        <i class="fas fa-gamepad"></i>
        <span>Tech<span>Hub</span></span>
      </div>
      <div class="header-actions">
        <StatusBadge />
        <ThemeToggle :isDark="isDarkMode" @toggle="toggleTheme" />
      </div>
    </header>

    <!-- BARRA DE BUSCA E FILTROS -->
    <div class="search-section">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar notícias de tech e games..."
          v-model="termoBusca"
        />
        <button v-if="termoBusca" class="search-clear" @click="termoBusca = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="filters">
      <button
        v-for="cat in categorias"
        :key="cat.valor"
        class="filter-btn"
        :class="{ active: filtroAtual === cat.valor }"
        @click="filtroAtual = cat.valor"
      >
        {{ cat.rotulo }}
      </button>
    </div>

    <!-- RESULTADOS / LOADING / EMPTY -->
    <div v-if="carregando" class="grid skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-tag"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-footer"></div>
      </div>
    </div>

    <div v-else class="grid">
      <div
        v-for="noticia in noticiasFiltradas"
        :key="noticia.id"
        class="card"
        :style="{ animationDelay: (noticia.id * 0.05) + 's' }"
        @click="abrirModal(noticia.id)"
      >
        <!-- 🖼️ IMAGEM -->
        <div class="card-image">
          <img 
            :src="noticia.imagem || '/placeholder.jpg'" 
            :alt="noticia.titulo"
            @error="(e) => e.target.src = '/placeholder.jpg'"
          />
        </div>
        
        <span class="card-tag" :class="'cat-' + noticia.categoria">
          <i :class="noticia.icone"></i> {{ noticia.categoria }}
        </span>
        <h3>{{ noticia.titulo }}</h3>
        <p>{{ noticia.resumo }}</p>
        <div class="card-footer">
          <span class="source">
            <i class="fas fa-newspaper"></i> {{ noticia.fonte }}
          </span>
          <span>{{ formatarHora(noticia.criado_em) }}</span>
        </div>
      </div>

      <div v-if="noticiasFiltradas.length === 0 && !carregando" class="empty-state">
        <i class="fas fa-gamepad"></i>
        <h3>Nenhuma notícia encontrada</h3>
        <p>Tente ajustar os filtros ou a busca</p>
        <button class="btn-coletar" @click="coletarNoticias">
          <i class="fas fa-sync-alt"></i> Buscar novidades agora
        </button>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="noticiaSelecionada" class="modal-overlay" @click.self="fecharModal">
      <div class="modal">
        <button class="modal-close" @click="fecharModal">&times;</button>
        
        <!-- 🖼️ IMAGEM NO MODAL -->
        <div class="modal-image">
          <img 
            :src="noticiaSelecionada.imagem || '/placeholder.jpg'" 
            :alt="noticiaSelecionada.titulo"
            @error="(e) => e.target.src = '/placeholder.jpg'"
          />
        </div>
        
        <span class="tag" :class="'cat-' + noticiaSelecionada.categoria">
          <i :class="noticiaSelecionada.icone"></i> {{ noticiaSelecionada.categoria }}
        </span>
        <h2>{{ noticiaSelecionada.titulo }}</h2>
        <p>{{ noticiaSelecionada.resumo }}</p>
        <p class="ai-note">
          <i class="fas fa-robot"></i> Conteúdo remodelado por IA a partir de fontes confiáveis.
        </p>
        <div class="meta">
          <span><i class="fas fa-newspaper"></i> {{ noticiaSelecionada.fonte }}</span>
          <span><i class="fas fa-clock"></i> {{ formatarHora(noticiaSelecionada.criado_em) }}</span>
          <span><i class="fas fa-shield-alt"></i> Uso transformador (fair use)</span>
        </div>
        <a v-if="noticiaSelecionada.link" :href="noticiaSelecionada.link" target="_blank" class="btn-link">
          <i class="fas fa-external-link-alt"></i> Ver fonte original
        </a>
      </div>
    </div>

    <!-- TOAST -->
    <div v-if="toastVisivel" class="toast" :class="{ show: toastVisivel }">
      <i class="fas fa-sync-alt fa-spin"></i>
      {{ toastMensagem }}
    </div>

    <!-- FOOTER -->
    <footer class="app-footer">
      <p>
        <i class="fas fa-brain"></i> TechHub • Curadoria com IA •
        <i class="fas fa-gamepad"></i> Focado em tecnologia e games
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNewsStore } from './stores/newsStore'
import Logo from './components/Logo.vue'
import StatusBadge from './components/StatusBadge.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const store = useNewsStore()

// ============================================================
// TEMA
// ============================================================
const isDarkMode = ref(false)

function aplicarTema(escuro) {
  if (escuro) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  aplicarTema(isDarkMode.value)
}

// ============================================================
// FILTROS E BUSCA
// ============================================================
const filtroAtual = ref('all')
const termoBusca = ref('')
const carregando = ref(false)

const categorias = [
  { valor: 'all', rotulo: '🔥 Todas' },
  { valor: 'tecnologia', rotulo: '💻 Tecnologia' },
  { valor: 'games', rotulo: '🎮 Games' },
  { valor: 'hardware', rotulo: '🖥️ Hardware' },
  { valor: 'software', rotulo: '📱 Software' },
  { valor: 'inovacao', rotulo: '🚀 Inovação' }
]

// ============================================================
// FILTROS E BUSCA (CORRIGIDO)
// ============================================================
const noticiasFiltradas = computed(() => {
  return store.noticias.filter((noticia) => {
    // 1. Verifica se a categoria bate (ou se é 'all')
    const bateCategoria = 
      filtroAtual.value === 'all' || 
      noticia.categoria?.toLowerCase() === filtroAtual.value.toLowerCase()

    // 2. Verifica se o texto digitado existe no título ou resumo
    const termo = termoBusca.value.toLowerCase().trim()
    const bateBusca = 
      !termo || 
      noticia.titulo?.toLowerCase().includes(termo) || 
      noticia.resumo?.toLowerCase().includes(termo)

    // Só mostra a notícia se passar nos dois filtros
    return bateCategoria && bateBusca
  })
})

// ============================================================
// MODAL
// ============================================================
const noticiaSelecionada = ref(null)

function abrirModal(id) {
  noticiaSelecionada.value = store.noticias.find(n => n.id === id)
}

function fecharModal() {
  noticiaSelecionada.value = null
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharModal()
})

// ============================================================
// TOAST
// ============================================================
const toastVisivel = ref(false)
const toastMensagem = ref('')

function mostrarToast(mensagem) {
  toastMensagem.value = mensagem
  toastVisivel.value = true
  setTimeout(() => {
    toastVisivel.value = false
  }, 3000)
}

// ============================================================
// FORMATAR HORA
// ============================================================
function formatarHora(data) {
  if (!data) return 'Data desconhecida'
  const d = new Date(data)
  const agora = new Date()
  const diff = Math.floor((agora - d) / 1000 / 60)
  
  if (diff < 1) return 'Agora mesmo'
  if (diff < 60) return `${diff}m atrás`
  if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
  return `${Math.floor(diff / 1440)}d atrás`
}

// ============================================================
// COLETAR NOTÍCIAS
// ============================================================
async function coletarNoticias() {
  carregando.value = true
  const resultado = await store.coletarNoticias()
  carregando.value = false
  mostrarToast('🎮 ' + (resultado.mensagem || 'Novidades coletadas!'))
  await store.buscarNoticias({ categoria: filtroAtual.value })
}

// ============================================================
// ON MOUNTED
// ============================================================
onMounted(async () => {
  const salvo = localStorage.getItem('theme')
  if (salvo === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  carregando.value = true
  await store.buscarNoticias({ categoria: filtroAtual.value })
  carregando.value = false

  setInterval(() => {
    store.buscarNoticias({ categoria: filtroAtual.value })
    mostrarToast('🔄 Novidades atualizadas automaticamente!')
  }, 60000)
})

</script>

<style>
/* ============================================================
   RESET E VARIÁVEIS
   ============================================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0e17;
  --surface: #121a2a;
  --text: #e8edf5;
  --text-secondary: #8899bb;
  --border: #1e2d45;
  --primary: #00d4ff;
  --primary-hover: #00b8e6;
  --shadow: 0 4px 30px rgba(0, 212, 255, 0.08);
  --radius: 16px;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --color-tecnologia: #00d4ff;
  --color-games: #ff6b6b;
  --color-hardware: #ff9f43;
  --color-software: #a29bfe;
  --color-inovacao: #00d2d3;
}

html.dark {
  --bg: #0a0e17;
  --surface: #121a2a;
  --text: #e8edf5;
  --text-secondary: #8899bb;
  --border: #1e2d45;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background var(--transition), color var(--transition);
  padding: 24px 16px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

#app {
  max-width: 1100px;
  width: 100%;
}

/* ============================================================
   HEADER
   ============================================================ */
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 700;
}

.logo i {
  color: var(--primary);
  font-size: 2rem;
}

.logo span {
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ============================================================
   BUSCA
   ============================================================ */
.search-section {
  margin-bottom: 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 44px;
  border-radius: 40px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  transition: var(--transition);
  box-shadow: var(--shadow);
  outline: none;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
}

.search-clear {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.search-clear:hover {
  background: var(--border);
  color: var(--text);
}

/* ============================================================
   FILTROS
   ============================================================ */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.filter-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 20px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--text);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: var(--primary);
  color: var(--bg);
  border-color: var(--primary);
}

/* ============================================================
   CARDS COM IMAGEM
   ============================================================ */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

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
  animation: fadeInUp 0.5s ease both;
  overflow: hidden;
  word-wrap: break-word;
}

.card:hover {
  transform: translateY(-6px);
  border-color: var(--primary);
  box-shadow: 0 12px 40px rgba(0, 212, 255, 0.15);
}

/* 🖼️ IMAGEM DO CARD */
.card-image {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--border);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-image img {
  transform: scale(1.03);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-tag {
  display: inline-block;
  color: var(--bg);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 4px 14px;
  border-radius: 40px;
  margin-bottom: 10px;
  align-self: flex-start;
  transition: var(--transition);
  flex-shrink: 0;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-tecnologia { background: var(--color-tecnologia); color: #0a0e17; }
.cat-games { background: var(--color-games); color: #0a0e17; }
.cat-hardware { background: var(--color-hardware); color: #0a0e17; }
.cat-software { background: var(--color-software); color: #0a0e17; }
.cat-inovacao { background: var(--color-inovacao); color: #0a0e17; }

.card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
  padding-top: 10px;
  flex-shrink: 0;
}

.source {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ============================================================
   SKELETON COM IMAGEM
   ============================================================ */
.skeleton-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.skeleton-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px 22px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background: var(--border);
  animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-tag {
  width: 80px;
  height: 22px;
  border-radius: 40px;
  background: var(--border);
  animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-title {
  width: 85%;
  height: 20px;
  border-radius: 4px;
  background: var(--border);
  animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-text {
  width: 100%;
  height: 14px;
  border-radius: 4px;
  background: var(--border);
  animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-footer {
  width: 60%;
  height: 12px;
  border-radius: 4px;
  background: var(--border);
  animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

/* ============================================================
   MODAL COM IMAGEM
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
  animation: fadeIn 0.25s ease;
}

.modal {
  background: var(--surface);
  max-width: 600px;
  width: 100%;
  border-radius: var(--radius);
  padding: 32px 28px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  animation: scaleIn 0.25s ease;
}

/* 🖼️ IMAGEM DO MODAL */
.modal-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: var(--border);
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
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
  color: var(--bg);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 4px 14px;
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

.btn-link {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--primary);
  color: var(--bg);
  border-radius: 40px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: var(--transition);
}

.btn-link:hover {
  background: var(--primary-hover);
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: var(--text);
}

.btn-coletar {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--primary);
  color: var(--bg);
  border: none;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.btn-coletar:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* ============================================================
   TOAST
   ============================================================ */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: var(--surface);
  color: var(--text);
  padding: 12px 24px;
  border-radius: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast i {
  color: var(--primary);
}

/* ============================================================
   FOOTER
   ============================================================ */
.app-footer {
  text-align: center;
  padding: 24px 0 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
  margin-top: 16px;
}

.app-footer i {
  color: var(--primary);
}

/* ============================================================
   RESPONSIVIDADE
   ============================================================ */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .header-actions {
    justify-content: space-between;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .modal {
    padding: 24px 18px;
  }
  .filters {
    gap: 6px;
  }
  .filter-btn {
    padding: 6px 14px;
    font-size: 0.75rem;
  }
  .search-input {
    font-size: 0.85rem;
    padding: 10px 44px 10px 40px;
  }
  .card-image {
    height: 120px;
  }
  .modal-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  body {
    padding: 12px 10px;
  }
  .card {
    padding: 16px 18px;
  }
  .toast {
    width: 90%;
    font-size: 0.8rem;
    padding: 10px 18px;
  }
  .card-image {
    height: 100px;
  }
}
</style>