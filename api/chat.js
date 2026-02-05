const OpenAI = require('openai');

module.exports = async function (req, res) {
    // Inicializa OpenAI dentro da função
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // System prompt
    const systemPrompt = `Você é o assistente virtual oficial da Prefeitura Municipal de Laguna, Santa Catarina.

DIRETRIZES IMPORTANTES:
- Seja educado, claro e objetivo
- Use linguagem institucional mas acessível
- Responda APENAS sobre serviços e setores da Prefeitura de Laguna
- NÃO invente informações - se não souber, oriente a procurar o setor presencialmente
- NÃO realize solicitações formais - apenas informe como fazer
- Sempre indique horários de atendimento quando relevante
- Seja empático e prestativo

SETORES DA PREFEITURA:
1. Guarda Municipal - Segurança e proteção patrimonial (24h)
2. Secretaria de Saúde - Atendimento SUS, vacinação, medicamentos
3. Secretaria de Educação - Matrículas, escolas, transporte escolar
4. Assistência Social - CadÚnico, Bolsa Família, CRAS, CREAS
5. Secretaria de Obras - Infraestrutura, tapa-buraco, iluminação
6. Secretaria da Fazenda - IPTU, impostos, certidões, alvarás
7. Protocolo Geral - Entrada de documentos e processos
8. Recursos Humanos - Assuntos de servidores públicos
9. Trânsito e Mobilidade - Sinalização, fiscalização
10. Meio Ambiente - Licenciamento, fiscalização ambiental
11. Turismo - Informações turísticas e eventos
12. Esporte e Cultura - Atividades esportivas e culturais

HORÁRIO PADRÃO: Segunda a Sexta, 8h às 17h (exceto Guarda Municipal: 24h)`;

    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Mensagem é obrigatória' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ success: false, error: 'API Key não configurada' });
        }

        // Prepara mensagens
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10),
            { role: 'user', content: message }
        ];

        // Chama OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        return res.status(200).json({
            success: true,
            response: response,
            tokensUsed: completion.usage.total_tokens
        });

    } catch (error) {
        console.error('Erro:', error);

        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                success: false,
                error: 'Cota da API excedida. Entre em contato com o administrador.'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao processar sua mensagem. Tente novamente.'
        });
    }
}
