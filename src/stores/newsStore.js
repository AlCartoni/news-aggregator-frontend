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
        // Pega a URL da Vercel ou usa a local. Se não tiver http no começo, adiciona automaticamente.
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        if (baseUrl && !baseUrl.startsWith('http')) {
          baseUrl = 'https://' + baseUrl
        }

        // Monta a URL de forma segura sem usar o "new URL()"
        let endpoint = `${baseUrl}/api/noticias`
        if (this.categoriaAtual !== 'todas') {
          endpoint += `?categoria=${this.categoriaAtual}`
        }

        console.log('Buscando notícias de:', endpoint) // Isso vai aparecer no F12 para ajudar!

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

    // 🔥 NOVA FUNÇÃO ADICIONADA AQUI 🔥
    async coletarNoticias() {
      this.loading = true
      this.error = null

      try {
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        if (baseUrl && !baseUrl.startsWith('http')) {
          baseUrl = 'https://' + baseUrl
        }

        const endpoint = `${baseUrl}/api/coletar` // ⚠️ Altere se a rota do seu FastAPI for diferente
        console.log('Acionando o scraper em:', endpoint)

        const response = await fetch(endpoint, { method: 'POST' })
        
        if (!response.ok) {
          throw new Error('Falha ao acionar o scraper.')
        }

        // Se o scraper rodou com sucesso, busca as notícias atualizadas na tela
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