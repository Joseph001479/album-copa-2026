'use strict';

// ============ STATE ============
const state = {
    name: '',
    phone: '',
    answers: {},
    currentScreen: 's1',
    qrData: null,
    transactionId: null
};

// ============ ORDER BUMPS ============
const bumps = [
    { id: 'bump1', price: 9.99,  name: 'Pack de Pocotinhos Panini' },
    { id: 'bump2', price: 14.99, name: 'Craques da Copa em miniatura' },
    { id: 'bump3', price: 4.99,  name: 'Entrega rápida pelo WhatsApp' }
];
const BASE_PRICE = 19.90;

function updateTotal() {
    var total = BASE_PRICE;
    bumps.forEach(function(b) {
        var el = document.getElementById(b.id);
        if (el && el.checked) total += b.price;
    });
    var el = document.getElementById('totalPrice');
    if (el) el.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
}

function getTotal() {
    var total = BASE_PRICE;
    bumps.forEach(function(b) {
        var el = document.getElementById(b.id);
        if (el && el.checked) total += b.price;
    });
    return parseFloat(total.toFixed(2));
}

function getProducts() {
    var products = [
        { id: 'album_copa_2026', name: 'Kit 980 Figurinhas Copa 2026 - PDF Digital', quantity: 1, price: BASE_PRICE }
    ];
    bumps.forEach(function(b) {
        var el = document.getElementById(b.id);
        if (el && el.checked) {
            products.push({ id: b.id, name: b.name, quantity: 1, price: b.price });
        }
    });
    return products;
}

// ============ POP-UP DE COMPRAS ============
const buyers = [
    { name: 'Marcos Silva', city: 'São Paulo' },
    { name: 'Ana Oliveira', city: 'Rio de Janeiro' },
    { name: 'Pedro Santos', city: 'Belo Horizonte' },
    { name: 'Carla Souza', city: 'Salvador' },
    { name: 'Lucas Lima', city: 'Brasília' },
    { name: 'Juliana Costa', city: 'Fortaleza' },
    { name: 'Rafael Almeida', city: 'Curitiba' },
    { name: 'Fernanda Rocha', city: 'Recife' },
    { name: 'Bruno Martins', city: 'Porto Alegre' },
    { name: 'Amanda Pereira', city: 'Manaus' },
    { name: 'Thiago Rodrigues', city: 'Goiânia' },
    { name: 'Patrícia Nunes', city: 'Belém' },
    { name: 'Gabriel Ferreira', city: 'Campinas' },
    { name: 'Larissa Barbosa', city: 'Santos' },
    { name: 'Diego Carvalho', city: 'Vitória' }
];

let usedBuyers = [];
let popupTimeout = null;
let popupVisible = false;

function getRandomBuyer() {
    if (usedBuyers.length >= buyers.length) usedBuyers = [];
    const available = buyers.filter((_, i) => !usedBuyers.includes(i));
    const randomIndex = Math.floor(Math.random() * available.length);
    usedBuyers.push(buyers.indexOf(available[randomIndex]));
    return available[randomIndex];
}

function showPurchasePopup() {
    if (popupVisible) return;
    const buyer = getRandomBuyer();
    document.getElementById('popupText').innerHTML = '<strong>' + buyer.name + '</strong> de ' + buyer.city + ' acabou de adquirir';
    document.getElementById('purchasePopup').classList.add('show');
    popupVisible = true;
    popupTimeout = setTimeout(hidePopup, 4000);
}

function hidePopup() {
    document.getElementById('purchasePopup').classList.remove('show');
    popupVisible = false;
    if (popupTimeout) clearTimeout(popupTimeout);
}

function startPurchasePopups() {
    setTimeout(function() {
        showPurchasePopup();
        scheduleNextPopup();
    }, 5000);
}

function scheduleNextPopup() {
    var delay = 15000 + Math.random() * 15000;
    setTimeout(function() {
        showPurchasePopup();
        scheduleNextPopup();
    }, delay);
}

// ============ NAVIGATION ============
function goTo(screenId) {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
    });
    var target = document.getElementById(screenId);
    if (!target) return;
    target.classList.add('active');
    state.currentScreen = screenId;

    // Garante que a tela sempre abra no topo (cabeçalho), nunca no meio
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (screenId === 's7') startCalculating();
    if (screenId === 's8') {
        document.getElementById('deliveryPhone').textContent = formatPhone(state.phone);
        fetchQrCodeFromAPI();
        startPurchasePopups();
    }
}

// ============ PHONE VALIDATION ============
function validatePhoneInput(input) {
    var value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    input.value = value;
    if (value.length >= 10) {
        input.classList.remove('error');
        document.getElementById('errorPhone').classList.remove('show');
    }
}

// ============ FORM SUBMIT ============
function submitForm() {
    var nameInput = document.getElementById('inputName');
    var phoneInput = document.getElementById('inputPhone');
    var errorName = document.getElementById('errorName');
    var errorPhone = document.getElementById('errorPhone');

    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim().replace(/\D/g, '');

    errorName.classList.remove('show');
    errorPhone.classList.remove('show');
    nameInput.classList.remove('error');
    phoneInput.classList.remove('error');

    var valid = true;

    if (!name || name.length < 2) {
        errorName.classList.add('show');
        nameInput.classList.add('error');
        valid = false;
    }

    if (!phone || (phone.length !== 10 && phone.length !== 11)) {
        errorPhone.classList.add('show');
        phoneInput.classList.add('error');
        valid = false;
    }

    if (!valid) return;

    state.name = name;
    state.phone = phone;
    goTo('s3');
}

