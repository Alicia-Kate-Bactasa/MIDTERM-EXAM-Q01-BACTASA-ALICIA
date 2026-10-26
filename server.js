const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const dataFile = path.join(__dirname, 'data.json');

const readData = () => {
    const stored = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return Array.isArray(stored) ? stored : stored.tickets || [];
};
const writeData = (data) => fs.writeFileSync(
    dataFile,
    JSON.stringify({ tickets: data }, null, 2) + '\n'
);

app.get('/api/tickets', (req, res) => res.json(readData()));

app.get('/api/tickets/:id', (req, res) => {
    const item = readData().find(t => String(t.id) === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/tickets', (req, res) => {
    const { customer_name, problem, priority } = req.body;
    if (!customer_name || !problem || !priority) {
        return res.status(400).json({ error: 'customer_name, problem, and priority are required' });
    }

    const tickets = readData();
    const nextId = tickets.reduce((highestId, ticket) => {
        const ticketId = Number(ticket.id);
        return Number.isInteger(ticketId) ? Math.max(highestId, ticketId) : highestId;
    }, 99) + 1;
    const newItem = { id: nextId, customer_name, problem, priority, status: "Pending" };
    tickets.push(newItem);
    writeData(tickets);
    res.status(201).json(newItem);
});

app.delete('/api/tickets/:id', (req, res) => {
    let tickets = readData();
    const filtered = tickets.filter(t => String(t.id) !== req.params.id);
    if (tickets.length === filtered.length) return res.status(404).json({ error: 'Not found' });
    writeData(filtered);
    res.json({ message: 'Deleted' });
});

app.listen(3000, () => console.log('Running on port 3000'));
