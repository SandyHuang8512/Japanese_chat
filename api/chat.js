export default async function handler(req, res) {
    // 確保只接受 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // 確保環境變數中有 GROQ_API_KEY
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'Server misconfiguration: Missing GROQ_API_KEY' });
    }

    try {
        // 將來自前端的請求轉發給 Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Error from Groq API');
        }

        // 回傳結果給前端
        res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
