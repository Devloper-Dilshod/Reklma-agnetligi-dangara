// script.js
const REGULAR_PRICE = 50000;
const PRIME_PRICE   = 90000;
const SILKA_PRICE   = 40000;
const TOP_PRICE     = 100000;
const PIN_PRICE     = 200000;
const OPERATOR_USERNAME = 'dangara_agent';     // @siz, faqat username
const MASS_MEDIA_NAME = "DANG'ARA YANGILIKLARI REKLAMA BO'LIMI";
const DISCOUNT_TIERS = [{ min: 3, percent: 5 }];

let currentQrText = '';

// === INPUTLarni yangilash ===
function updateCounts() {
    let total   = parseInt(document.getElementById("totalCount").value) || 0;
    let prime   = parseInt(document.getElementById("primeCount").value) || 0;
    let silkali = parseInt(document.getElementById("silkaliCount").value) || 0;

    if (total < 1) { total = 1; document.getElementById("totalCount").value = 1; }
    if (prime > total) { prime = total; document.getElementById("primeCount").value = total; }
    document.getElementById("regularCount").value = total - prime;
    if (silkali > total) { silkali = total; document.getElementById("silkaliCount").value = total; }

    const top = document.getElementById("topOption");
    const pin = document.getElementById("pinOption");
    if (total > 1) { top.checked = pin.checked = false; top.disabled = pin.disabled = true; }
    else { top.disabled = pin.disabled = false; }

    document.getElementById("fullResult").style.display = "none";
    document.getElementById("orderButtonBox").style.display = "none";
    closeOrderForm();
}

