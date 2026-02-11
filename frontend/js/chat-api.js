// ===== API CLIENT PARA COMUNICAÇÃO COM BACKEND =====

class ChatAPI {
    constructor() {
        // Detecta automaticamente se está em produção ou desenvolvimento
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        this.baseURL = isProduction ? '/api' : 'http://localhost:3000/api/chat';
        this.conversationHistory = [];
    }

    /**
     * Envia mensagem para o backend e retorna resposta do ChatGPT
     */
    async sendMessage(message) {
        try {
            const endpoint = this.baseURL.includes('localhost') ? `${this.baseURL}/message` : '/api/chat';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: this.conversationHistory
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao enviar mensagem');
            }

            const data = await response.json();

            // Atualiza histórico
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: data.response
            });

            // Limita histórico a 20 mensagens (10 pares)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return {
                success: true,
                response: data.response,
                setor: data.setor
            };

        } catch (error) {
            console.error('Erro na API:', error);
            
            // Mensagens de erro amigáveis
            if (error.message.includes('Failed to fetch')) {
                return {
                    success: false,
                    error: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
                };
            }

            if (error.message.includes('429')) {
                return {
                    success: false,
                    error: 'Você está enviando mensagens muito rapidamente. Aguarde alguns segundos.'
                };
            }

            return {
                success: false,
                error: error.message || 'Erro ao processar mensagem. Tente novamente.'
            };
        }
    }

    /**
     * Busca lista de setores disponíveis
     */
    async getSetores() {
        try {
            const response = await fetch(`${this.baseURL}/setores`);
            const data = await response.json();
            return data.setores || [];
        } catch (error) {
            console.error('Erro ao buscar setores:', error);
            return [];
        }
    }

    /**
     * Verifica saúde da API
     */
    async checkHealth() {
        // Em produção, assume que está online (a API serverless não tem endpoint de health)
        if (!this.baseURL.includes('localhost')) {
            return true;
        }
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            return data.status === 'online';
        } catch (error) {
            return false;
        }
    }

    /**
     * Limpa histórico de conversação
     */
    clearHistory() {
        this.conversationHistory = [];
    }
}

// Exporta instância global
const chatAPI = new ChatAPI();
