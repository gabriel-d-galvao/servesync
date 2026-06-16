document.addEventListener('DOMContentLoaded', async () => {
    // ================= CONTROLE DE ALTERNÂNCIA DE ABAS GERENCIAIS =================
    const tabReservas = document.getElementById('tab-reservas');
    const tabPedidos = document.getElementById('tab-pedidos');
    const tabPagamentos = document.getElementById('tab-pagamentos');
    const tabEntrega = document.getElementById('tab-entrega');

    const sectionReservas = document.getElementById('section-reservas');
    const sectionPedidos = document.getElementById('section-pedidos');
    const sectionPagamentos = document.getElementById('section-pagamentos');
    const sectionEntrega = document.getElementById('section-entrega');
    const sectionSucesso = document.getElementById('section-sucesso'); // Nova seção de confirmação

    tabReservas.addEventListener('click', (e) => { e.preventDefault(); switchTab(tabReservas, sectionReservas); });
    tabPedidos.addEventListener('click', (e) => { e.preventDefault(); switchTab(tabPedidos, sectionPedidos); });
    tabPagamentos.addEventListener('click', (e) => { e.preventDefault(); switchTab(tabPagamentos, sectionPagamentos); });
    tabEntrega.addEventListener('click', (e) => { e.preventDefault(); switchTab(tabEntrega, sectionEntrega); });

    function switchTab(activeTab, activeSection) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        
        if (activeTab) activeTab.classList.add('active');
        if (activeSection) activeSection.classList.add('active');
    }

    // Botão Sair
    const btnLogout = document.getElementById('btnLogout');
    btnLogout.addEventListener('click', () => {
        if (!confirm("Deseja realmente sair do sistema ServeSync?")) return;

        // limpa sessão local (usado pelo fluxo de funcionário)
        try {
            localStorage.removeItem('servesync-auth');
        } catch (_) {}

        // redireciona para a tela de login
        window.location.href = './login.html';
    });

    // ================= FLUXO DINÂMICO DE RESERVAS =================
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const reserveForm = document.getElementById('reserveForm');
    const activeReservationsList = document.getElementById('active-reservations-list');
    const completedReservationsList = document.getElementById('completed-reservations-list');
    const canceledReservationsList = document.getElementById('canceled-reservations-list');

    let reservationCounter = 0;

    openModalBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
    closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));

    reserveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        reservationCounter++;
        const dateInput = document.getElementById('date').value;
        const timeInput = document.getElementById('time').value;
        const guestsInput = document.getElementById('guests').value;

        const newCard = document.createElement('div');
        newCard.classList.add('card', 'card-active');
        newCard.innerHTML = `
            <div class="card-header">
                <span class="reserve-id">Reserva #${reservationCounter}</span>
                <span class="status-badge status-id" style="background-color: #f59e0b;">Pendente</span>
            </div>
            <div class="card-body">
                <div class="info-row"><i class="fa-regular fa-calendar-days icon"></i><div><span class="label">Data</span><span class="value highlight-text">${dateInput}</span></div></div>
                <div class="info-row"><i class="fa-regular fa-clock icon"></i><div><span class="label">Horário</span><span class="value highlight-text">${timeInput}</span></div></div>
                <div class="info-row"><i class="fa-solid fa-users icon"></i><div><span class="label">Pessoas</span><span class="value highlight-text">${guestsInput} pessoas</span></div></div>
                <div class="card-actions">
                    <button class="btn-action btn-accept"><i class="fa-solid fa-check"></i> Aceitar</button>
                    <button class="btn-action btn-complete" style="display:none;"><i class="fa-solid fa-circle-check"></i> Concluir</button>
                    <button class="btn-action btn-cancel-action"><i class="fa-solid fa-xmark"></i> Cancelar</button>
                </div>
            </div>
        `;

        const badge = newCard.querySelector('.status-id');
        const btnAccept = newCard.querySelector('.btn-accept');
        const btnComplete = newCard.querySelector('.btn-complete');
        const btnCancel = newCard.querySelector('.btn-cancel-action');

        btnAccept.addEventListener('click', () => {
            badge.textContent = 'Confirmada';
            badge.style.backgroundColor = 'var(--status-green)';
            btnAccept.style.display = 'none';
            btnComplete.style.display = 'flex';
        });
        btnComplete.addEventListener('click', () => {
            badge.textContent = 'Concluída';
            badge.style.backgroundColor = '#3b82f6';
            newCard.querySelector('.card-actions').remove();
            completedReservationsList.prepend(newCard);
        });
        btnCancel.addEventListener('click', () => {
            badge.textContent = 'Cancelada';
            badge.style.backgroundColor = 'var(--status-red)';
            newCard.querySelector('.card-actions').remove();
            canceledReservationsList.prepend(newCard);
        });

        activeReservationsList.prepend(newCard);
        reserveForm.reset();
        modalOverlay.classList.remove('active');
    });

    // ================= FILTRO DE CATEGORIAS, CARRINHO E EXCLUSÃO =================
    // Integração: menu da gerência (localStorage "servesync-menu-products")
    const dialogOverlay = document.getElementById('dialogOverlay');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const productCards = document.querySelectorAll('.product-card');
    const catButtons = document.querySelectorAll('.cat-btn');
    
    const dialogTitle = document.getElementById('dialog-title');
    const dialogPrice = document.getElementById('dialog-price');
    const dialogImg = document.getElementById('dialog-img');
    const btnAddToCart = document.getElementById('btnAddToCart');

    const cartEmpty = document.getElementById('cart-empty');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const btnGoToPayment = document.getElementById('btnGoToPayment');
    const paymentSummaryItems = document.getElementById('payment-summary-items');
    const pSubtotal = document.getElementById('p-subtotal');
    const pTotal = document.getElementById('p-total');

    // Elementos da Nova Aba de Entrega
    const deliveryFinalItems = document.getElementById('delivery-final-items');
    const deliveryFinalTotal = document.getElementById('delivery-final-total');

    let totalCarrinho = 0;
    let itensNoCarrinho = [];

    // Filtros de Categorias

    // Atualiza cards e modal com dados da gerência (se existir no localStorage)
    (function syncMenuFromGerencia() {
        try {
            const saved = window.__serveSyncClient?.loadProductsFromGerencia
                ? window.__serveSyncClient.loadProductsFromGerencia()
                : [];
            if (!Array.isArray(saved) || saved.length === 0) return;

            // Atualiza imagens/nome/preço para os elementos existentes no HTML (mantém estrutura já pronta)
            productCards.forEach((card) => {
                const name = card.getAttribute('data-name');
                const match = saved.find((p) => String(p.name).trim() === String(name).trim());
                if (!match) return;
                if (match.image) card.setAttribute('data-img', match.image);
                if (match.price != null) card.setAttribute('data-price', String(match.price));
                // troca título
                const h3 = card.querySelector('h3');
                if (h3) h3.textContent = match.name;
            });

            // reconfigura listeners de clique para usar data-img/data-name/data-price atualizados
            productCards.forEach((card) => {
                card.replaceWith(card.cloneNode(true));
            });
        } catch (_) {}
    })();
    catButtons.forEach(button => {
        button.addEventListener('click', () => {
            catButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'favoritos' || cardCategory === filterValue) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Abrir Modal de Customização
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            dialogImg.src = card.getAttribute('data-img');
            dialogTitle.textContent = card.getAttribute('data-name');
            dialogPrice.textContent = `R$ ${card.getAttribute('data-price').replace('.', ',')}`;
            dialogOverlay.classList.add('active');
        });
    });

    closeDialogBtn.addEventListener('click', () => dialogOverlay.classList.remove('active'));

    // Adicionar item ao carrinho
    btnAddToCart.addEventListener('click', () => {
        const name = dialogTitle.textContent;
        const price = parseFloat(dialogPrice.textContent.replace('R$ ', '').replace(',', '.'));
        const itemId = Date.now();

        itensNoCarrinho.push({ id: itemId, name: name, price: price });

        cartEmpty.style.display = 'none';
        cartItemsList.style.display = 'block';

        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-item-row');
        itemRow.setAttribute('data-id', itemId);
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <span>1x ${name}</span>
                <span class="cart-item-price">R$ ${price.toFixed(2).replace('.', ',')}</span>
            </div>
            <button class="btn-delete-item"><i class="fa-solid fa-trash-can"></i></button>
        `;
        
        // Exclusão Individual no Carrinho
        itemRow.querySelector('.btn-delete-item').addEventListener('click', () => {
            itemRow.remove();
            itensNoCarrinho = itensNoCarrinho.filter(item => item.id !== itemId);
            
            totalCarrinho -= price;
            if (totalCarrinho < 0) totalCarrinho = 0;
            cartTotal.textContent = `R$ ${totalCarrinho.toFixed(2).replace('.', ',')}`;

            if (itensNoCarrinho.length === 0) {
                cartEmpty.style.display = 'flex';
                cartItemsList.style.display = 'none';
            }
            atualizarResumoPagamento();
        });

        cartItemsList.appendChild(itemRow);
        totalCarrinho += price;
        cartTotal.textContent = `R$ ${totalCarrinho.toFixed(2).replace('.', ',')}`;
        dialogOverlay.classList.remove('active');
        atualizarResumoPagamento();
    });

    // Sincronizar dados para a tela de Pagamento
    function atualizarResumoPagamento() {
        if (itensNoCarrinho.length === 0) {
            paymentSummaryItems.innerHTML = `<p style="color: #aaa; font-size: 13px;">Nenhum item pendente.</p>`;
            pSubtotal.textContent = "R$ 0,00";
            pTotal.textContent = "R$ 7,00";
            return;
        }

        paymentSummaryItems.innerHTML = "";
        itensNoCarrinho.forEach(item => {
            const row = document.createElement('div');
            row.classList.add('s-item-row');
            row.innerHTML = `<span>1x ${item.name}</span><strong>R$ ${item.price.toFixed(2).replace('.', ',')}</strong>`;
            paymentSummaryItems.appendChild(row);
        });

        pSubtotal.textContent = `R$ ${totalCarrinho.toFixed(2).replace('.', ',')}`;
        pTotal.textContent = `R$ ${(totalCarrinho + 7).toFixed(2).replace('.', ',')}`;
    }

    btnGoToPayment.addEventListener('click', () => {
        if (itensNoCarrinho.length === 0) {
            alert("Seu carrinho está vazio! Adicione algum produto.");
            return;
        }
        switchTab(tabPagamentos, sectionPagamentos);
    });

    // ================= CONFIGURAÇÃO DE MÉTODOS DE PAGAMENTO =================
    const radioMethods = document.querySelectorAll('input[name="payment-method"]');
    const detailsPix = document.getElementById('pay-details-pix');
    const detailsCartao = document.getElementById('pay-details-cartao');
    const detailsDinheiro = document.getElementById('pay-details-dinheiro');

    radioMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = e.target.value;
            detailsPix.style.display = 'none';
            detailsCartao.style.display = 'none';
            detailsDinheiro.style.display = 'none';

            if (value === 'pix') detailsPix.style.display = 'block';
            else if (value === 'cartao' || value === 'credito' || value === 'debito') detailsCartao.style.display = 'block';
            else if (value === 'dinheiro') detailsDinheiro.style.display = 'block';
        });
    });

    // ================= CONFIRMAÇÃO DO PEDIDO -> ENVIAR PARA RASTREAMENTO =================
    // (não sincroniza pedido com gerência; mantém comportamento atual)
    document.getElementById('btnFinalizeOrder').addEventListener('click', () => {
        if (itensNoCarrinho.length === 0) {
            alert("Não há nenhum pedido ativo para ser pago.");
            return;
        }

        // 1. Clonar os produtos ativos para a tela de Entrega/Rastreamento antes de limpar
        deliveryFinalItems.innerHTML = "";
        itensNoCarrinho.forEach(item => {
            const itemLine = document.createElement('div');
            itemLine.classList.add('delivery-item-line');
            itemLine.innerHTML = `<span>1x ${item.name}</span><span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>`;
            deliveryFinalItems.appendChild(itemLine);
        });

        // 2. Setar o valor total com a taxa de entrega inclusa (R$ 7,00)
        const valorFinalComTaxa = totalCarrinho + 7;
        deliveryFinalTotal.textContent = `R$ ${valorFinalComTaxa.toFixed(2).replace('.', ',')}`;

        // 3. ATIVAÇÃO DA TELA DE CONFIRMAÇÃO (Transição Intermediária de Sucesso)
        switchTab(null, sectionSucesso);

        // 4. Limpar Carrinho e Resumos de Compra para futuros novos pedidos de fundo
        itensNoCarrinho = [];
        totalCarrinho = 0;
        cartTotal.textContent = "R$ 0,00";
        cartItemsList.innerHTML = "";
        cartEmpty.style.display = 'flex';
        cartItemsList.style.display = 'none';
        atualizarResumoPagamento();

        // 5. Aguardar 3 segundos na tela de sucesso e depois mover o usuário para a aba de Entrega
        setTimeout(() => {
            switchTab(tabEntrega, sectionEntrega);
        }, 3000);
    });

    // Botão de simulação de ligação
    document.querySelector('.btn-call-motoboy').addEventListener('click', () => {
        alert("Chamando João Motoboy no número (11) 9XXXX-XXXX...");
    });
});