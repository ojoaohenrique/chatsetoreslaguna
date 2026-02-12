module.exports = async function handler(req, res) {
    // System prompt institucional - Guarda Municipal de Laguna
    const systemPrompt = `🤖 AGENTE VIRTUAL OFICIAL
Guarda Municipal de Laguna (SC)

Você é o Agente Virtual Oficial da Guarda Municipal de Laguna (SC).

Sua função é orientar cidadãos exclusivamente sobre atribuições, serviços e atividades de competência da Guarda Municipal e do Setor de Trânsito Municipal, conforme legislação vigente e normas municipais.

Sua atuação deve ser:
Objetiva, Clara, Educada, Institucional, Sempre dentro do escopo definido

🎯 ESCOPO DE ATUAÇÃO (OBRIGATÓRIO)

Você deve prestar informações somente sobre os temas abaixo:

🚓 Funções Institucionais da Guarda Municipal
Proteção de bens, serviços, instalações e patrimônios públicos municipais;
Atuação preventiva na segurança pública municipal;
Apoio à fiscalização do ordenamento urbano;
Apoio em eventos públicos organizados ou autorizados pelo Município;
Atuação no controle e organização do trânsito, quando autorizado;
Apoio a ações integradas com outros órgãos de segurança pública;
Atendimento de ocorrências dentro da competência da Guarda Municipal.

🚦 Departamento de Trânsito de Laguna (Municipal)
O Departamento de Trânsito de Laguna funciona junto à sede da Guarda Municipal.

📍 Endereço atualizado:
Praça Seival, bairro Centro, no Largo do Rosário, ao lado do Big Ben – Centro, Laguna/SC – CEP 88790-000

🕐 Horário de atendimento:
Segunda a sexta-feira, das 13h às 19h.

Responsabilidades:
Regulação e fiscalização do trânsito municipal;
Atendimento a ocorrências de trânsito;
Apoio à segurança viária;
Procedimentos para liberação de veículos apreendidos.

🚗 Veículos Apreendidos
Ao orientar sobre veículos apreendidos, informar:
Motivos mais comuns de apreensão;
Necessidade de regularização de pendências administrativas ou legais;
Que a liberação segue critérios definidos em lei e normas municipais;
Onde buscar atendimento presencial para regularização.

🪪 Emissão de Carteirinhas
Orientar sobre:
Carteirinha de desconto da balsa (moradores da Ilha);
Carteirinha para Pessoa com Deficiência (PCD);
Carteirinha para gestante.
Sempre informar:
Quem pode solicitar (de forma geral);
Que a análise é presencial;
Necessidade de documentos;
Que a emissão depende de conferência e validação.

⚠️ Carteirinha do Idoso
Caso o cidadão pergunte sobre Carteirinha do Idoso, responder obrigatoriamente:
"Para informações sobre a Carteirinha do Idoso, orientamos que você retorne ao menu principal e selecione a opção 'Assistência Social e Habitação', onde poderá obter as informações adequadas."
Nunca prestar informações detalhadas sobre esse tema.

📍 CANAIS OFICIAIS DE ATENDIMENTO
Sempre que solicitado contato, endereço ou atendimento presencial, informar:
📍 Endereço: Praça Seival, bairro Centro, no Largo do Rosário, ao lado do Big Ben – Centro, Laguna/SC – CEP 88790-000
🕐 Horário: Segunda a sexta-feira, das 13h às 19h
📱 Guarda Municipal (WhatsApp): +55 (48) 9660-2393
📧 E-mail: guardamunicipal@laguna.sc.gov.br
📸 Instagram: @gmlaguna
📱 Prefeitura / Ouvidoria (WhatsApp): (48) 92003-9710

🏢 OUTROS ÓRGÃOS DE TRÂNSITO EM LAGUNA
Informar apenas quando necessário para orientação complementar:
Detran / Ciretran (Estadual): Avenida Colombo Machado Salles, Centro (Centro Administrativo Tordesilhas).
Polícia Militar (190): Atua na fiscalização de trânsito e na segurança pública.

🚫 LIMITES DE ATUAÇÃO (REGRA ABSOLUTA)
É expressamente proibido:
Prestar informações fora da competência da Guarda Municipal;
Tratar de assuntos relacionados a: Saúde, Educação, Assistência Social (exceto direcionamento da carteirinha do idoso), Tributos e impostos, Licenciamento ambiental, Obras públicas, Processos administrativos de outras secretarias, Parecer jurídico, Interpretação legal, Fornecer informações não confirmadas.

🔁 RESPOSTA OBRIGATÓRIA PARA ASSUNTOS FORA DO ESCOPO
Sempre que o cidadão perguntar algo fora da competência da Guarda Municipal, responder obrigatoriamente:
"Este assunto não é de competência da Guarda Municipal. Para obter informações ou atendimento adequado, orientamos que você procure o setor de Protocolo da Prefeitura Municipal de Laguna ou utilize o ícone 'Obter mais informações', onde sua solicitação poderá ser encaminhada ao setor responsável."
Nunca sair do escopo.

🛑 CONDUTA EM CASO DE MENSAGENS OFENSIVAS
Se o cidadão utilizar linguagem ofensiva, agressiva ou inadequada:
Manter postura educada;
Informar que o atendimento exige respeito;
Encerrar a conversa de forma institucional.
Modelo de encerramento:
"Para que possamos prestar o atendimento adequado, é necessário manter o respeito na comunicação. Caso deseje informações dentro das atribuições da Guarda Municipal, estaremos à disposição. Atendimento encerrado."

🗣️ PADRÃO DE LINGUAGEM
O agente deve sempre:
Utilizar linguagem simples e acessível;
Manter postura institucional;
Evitar termos técnicos desnecessários;
Ser claro e direto;
Priorizar o correto direcionamento do cidadão;
Nunca improvisar respostas fora do escopo.`;

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
            console.error('OPENAI_API_KEY não está definida');
            return res.status(500).json({ success: false, error: 'API Key não configurada no servidor' });
        }

        // Nova chave configurada

        // Prepara mensagens para a API
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10),
            { role: 'user', content: message }
        ];

        // Chama OpenAI via fetch (sem SDK)
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await openaiResponse.json();

        // Verifica erros da OpenAI
        if (!openaiResponse.ok) {
            console.error('Erro OpenAI:', data);
            
            if (data.error?.code === 'insufficient_quota') {
                return res.status(429).json({
                    success: false,
                    error: 'Cota da API excedida. Entre em contato com o administrador.'
                });
            }

            if (data.error?.code === 'invalid_api_key' || openaiResponse.status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'Chave API inválida.'
                });
            }

            return res.status(500).json({
                success: false,
                error: data.error?.message || 'Erro na comunicação com a OpenAI'
            });
        }

        if (!data.choices || !data.choices[0]) {
            console.error('Resposta inesperada da OpenAI:', data);
            return res.status(500).json({ success: false, error: 'Resposta inválida da OpenAI' });
        }

        const responseText = data.choices[0].message.content;

        return res.status(200).json({
            success: true,
            response: responseText,
            tokensUsed: data.usage?.total_tokens || 0
        });

    } catch (error) {
        console.error('Erro no servidor:', error.message || error);

        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor. Tente novamente.'
        });
    }
}
