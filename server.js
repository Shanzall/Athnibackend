// Basic Express backend for Network Notifier with MongoDB

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['L1', 'L2', 'L3'], required: true },
  frequencyValue: { type: Number, required: true },
  frequencyUnit: { type: String, enum: ['days', 'weeks', 'months'], required: true },
  lastContactedDate: { type: Date, default: Date.now },
  notes: { type: String },
  socialLinks: [{ type: String }], // <-- array of strings
});

const Contact = mongoose.model('Contact', contactSchema);

app.get('/', (req, res) => {
  res.send('Welcome to the Network Notifier API');
});
// GET all contacts
app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// ADD a contact
app.post('/api/contacts', async (req, res) => {
  const {
    name,
    description,
    priority,
    frequencyValue,
    frequencyUnit,
    lastContactedDate,
    notes,
    socialLinks,
  } = req.body;

  const newContact = new Contact({
    name,
    description,
    priority,
    frequencyValue,
    frequencyUnit,
    lastContactedDate,
    notes,
    socialLinks,
  });
  await newContact.save();
  res.status(201).json(newContact);
});

// UPDATE a contact
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Contact.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE a contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
