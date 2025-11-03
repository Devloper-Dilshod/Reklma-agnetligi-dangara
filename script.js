// script.js
const REGULAR_PRICE = 50000;
const PRIME_PRICE   = 90000;
const SILKA_PRICE   = 40000;
const TOP_PRICE     = 100000;
const PIN_PRICE     = 200000;
const BOT_TOKEN     = '8272202488:AAHB-TO91QiYEKzl9N3VQKq4kkkqyHhtZp8';
const ADMIN_IDS     = ['7445142075' , '6069823531', '7349819129'];
const OPERATOR_USERNAME = 'dangara_agent';
const MASS_MEDIA_NAME = "DANG'ARA TUMANI KANALI";

let currentQrText = '';

function updateCounts() {
    let total   = parseInt(document.getElementById("totalCount").value) || 1;
    let regular = parseInt(document.getElementById("regularCount").value) || 0;
    let prime   = parseInt(document.getElementById("primeCount").value) || 0;
    let silkali = parseInt(document.getElementById("silkaliCount").value) || 0;

    const sum = regular + prime;
    if (sum > total) {
        if (document.activeElement.id === "regularCount") {
            regular = total - prime;
        } else {
            prime = total - regular;
        }
    }

    const maxSilkali = regular + prime;
    if (silkali > maxSilkali) {
        silkali = maxSilkali;
        document.getElementById("silkaliCount").value = silkali;
    }

    document.getElementById("regularCount").max = total;
    document.getElementById("primeCount").max = total;
    document.getElementById("silkaliCount").max = maxSilkali;

    document.getElementById("regularCount").value = regular;
    document.getElementById("primeCount").value = prime;

    const top = document.getElementById("topOption");
    const pin = document.getElementById("pinOption");
    if (total > 1) {
        top.checked = pin.checked = false;
        top.disabled = pin.disabled = true;
    } else {
        top.disabled = pin.disabled = false;
    }

    document.getElementById("fullResult").style.display = "none";
    document.getElementById("orderButtonBox").style.display = "none";
    closeOrderForm();
}

function setupMobileInput(id) {
    const el = document.getElementById(id);
    el.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val === "" && id !== "totalCount") val = "0";
        e.target.value = val;
        updateCounts();
    });
}

