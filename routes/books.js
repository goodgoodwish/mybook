const express = require('express')
const router = express.Router()
const Book = require('../models/book')

// All Books route
router.get('/', async (req, res) => {
    res.send('All books')
})

// New Book Route
router.get('/new', (req, res) => {
    res.send('New book')
})

// Create Author Route
router.post('/', async (req, res) => {
    res.send('Create book')
})

module.exports = router