function formatPhone(phone) {
    if (phone.length === 11) {
        return '(' + phone.substring(0,2) + ') ' + phone.substring(2,7) + '-' + phone.substring(7);
    } else if (phone.length === 10) {
        return '(' + phone.substring(0,2) + ') ' + phone.substring(2,6) + '-' + phone.substring(6);
    }
    return phone;
}

// ============ QUIZ ANSWER ============
function answer(questionNum, answerValue, nextScreen) {
    state.answers[questionNum] = answerValue;

    var progressMap = { 3: 'progress3', 4: 'progress4', 5: 'progress5', 6: 'progress6' };
    var values = { 3: 25, 4: 50, 5: 75, 6: 100 };

    var barId = progressMap[questionNum];
    if (barId) {
        var bar = document.getElementById(barId);
        if (bar) bar.style.width = values[questionNum] + '%';
    }

    goTo(nextScreen);
}

// ============ CALCULATING ANIMATION ============
function startCalculating() {
    var messages = [
        'Analisando suas respostas...',
        'Montando as 980 figurinhas por seleção...',
        'Organizando por páginas do álbum oficial...',
        'Verificando duplicatas — nenhuma encontrada!',
        'Gerando PDF em alta qualidade...',
        'Pronto! ✅'
    ];

    var el = document.getElementById('calcMessage');
    if (!el) return;

    var msgIdx = 0;
    var charIdx = 0;

    function type() {
        if (msgIdx >= messages.length) {
            setTimeout(function() { goTo('s8'); }, 700);
            return;
        }

        var msg = messages[msgIdx];

        if (charIdx <= msg.length) {
            el.textContent = msg.substring(0, charIdx);
            charIdx++;
            setTimeout(type, 22 + Math.random() * 28);
        } else {
            msgIdx++;
            charIdx = 0;
            setTimeout(type, 500);
        }
    }

    type();
}

// ============ API SIGILOPAY VIA PROXY LOCAL ============
async function fetchQrCodeFromAPI() {
    var qrImage    = document.getElementById('qrImage');
    var qrCanvas   = document.getElementById('qrCanvas');
    var qrCodeText = document.getElementById('qrCodeText');
    var btnCopy    = document.getElementById('btnCopy');
    var qrLoading  = document.getElementById('qrLoading');

    var identifier = 'album_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    var total      = getTotal();
    var products   = getProducts();

    var body = {
        identifier: identifier,
        amount: total,
        client: {
            name: state.name,
            phone: formatPhone(state.phone),
            email: state.phone + '@albumpro.com'
        },
        products: products,
        metadata: {
            product: 'Album Copa 2026',
            figurinhas: '980',
            source: 'AlbumPro'
        }
    };

    try {
        qrLoading.style.display = 'block';
        qrLoading.textContent = 'Gerando QR Code...';
        qrCanvas.style.display = 'none';
        qrImage.style.display = 'none';
        qrCodeText.style.display = 'none';
        btnCopy.style.display = 'none';

        var response = await fetch('https://album-copa-2026-5liy.onrender.com/api/pix/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        var data = await response.json();
        console.log('Resposta API:', data);

        if (data.pix && data.pix.code) {
            state.qrData = data.pix.code;
            state.transactionId = data.transactionId;

            qrCanvas.innerHTML = '';
            new QRCode(qrCanvas, {
                text: data.pix.code,
                width: 200,
                height: 200,
                correctLevel: QRCode.CorrectLevel.M
            });

            qrLoading.style.display = 'none';
            qrCanvas.style.display = 'flex';
            qrCanvas.style.justifyContent = 'center';
            qrCodeText.textContent = data.pix.code;
            qrCodeText.style.display = 'block';
            btnCopy.style.display = 'flex';

            console.log('✅ Transação criada:', data.transactionId, '| Total: R$', total);
        } else {
            throw new Error(data.message || 'Erro ao gerar QR Code');
        }

    } catch (error) {
        console.error('❌ Erro:', error);
        qrLoading.style.display = 'block';
        qrLoading.textContent = '⚠️ Erro ao conectar. Tente novamente.';
    }
}

// ============ COPY QR CODE ============
function copyQrCode() {
    var text = state.qrData || document.getElementById('qrCodeText').textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('btnCopy');
        var fb  = document.getElementById('copyFeedback');

        btn.classList.add('copied');
        btn.innerHTML = '✅ CÓDIGO COPIADO!';
        if (fb) fb.style.display = 'block';

        setTimeout(function() {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPIAR CÓDIGO PIX';
            if (fb) fb.style.display = 'none';
        }, 3000);
    }).catch(function() {
        alert('Não foi possível copiar. Por favor, copie manualmente.');
    });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', function() {
    goTo('s1');
});