document.querySelector(".btn-calc").addEventListener("click", calculatePrice);
function calculatePrice() {
    const total   = parseInt(document.getElementById("totalCount").value) || 1;
    const regular = parseInt(document.getElementById("regularCount").value) || 0;
    const prime   = parseInt(document.getElementById("primeCount").value) || 0;
    const silkali = parseInt(document.getElementById("silkaliCount").value) || 0;

    const regularCost = regular * REGULAR_PRICE;
    const primeCost   = prime   * PRIME_PRICE;
    const silkaCost   = silkali * SILKA_PRICE;
    let totalRaw = regularCost + primeCost + silkaCost;

    let extra = 0;
    const extras = [];
    if (total === 1) {
        if (document.getElementById("topOption").checked) { extra += TOP_PRICE; extras.push("TOP"); }
        if (document.getElementById("pinOption").checked) { extra += PIN_PRICE; extras.push("PIN"); }
    }
    const final = totalRaw + extra;

    const now  = new Date();
    const date = now.toLocaleDateString("uz-UZ", { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' });
    const no   = String(Date.now()).slice(-6);

    currentQrText = `Chek №${no}\n${date} ${time}\nReklama: ${total}\nOddiy: ${regular}\nPrime: ${prime}\nSilkali: ${silkali}\nQo‘shimcha: ${extras.join(" + ") || "Yo‘q"}\nYakuniy: ${final.toLocaleString()} so‘m`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentQrText)}`;

    const result = document.getElementById("fullResult");
    result.innerHTML = `
        <div id="cheque" class="cheque">
            <h3>${MASS_MEDIA_NAME}</h3>
            <small>Reklama cheki</small>
            <div class="meta">№ ${no} | ${date} ${time}</div>
            <h4>Xizmatlar:</h4>
            <p>Jami: ${total} ta</p>
            ${regular ? `<p>Oddiy: ${regular} ta</p>` : ''}
            ${prime ? `<p>Prime: ${prime} ta</p>` : ''}
            ${silkali ? `<p>Silkali: ${silkali} ta</p>` : ''}
            ${extras.length ? `<p>Qo‘shimcha: ${extras.join(" + ")}</p>` : ''}
            <hr>
            <h4>Narxlar:</h4>
            ${regularCost ? `<p>Oddiy: +${regularCost.toLocaleString()} so‘m</p>` : ''}
            ${primeCost ? `<p>Prime: +${primeCost.toLocaleString()} so‘m</p>` : ''}
            ${silkaCost ? `<p>Silka: +${silkaCost.toLocaleString()} so‘m</p>` : ''}
            ${extra ? `<p>Qo‘shimcha: +${extra.toLocaleString()} so‘m</p>` : ''}
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

document.getElementById("fullResult").addEventListener("click", e => {
    if (!e.target.classList.contains("icon")) return;
    if (e.target.textContent.includes("Print")) printCheque();
    if (e.target.textContent.includes("Download")) downloadPNG();
});

function printCheque() {
    const el = document.getElementById("cheque");
    const win = window.open("", "_blank");
    win.document.write(`
        <html><head><title>Chek</title>
        <style>
            body{font-family:monospace;padding:20px;background:#fff;}
            .cheque{width:280px;margin:auto;border:1px dashed #000;padding:15px;font-size:13px;}
            hr{border-top:1px dashed #999;margin:10px 0;}
            .total{font-weight:bold;text-align:center;margin:15px 0;font-size:15px;}
        </style></head>
        <body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
}

function downloadPNG() {
    const el = document.getElementById("cheque");
    html2canvas(el, { scale: 3 }).then(c => {
        const a = document.createElement("a");
        a.href = c.toDataURL("image/png");
        a.download = "chek.png";
        a.click();
    });
}

document.getElementById("operatorBtn").addEventListener("click", () => {
    window.open(`https://t.me/${OPERATOR_USERNAME}`, '_blank');
});

// MODAL – BIRDA OCHILADI, OLDINDA
document.querySelector(".btn-order").addEventListener("click", () => {
    const modal = document.getElementById("orderModal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
        modal.classList.add("show");
        modal.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
});

document.querySelector(".close").addEventListener("click", closeOrderForm);
window.addEventListener("click", e => {
    if (e.target === document.getElementById("orderModal")) closeOrderForm();
});

function closeOrderForm() {
    const modal = document.getElementById("orderModal");
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    setTimeout(() => { modal.style.display = "none"; }, 350);
    document.getElementById("orderStatus").innerHTML = "";
}

document.getElementById("submitBtn").addEventListener("click", submitOrder);

function submitOrder() {
    const btn = document.getElementById("submitBtn");
    const status = document.getElementById("orderStatus");
    if (btn.disabled) return;

    const name = document.getElementById("adName").value.trim();
    const digits = document.getElementById("phoneDigits").value.trim();
    const username = document.getElementById("telegramUsername").value.trim();
    const note = document.getElementById("additionalInfo").value.trim();

    if (!/^\d{9}$/.test(digits)) { status.innerHTML = '<p class="error">9 ta raqam kiriting!</p>'; return; }
    if (!name) { status.innerHTML = '<p class="error">Nomi yo‘q!</p>'; return; }
    if (!username.startsWith('@')) { status.innerHTML = '<p class="error">@username kiriting!</p>'; return; }

    btn.disabled = true;
    btn.innerHTML = 'Yuborilmoqda...';

    const phone = `+998${digits}`;
    const now = new Date();
    const date = now.toLocaleDateString("uz-UZ", { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' });

    const cheque = document.getElementById("cheque");
    html2canvas(cheque, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL("image/png");
        const caption = `Buyurtma\n\nNomi: ${name}\nTel: ${phone}\nTG: ${username}\nIzoh: ${note || "Yo'q"}\nVaqt: ${date} ${time}\n\nOperator: @${OPERATOR_USERNAME}`;

        const blob = dataURLtoBlob(img);
        let success = 0, fail = 0;

        ADMIN_IDS.forEach((id, i) => {
            setTimeout(() => {
                const fd = new FormData();
                fd.append('chat_id', id);
                fd.append('photo', blob, 'chek.png');
                fd.append('caption', caption);

                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd })
                    .then(r => r.json())
                    .then(d => { if (d.ok) success++; else fail++; check(); })
                    .catch(() => { fail++; check(); });
            }, i * 300);
        });

        function check() {
            if (success + fail === ADMIN_IDS.length) {
                if (success > 0) {
                    btn.innerHTML = 'Yuborildi!';
                    status.innerHTML = `<p class="success">Yuborildi: ${success}/${ADMIN_IDS.length}</p>`;
                } else {
                    btn.innerHTML = 'Xato!';
                    status.innerHTML = '<p class="error">Yuborilmadi!</p>';
                }
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = 'Yuborish';
                }, 2000);
            }
        }
    });
}

function dataURLtoBlob(dataURL) {
    const [meta, b64] = dataURL.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

window.addEventListener("load", () => {
    document.getElementById("regular-price").textContent = `${REGULAR_PRICE.toLocaleString()} so'm`;
    document.getElementById("prime-price").textContent   = `${PRIME_PRICE.toLocaleString()} so'm`;
    document.getElementById("silka-price").textContent   = `${SILKA_PRICE.toLocaleString()} so'm`;
    document.getElementById("top-price").textContent     = `TOP — ${TOP_PRICE.toLocaleString()} so'm`;
    document.getElementById("pin-price").textContent     = `PIN — ${PIN_PRICE.toLocaleString()} so'm`;

    ["totalCount", "regularCount", "primeCount", "silkaliCount"].forEach(id => {
        const el = document.getElementById(id);
        el.oninput = updateCounts;
        setupMobileInput(id);
    });

    updateCounts();
});