// === Hisoblash + Scroll + Animatsiya ===
document.querySelector(".btn-calc").addEventListener("click", calculatePrice);
function calculatePrice() {
    const total   = parseInt(document.getElementById("totalCount").value);
    const prime   = parseInt(document.getElementById("primeCount").value);
    const regular = total - prime;
    const silkali = parseInt(document.getElementById("silkaliCount").value);

    const regularCost = regular * REGULAR_PRICE;
    const primeCost   = prime   * PRIME_PRICE;
    const silkaCost   = silkali * SILKA_PRICE;
    let totalRaw = regularCost + primeCost + silkaCost;

    let discount = 0;
    for (let t of DISCOUNT_TIERS) if (total >= t.min) discount = t.percent;
    const discountAmt = totalRaw * discount / 100;
    let subtotal = totalRaw - discountAmt;

    let extra = 0;
    const extras = [];
    if (total === 1) {
        if (document.getElementById("topOption").checked) { extra += TOP_PRICE; extras.push("TOP"); }
        if (document.getElementById("pinOption").checked) { extra += PIN_PRICE; extras.push("PIN"); }
    }
    const final = subtotal + extra;

    const now  = new Date();
    const date = now.toLocaleDateString("uz-UZ", { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = now.toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' });
    const no   = Math.floor(100000 + Math.random() * 900000);

    currentQrText = `Chek №${no}\n${date} ${time}\nReklama: ${total}\nOddiy: ${regular}\nPrime: ${prime}\nSilkali: ${silkali}\nQo‘shimcha: ${extras.join(" + ") || "Yo‘q"}\nYakuniy: ${final.toLocaleString()} so‘m`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(currentQrText)}`;

    const services = `
        <h4>Xizmatlar:</h4>
        <p>Jami: ${total} ta</p>
        ${regular ? `<p>Oddiy: ${regular} ta</p>` : ''}
        ${prime   ? `<p>Prime: ${prime} ta</p>` : ''}
        ${silkali ? `<p>Silkali: ${silkali} ta</p>` : ''}
        <p>Telegram</p>
        ${extras.length ? `<p>Qo‘shimcha: ${extras.join(" + ")}</p>` : ''}
    `;

    const costs = `
        <h4>Narxlar:</h4>
        ${regularCost ? `<p>Oddiy: +${regularCost.toLocaleString()} so‘m</p>` : ''}
        ${primeCost   ? `<p>Prime: +${primeCost.toLocaleString()} so‘m</p>` : ''}
        ${silkaCost   ? `<p>Silka: +${silkaCost.toLocaleString()} so‘m</p>` : ''}
        ${extra       ? `<p>Qo‘shimcha: +${extra.toLocaleString()} so‘m</p>` : ''}
        ${discountAmt ? `<p>Chegirma ${discount}%: -${discountAmt.toLocaleString()} so‘m</p>` : ''}
    `;

    const result = document.getElementById("fullResult");
    result.innerHTML = `
        <div id="cheque" class="cheque">
            <h3>${MASS_MEDIA_NAME}</h3>
            <small>Reklama cheki</small>
            <div class="meta">Chek № ${no}<br>${date} ${time}</div>
            ${services}
            <hr>
            ${costs}
            <hr>
            <div class="total">Yakuniy: ${final.toLocaleString()} so‘m</div>
            <div class="footer">
                <img src="${qr}" alt="QR">
                <p>Rahmat!</p>
            </div>
        </div>
        <div class="cheque-actions">
            <button class="icon">Print</button>
            <button class="icon">Download</button>
        </div>
    `;

    result.style.display = "block";
    document.getElementById("orderButtonBox").style.display = "flex";

    setTimeout(() => {
        result.classList.add("show");
        document.getElementById("orderButtonBox").classList.add("show");
        document.getElementById("resultSection").scrollIntoView({ behavior: "smooth" });
    }, 10);
}

// === Print & Download ===
document.getElementById("fullResult").addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") return;
    if (e.target.textContent.includes("Print")) printCheque();
    if (e.target.textContent.includes("Download")) downloadPNG();
});

function printCheque() {
    const el = document.getElementById("cheque");
    const win = window.open("", "_blank");
    win.document.write(`
        <html><head><title>Chek</title>
        <style>
            body{font-family:monospace;padding:20px;}
            .cheque{width:300px;margin:auto;border:1px dashed #000;padding:15px;font-size:14px;}
            hr{border:none;border-top:1px dashed #999;margin:10px 0;}
            .total{font-weight:bold;text-align:center;margin:15px 0;font-size:16px;}
        </style></head>
        <body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
}

function downloadPNG() {
    const el = document.getElementById("cheque");
    html2canvas(el, { scale: 3, useCORS: true }).then(c => {
        const a = document.createElement("a");
        a.href = c.toDataURL("image/png");
        a.download = "reklama_cheki.png";
        a.click();
    });
}

// === Operator tugmasi: t.me/username ga o‘tish ===
document.getElementById("operatorBtn").addEventListener("click", () => {
    window.open(`https://t.me/${OPERATOR_USERNAME}`, '_blank');
});

// === Modal ochish/yopish ===
document.querySelector(".btn-order").addEventListener("click", () => {
    const modal = document.getElementById("orderModal");
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
});
document.querySelector(".close").addEventListener("click", closeOrderForm);
window.addEventListener("click", e => { if (e.target === document.getElementById("orderModal")) closeOrderForm(); });

function closeOrderForm() {
    const modal = document.getElementById("orderModal");
    modal.classList.remove("show");
    setTimeout(() => { modal.style.display = "none"; }, 300);
    document.getElementById("orderStatus").innerHTML = "";
}

// === Buyurtma yuborish (bir marta, blokirovka bilan) ===
// Buyurtma yuborish – API orqali
document.getElementById("submitBtn").addEventListener("click", async () => {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn.disabled) return;

    const name = document.getElementById("adName").value.trim();
    const digits = document.getElementById("phoneDigits").value.trim();
    const username = document.getElementById("telegramUsername").value.trim();
    const note = document.getElementById("additionalInfo").value.trim();

    if (!/^\d{9}$/.test(digits)) {
        document.getElementById("orderStatus").innerHTML = '<p class="error">Telefon noto‘g‘ri!</p>';
        return;
    }
    if (!name || !username.startsWith('@')) {
        document.getElementById("orderStatus").innerHTML = '<p class="error">Ma\'lumot to‘liq emas!</p>';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Yuborilmoqda...';

    const cheque = document.getElementById("cheque");
    const canvas = await html2canvas(cheque, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const res = await fetch('/api/send-order.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: `+998${digits}`, username, note, img })
    });

    const data = await res.json();

    if (data.success) {
        submitBtn.innerHTML = 'Yuborildi!';
        submitBtn.style.background = '#28a745';
        document.getElementById("orderStatus").innerHTML = '<p class="success">Buyurtma yuborildi!</p>';
    } else {
        submitBtn.innerHTML = 'Xato!';
        submitBtn.style.background = '#dc3545';
        document.getElementById("orderStatus").innerHTML = `<p class="error">${data.error}</p>`;
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Yuborish';
            submitBtn.style.background = '#007bff';
        }, 2000);
    }
});

function dataURLtoBlob(dataURL) {
    const [meta, b64] = dataURL.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

// === Boshlang‘ich narxlar va inputlar ===
window.addEventListener("load", () => {
    document.getElementById("regular-price").textContent = `${REGULAR_PRICE.toLocaleString()} so'm`;
    document.getElementById("prime-price").textContent   = `${PRIME_PRICE.toLocaleString()} so'm`;
    document.getElementById("silka-price").textContent   = `${SILKA_PRICE.toLocaleString()} so'm`;
    document.getElementById("top-price").textContent     = `TOP (30 daq) — ${TOP_PRICE.toLocaleString()} so'm`;
    document.getElementById("pin-price").textContent     = `PIN (24 soat) — ${PIN_PRICE.toLocaleString()} so'm`;
    updateCounts();

    // Input o‘zgarishi → avto-yangilash
    ["totalCount", "primeCount", "silkaliCount"].forEach(id =>
        document.getElementById(id).addEventListener("input", updateCounts)
    );
});