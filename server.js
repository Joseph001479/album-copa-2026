require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

function gerarCPF() {
    const rand = (n) => Math.floor(Math.random() * n);
    
    let n = Array.from({length: 9}, () => rand(10));
    
    let d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    
    let d2 = [...n, d1].reduce((acc, val, i) => acc + val * (11 - i), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;
    
    const cpf = [...n, d1, d2];
    return `${cpf.slice(0,3).join('')}.${cpf.slice(3,6).join('')}.${cpf.slice(6,9).join('')}-${d1}${d2}`;
}

app.use(cors());
app.use(express.json());

app.post('/api/pix/generate', async (req, res) => {
    try {
        const body = {
            ...req.body,
            client: {
                ...req.body.client,
                document: gerarCPF()
            }
        };

        console.log('📤 Enviando para SigiloPay...');
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
