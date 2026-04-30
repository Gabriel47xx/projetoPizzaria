// --- Configuração ---
const WHATSAPP_NUMBER = "5564992740295"; // Número fornecido pelo usuário

// --- Mock de Dados ---
const pizzas = [
    { id: 'p1', name: 'Margherita', desc: 'Molho de tomate, mussarela, manjericão fresco e azeite.', price: 45.00, img: 'assets/default_pizza.png' },
    { id: 'p2', name: 'Pepperoni', desc: 'Mussarela, fatias de pepperoni e orégano.', price: 55.00, img: 'assets/default_pizza.png' },
    { id: 'p3', name: 'Quatro Queijos', desc: 'Mussarela, provolone, gorgonzola e parmesão.', price: 60.00, img: 'assets/default_pizza.png' },
    { id: 'p4', name: 'Calabresa', desc: 'Mussarela, calabresa fatiada e cebola.', price: 50.00, img: 'assets/default_pizza.png' },
    { id: 'p5', name: 'Frango com Catupiry', desc: 'Frango desfiado, mussarela e legítimo catupiry.', price: 58.00, img: 'assets/default_pizza.png' },
    { id: 'p6', name: 'Portuguesa', desc: 'Mussarela, presunto, ovos, cebola, ervilha e azeitona.', price: 56.00, img: 'assets/default_pizza.png' }
];

const drinks = [
    { id: 'd1', name: 'Coca-Cola 2L', desc: 'Refrigerante gelado', price: 14.00, img: 'assets/default_drink.png' },
    { id: 'd2', name: 'Suco de Laranja 1L', desc: 'Natural, feito na hora', price: 12.00, img: 'assets/default_drink.png' },
    { id: 'd3', name: 'Heineken Long Neck', desc: 'Cerveja 330ml', price: 9.00, img: 'assets/default_drink.png' },
    { id: 'd4', name: 'Guaraná Antarctica 2L', desc: 'Refrigerante gelado', price: 12.00, img: 'assets/default_drink.png' }
];

// --- Estado da Aplicação ---
let cart = [];

// --- Elementos do DOM ---
const pizzasGrid = document.getElementById('pizzas-grid');
const drinksGrid = document.getElementById('drinks-grid');
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const toast = document.getElementById('toast');

// Adicionais
const extraCheckboxes = document.querySelectorAll('.extra-item input[type="checkbox"]');

// Campos Cliente
const customerNameInput = document.getElementById('customerName');
const customerAddressInput = document.getElementById('customerAddress');

// --- Funções Auxiliares ---
const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// --- Renderização ---
const createProductCard = (product) => {
    return `
        <div class="card">
            <img src="${product.img}" alt="${product.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x200/1c1f26/ff6b35?text=${product.name.replace(' ', '+')}'">
            <div class="card-content">
                <h4 class="card-title">${product.name}</h4>
                <p class="card-desc">${product.desc}</p>
                <div class="card-footer">
                    <span class="card-price">${formatPrice(product.price)}</span>
                    <button class="btn-add" onclick="addToCart('${product.id}')">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

const renderMenu = () => {
    pizzasGrid.innerHTML = pizzas.map(createProductCard).join('');
    drinksGrid.innerHTML = drinks.map(createProductCard).join('');
};

// --- Lógica do Carrinho ---
const getProductById = (id) => {
    return pizzas.find(p => p.id === id) || drinks.find(d => d.id === id);
};

const addToCart = (id) => {
    const product = getProductById(id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`${product.name} adicionado!`);
};

const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

const updateQuantity = (id, delta) => {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
};

const getExtrasTotal = () => {
    let total = 0;
    extraCheckboxes.forEach(cb => {
        if (cb.checked) {
            total += parseFloat(cb.value);
        }
    });
    return total;
};

const updateCartUI = () => {
    // Atualiza Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;

    // Renderiza Itens
    if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        cartItemsList.appendChild(emptyCartMsg);
        emptyCartMsg.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        emptyCartMsg.style.display = 'none';
        checkoutBtn.disabled = false;
        
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60/1c1f26/ff6b35?text=Img'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Calcula e Atualiza Total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const extrasTotal = getExtrasTotal();
    const finalTotal = subtotal > 0 ? subtotal + extrasTotal : 0; // Só cobra extras se houver itens no carrinho

    cartTotalPrice.textContent = formatPrice(finalTotal);
};

// --- Integração WhatsApp ---
const generateWhatsAppLink = () => {
    const name = customerNameInput.value.trim();
    const address = customerAddressInput.value.trim();

    if (!name) {
        alert("Por favor, preencha o seu nome.");
        customerNameInput.focus();
        return;
    }

    let message = `*NOVO PEDIDO* 🍕\n\n`;
    message += `*Cliente:* ${name}\n`;
    if (address) {
        message += `*Endereço:* ${address}\n`;
    }
    message += `\n*Itens do Pedido:*\n`;

    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})\n`;
    });

    const selectedExtras = Array.from(extraCheckboxes).filter(cb => cb.checked);
    if (selectedExtras.length > 0) {
        message += `\n*Adicionais:*\n`;
        selectedExtras.forEach(cb => {
            message += `- ${cb.dataset.name} (+${formatPrice(parseFloat(cb.value))})\n`;
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = subtotal + getExtrasTotal();

    message += `\n*Total a pagar:* ${formatPrice(finalTotal)}\n`;
    message += `\nObrigado pela preferência!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};

// --- Event Listeners ---
openCartBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('active');
});

extraCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCartUI);
});

checkoutBtn.addEventListener('click', generateWhatsAppLink);

// Inicialização
renderMenu();
updateCartUI();
