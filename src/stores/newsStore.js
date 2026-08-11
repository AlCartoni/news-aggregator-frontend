import { defineStore } from 'pinia'

export const useNewsStore = defineStore('news', {
  state: () => ({
    noticias: [],
    loading: false,
    error: null, // 🔥 Guarda mensagens de erro da API
    categoriaAtual: 'todas',
    termoBusca: ''
  }),

  actions: {
    async buscarNoticias() {
      this.loading = true
      this.error = null

      try {
        const url = new URL(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/noticias`)
        
        if (this.categoriaAtual !== 'todas') {
          url.searchParams.append('categoria', this.categoriaAtual)
        }

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar as notícias. Tente novamente mais tarde.')
        }

        const data = await response.json()
        this.noticias = data
      } catch (err) {
        console.error('Erro na API:', err)
        this.error = 'Ocorreu um erro ao conectar com o servidor.'
      } finally {
        this.loading = false
      }
    },

    setCategoria(categoria) {
      this.categoriaAtual = categoria
      this.buscarNoticias()
    },

    setBusca(termo) {
      this.termoBusca = termo
    }
  },

  getters: {
    noticiasFiltradas(state) {
      if (!state.termoBusca.trim()) {
        return state.noticias
      }

      const termo = state.termoBusca.toLowerCase()
      return state.noticias.filter(noticia => 
        noticia.titulo.toLowerCase().includes(termo) ||
        (noticia.resumo && noticia.resumo.toLowerCase().includes(termo))
      )
    }
  }
})