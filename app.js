// Data produk default (Harga Jual & Modal untuk hitung Laba)
const products = [
    { id: 1, name: "Kopi Hitam", price: 10000, cost: 4000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300" },
    { id: 2, name: "Es Teh Manis", price: 5000, cost: 1500, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300" },
    { id: 3, name: "Roti Bakar", price: 12000, cost: 6000, image: "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=300" },
    { id: 4, name: "Kentang Goreng", price: 15000, cost: 7000, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300" }
];

let cart = [];

// Format Angka ke Rupiah
function formatRupiah(amount) {
    return "Rp " + amount.toLocaleString("id-ID");
}

// Render Produk di Halaman Kasir
function renderProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    grid.innerHTML = "";

    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card" onclick="addToCart(${p.id})">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price">${formatRupiah(p.price)}</div>
            </div>
        `;
    });
}

// Tambah Produk ke Keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

// Ubah Jumlah Item
function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    renderCart();
}

// Render Keranjang
function renderCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Belum ada produk dipilih</p>';
        document.getElementById("totalPrice").innerText = "Rp 0";
        calculateChange();
        return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${formatRupiah(item.price)} x ${item.qty}</small>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    });

    document.getElementById("totalPrice").innerText = formatRupiah(total);
    calculateChange();
}

// Kalkulator Kembalian Otomatis
function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cash = parseFloat(document.getElementById("cashInput").value) || 0;
    const change = cash - total;

    const changeEl = document.getElementById("changeAmount");
    if (change >= 0) {
        changeEl.innerText = formatRupiah(change);
        changeEl.style.color = "#16a34a";
    } else {
        changeEl.innerText = "Uang kurang " + formatRupiah(Math.abs(change));
        changeEl.style.color = "#ef4444";
    }
}

// Proses Pembayaran & Simpan Rekap Transaksi
function processPayment() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalCost = cart.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    const profit = total - totalCost;
    const cash = parseFloat(document.getElementById("cashInput").value) || 0;

    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    if (cash < total) {
        alert("Jumlah uang pembeli tidak mencukupi!");
        return;
    }

    const transaction = {
        date: new Date().toLocaleString("id-ID"),
        items: cart.map(i => `${i.name} (${i.qty})`).join(", "),
        total: total,
        profit: profit
    };

    // Simpan ke localStorage
    const history = JSON.parse(localStorage.getItem("pos_history") || "[]");
    history.push(transaction);
    localStorage.setItem("pos_history", JSON.stringify(history));

    alert("Transaksi Berhasil Diproses!");
    
    // Reset Form
    cart = [];
    document.getElementById("cashInput").value = "";
    renderCart();
}

// Render Data Rekap di halaman data_kasir.html
function renderHistory() {
    const history = JSON.parse(localStorage.getItem("pos_history") || "[]");
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    let totalRevenue = 0;
    let totalProfit = 0;

    history.forEach(t => {
        totalRevenue += t.total;
        totalProfit += t.profit;

        tableBody.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td>${t.items}</td>
                <td>${formatRupiah(t.total)}</td>
                <td><strong>${formatRupiah(t.profit)}</strong></td>
            </tr>
        `;
    });

    document.getElementById("totalRevenue").innerText = formatRupiah(totalRevenue);
    document.getElementById("totalProfit").innerText = formatRupiah(totalProfit);
    document.getElementById("totalTransactions").innerText = history.length;
}

// Hapus Riwayat Transaksi
function clearHistory() {
    if (confirm("Apakah Anda yakin ingin menghapus semua rekap data?")) {
        localStorage.removeItem("pos_history");
        renderHistory();
    }
}