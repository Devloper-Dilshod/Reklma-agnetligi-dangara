// pages/api/send-order.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST kerak' });
    }
    
    const { name, phone, username, note, img } = req.body;
    
    // BOT_TOKEN faqat serverda – hech qayerda ko‘rinmaydi!
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_ID = process.env.ADMIN_ID;
    
    if (!BOT_TOKEN || !ADMIN_ID) {
        return res.status(500).json({ error: 'Server xato' });
    }
    
    const caption = `Reklama Buyurtmasi\n\n` +
    `Reklama nomi: ${name}\n` +
    `Telefon: ${phone}\n` +
    `Telegram: ${username}\n` +
    `Izoh: ${note || "Yo'q"}\n` +
    `Vaqt: ${new Date().toLocaleString('uz-UZ')}\n\n` +
    `Operator: @dangara_agent\n` +
    `Oylik tariflar kelishtiriladi`;
    
    // Base64 → Blob
    const imgData = img.replace(/^data:image\/png;base64,/, '');
    const blob = Buffer.from(imgData, 'base64');
    
    const form = new FormData();
    form.append('chat_id', ADMIN_ID);
    form.append('photo', blob, 'cheque.png');
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: form
        });
        const data = await response.json();
        
        if (data.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ error: data.description || 'Telegram xato' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
