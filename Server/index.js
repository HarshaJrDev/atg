const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://HarshaBackend:vfcdatabase@cluster1.vwvl8jx.mongodb.net/creditcards?retryWrites=true&w=majority&appName=Cluster1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const creditCardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cardNumber: {
        type: String,
        required: true,
        validate: {
            validator: (value) => /^\d{16}$/.test(value),
            message: 'Card number must be 16 digits long.',
        },
    },
    selectedDate: {
        type: Date,
        required: true,
    },
});

const CreditCard = mongoose.model('creditcards', creditCardSchema);


app.post('/validate-card', async (req, res) => {
    const { name, cardNumber, selectedDate } = req.body;


    if (!name || !cardNumber || cardNumber.length !== 16 || isNaN(cardNumber)) {
        return res.status(400).json({ message: 'Invalid input. Please enter a valid name and 16-digit card number.' });
    }


    const date = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (date < today) {
        return res.status(400).json({ message: 'Selected date cannot be in the past.' });
    }
    if (date.getDay() === 0) {
        return res.status(400).json({ message: 'Sunday is not a valid selection. Please pick another day.' });
    }

    try {
        const newCard = new CreditCard({ name, cardNumber, selectedDate: date });
        await newCard.save();
        res.status(200).json({ message: 'Card information successfully saved.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
