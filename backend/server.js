const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'messages.json');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Read/Write helpers
const readMessages = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeMessages = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields required' });
    }
    const messages = readMessages();
    messages.push({
        id: Date.now().toString(),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
        read: false
    });
    writeMessages(messages);
    console.log(`📧 New message from ${name}`);
    res.json({ success: true });
});

app.get('/api/admin/messages', (req, res) => {
    res.json(readMessages().reverse());
});

app.get('/api/admin/stats', (req, res) => {
    const messages = readMessages();
    res.json({
        totalMessages: messages.length,
        unreadMessages: messages.filter(m => !m.read).length,
        lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
    });
});

app.put('/api/admin/messages/:id', (req, res) => {
    const messages = readMessages();
    const idx = messages.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    messages[idx].read = true;
    writeMessages(messages);
    res.json(messages[idx]);
});

app.delete('/api/admin/messages/:id', (req, res) => {
    let messages = readMessages();
    messages = messages.filter(m => m.id !== req.params.id);
    writeMessages(messages);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Data: ${DATA_FILE}`);
});