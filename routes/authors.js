const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author() })
})

// Create Author Route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect('authors/new')
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author...'
        })
    }
})

router.get('/:id', (req, res) => {
    res.send('Show Author ' + req.params.id)
})

router.get('/:id/edit', (req, res) => {
    res.send('Edit Autho ' + req.params.id)
})

router.put('/:id', (req, res) =>{
    res.send('Update Author ')
})

router.delete('/:id', (req, res) => {
    res.send('Delete Author ' + req.params.id)
})

module.exports = router