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

const sweetPizzas = [
    { id: 'sp1', name: 'Chocolate com Morango', desc: 'Mussarela, chocolate ao leite derretido e morangos.', price: 55.00, img: 'assets/default_pizza.png' },
    { id: 'sp2', name: 'Romeu e Julieta', desc: 'Mussarela, goiabada cascão e queijo minas.', price: 50.00, img: 'assets/default_pizza.png' },
    { id: 'sp3', name: 'Banana com Canela', desc: 'Mussarela, banana fatiada, açúcar e canela.', price: 45.00, img: 'assets/default_pizza.png' }
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
const sweetPizzasGrid = document.getElementById('sweet-pizzas-grid');
const drinksGrid = document.getElementById('drinks-grid');
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');
const toast = document.getElementById('toast');

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
const createProductCard = (product, type) => {
    let extrasHtml = '';
    let priceDisplay = `<span class="card-price">${formatPrice(product.price)}</span>`;

    if (type === 'pizza' || type === 'sweetPizza') {
        extrasHtml = `
            <div class="card-extras">
                <span class="extras-title">Tamanho:</span>
                <select id="size-${product.id}" class="size-select" onchange="updatePriceDisplay('${product.id}')">
                    <option value="P" data-price="${(product.price - 10).toFixed(2)}">P - Pequena (${formatPrice(product.price - 10)})</option>
                    <option value="M" data-price="${(product.price - 5).toFixed(2)}">M - Média (${formatPrice(product.price - 5)})</option>
                    <option value="G" data-price="${product.price.toFixed(2)}" selected>G - Grande (${formatPrice(product.price)})</option>
                    <option value="GG" data-price="${(product.price + 10).toFixed(2)}">GG - Família (${formatPrice(product.price + 10)})</option>
                </select>
                
                <span class="extras-title" style="margin-top: 10px;">Adicionais:</span>
                <label><input type="checkbox" id="extra-borda-${product.id}" value="10.00" data-name="Borda Recheada"> Borda (+R$10)</label>
                <label><input type="checkbox" id="extra-queijo-${product.id}" value="8.00" data-name="Queijo Extra"> Queijo (+R$8)</label>
            </div>
        `;
        priceDisplay = `<span class="card-price" id="price-display-${product.id}" style="font-size: 1.1rem;">${formatPrice(product.price)}</span>`;
    }

    return `
        <div class="card">
            <img src="${product.img}" alt="${product.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x200/1c1f26/ff6b35?text=${product.name.replace(' ', '+')}'">
            <div class="card-content">
                <h4 class="card-title">${product.name}</h4>
                <p class="card-desc">${product.desc}</p>
                ${extrasHtml}
                <div class="card-footer">
                    ${priceDisplay}
                    <button class="btn-add" onclick="addToCart('${product.id}', '${type}')">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

const updatePriceDisplay = (id) => {
    const sizeSelect = document.getElementById(`size-${id}`);
    const priceDisplay = document.getElementById(`price-display-${id}`);
    if (sizeSelect && priceDisplay) {
        const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        priceDisplay.textContent = formatPrice(price);
    }
};

const renderMenu = () => {
    pizzasGrid.innerHTML = pizzas.map(p => createProductCard(p, 'pizza')).join('');
    sweetPizzasGrid.innerHTML = sweetPizzas.map(p => createProductCard(p, 'sweetPizza')).join('');
    drinksGrid.innerHTML = drinks.map(d => createProductCard(d, 'drink')).join('');
};

// --- Lógica do Carrinho ---
const getProductById = (id) => {
    return pizzas.find(p => p.id === id) || sweetPizzas.find(p => p.id === id) || drinks.find(d => d.id === id);
};

const addToCart = (id, type) => {
    const product = getProductById(id);
    let selectedExtras = [];
    let extrasTotal = 0;
    let finalPrice = product.price;
    let selectedSize = '';
    let sizeLabel = '';

    if (type === 'pizza' || type === 'sweetPizza') {
        const sizeSelect = document.getElementById(`size-${id}`);
        if (sizeSelect) {
            const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
            selectedSize = selectedOption.value;
            finalPrice = parseFloat(selectedOption.dataset.price);
            sizeLabel = ` (${selectedSize})`;
        }

        const bordaCb = document.getElementById(`extra-borda-${id}`);
        const queijoCb = document.getElementById(`extra-queijo-${id}`);
        
        if (bordaCb && bordaCb.checked) {
            selectedExtras.push({ name: bordaCb.dataset.name, price: parseFloat(bordaCb.value) });
            extrasTotal += parseFloat(bordaCb.value);
            bordaCb.checked = false; // Reset after adding
        }
        if (queijoCb && queijoCb.checked) {
            selectedExtras.push({ name: queijoCb.dataset.name, price: parseFloat(queijoCb.value) });
            extrasTotal += parseFloat(queijoCb.value);
            queijoCb.checked = false; // Reset after adding
        }
    }

    const extrasKey = selectedExtras.map(e => e.name).sort().join('-');
    const cartItemId = `${id}${selectedSize ? '-' + selectedSize : ''}${extrasKey ? '-' + extrasKey : ''}`;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, price: finalPrice, sizeLabel, cartItemId, quantity: 1, selectedExtras, extrasTotal });
    }

    updateCartUI();
    showToast(`${product.name}${sizeLabel} adicionado!`);
};

const removeFromCart = (cartItemId) => {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartUI();
};

const updateQuantity = (cartItemId, delta) => {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            updateCartUI();
        }
    }
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
                    <div class="cart-item-title">${item.name}${item.sizeLabel || ''}</div>
                    ${item.selectedExtras && item.selectedExtras.length > 0 ? 
                      `<div class="cart-item-extras" style="font-size: 0.8rem; color: var(--text-secondary);">Com: ${item.selectedExtras.map(e => e.name).join(', ')}</div>` : ''}
                    <div class="cart-item-price">${formatPrice((item.price + (item.extrasTotal || 0)))}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.cartItemId}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Calcula e Atualiza Total
    const finalTotal = cart.reduce((sum, item) => sum + ((item.price + (item.extrasTotal || 0)) * item.quantity), 0);

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
        let itemExtrasText = item.selectedExtras && item.selectedExtras.length > 0 ? 
            ` (Com: ${item.selectedExtras.map(e => e.name).join(', ')})` : '';
        message += `- ${item.quantity}x ${item.name}${item.sizeLabel || ''}${itemExtrasText} (${formatPrice((item.price + (item.extrasTotal || 0)) * item.quantity)})\n`;
    });

    const finalTotal = cart.reduce((sum, item) => sum + ((item.price + (item.extrasTotal || 0)) * item.quantity), 0);

    message += `\n*Total a pagar:* ${formatPrice(finalTotal)}\n`;
    message += `\nObrigado pela preferência!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};

// --- Event Listeners ---
openCartBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
continueShoppingBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('active');
});



checkoutBtn.addEventListener('click', generateWhatsAppLink);

// Inicialização
renderMenu();
updateCartUI();
