import { defineStore } from 'pinia'

export const useNewsStore = defineStore('news', {
  state: () => ({
    noticias: [],
    loading: false,
    error: null,
    categoriaAtual: 'todas',
    termoBusca: ''
  }),

  actions: {
    async buscarNoticias() {
      this.loading = true
      this.error = null

      try {
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        if (baseUrl && !baseUrl.startsWith('http')) {
          baseUrl = 'https://' + baseUrl
        }

        let endpoint = `${baseUrl}/api/noticias`
        if (this.categoriaAtual !== 'todas') {
          endpoint += `?categoria=${this.categoriaAtual}`
        }

        console.log('Buscando notícias de:', endpoint) 

        const response = await fetch(endpoint)
        
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

    async coletarNoticias() {
      this.loading = true
      this.error = null

      try {
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        if (baseUrl && !baseUrl.startsWith('http')) {
          baseUrl = 'https://' + baseUrl
        }

        // Garanta que aqui tem o /noticias/ no meio!
        const endpoint = `${baseUrl}/api/noticias/coletar` 
        console.log('Acionando o scraper em:', endpoint)

        const response = await fetch(endpoint, { method: 'POST' })
        
        if (!response.ok) {
          throw new Error('Falha ao acionar o scraper.')
        }

        await this.buscarNoticias()
      } catch (err) {
        console.error('Erro ao coletar:', err)
        this.error = 'Erro ao tentar acionar o scraper.'
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