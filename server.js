require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

function gerarCPFValido() {
    // Gera 9 dígitos aleatórios
    const n = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
    
    // Calcula primeiro dígito verificador
    let d1 = 0;
    for (let i = 0; i < 9; i++) {
        d1 += n[i] * (10 - i);
    }
    d1 = 11 - (d1 % 11);
    if (d1 >= 10) d1 = 0;
    
    // Calcula segundo dígito verificador
    let d2 = 0;
    for (let i = 0; i < 9; i++) {
        d2 += n[i] * (11 - i);
    }
    d2 += d1 * 2;
    d2 = 11 - (d2 % 11);
    if (d2 >= 10) d2 = 0;
    
    // Formata CPF: XXX.XXX.XXX-XX
    return `${n[0]}${n[1]}${n[2]}.${n[3]}${n[4]}${n[5]}.${n[6]}${n[7]}${n[8]}-${d1}${d2}`;
}

app.use(cors());
app.use(express.json());

app.post('/api/pix/generate', async (req, res) => {
    try {
        const cpf = gerarCPFValido();
        
        const body = {
            identifier: req.body.identifier,
            amount: req.body.amount,
            client: {
                name: req.body.client.name || 'Cliente',
                email: req.body.client.email || 'cliente@email.com',
                phone: req.body.client.phone || '11999999999',
                document: cpf
            },
            products: req.body.products || [
                {
                    id: 'album_copa_2026',
                    name: 'Kit 980 Figurinhas Copa 2026 - PDF Digital',
                    quantity: 1,
                    price: req.body.amount || 19.90
                }
            ],
            metadata: req.body.metadata || {}
        };

        console.log('📤 Enviando para SigiloPay...');
        console.log('CPF Gerado:', cpf);
        console.log('Body:', JSON.stringify(body, null, 2));
        
        const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        console.log('📥 Resposta SigiloPay:', JSON.stringify(data, null, 2));
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erro no proxy:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log('🚀 Servidor rodando em http://localhost:' + PORT);
    console.log('🔑 Public Key:', PUBLIC_KEY);
    console.log('🔐 Secret Key:', SECRET_KEY.substring(0, 5) + '...');
});
