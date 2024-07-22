const Ticket = require('../models/Ticket');

exports.buyTicket = async (req, res) => {
    try {
        const { event, date, price, purchaser } = req.body;
        const ticket = new Ticket({ event, date, price, purchaser });
        await ticket.save();
        res.status(201).json({ message: 'Ticket purchased successfully', ticket });
    } catch (error) {
        res.status(500).json({ message: 'Failed to purchase ticket', error });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve tickets', error });
    }
};
