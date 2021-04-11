const express = require('express')
const author = require('../models/author')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

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
        res.redirect(`/authors/${author.id}`)
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author...'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const booksByAuthor = await Book.find({author: author.id}).limit(8).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: booksByAuthor
        })
    } catch(e) {
        res.redirect(`/authors`)
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        let author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})

    } catch(e) {
        console.error(e)
        res.redirect(`/authors`)
    }
})

router.put('/:id', async (req, res) =>{
    let author ;
    try {
        const author = await Author.findById(req.params.id)
        author.name = req.body.name
        const newAuthor = await author.save()
        // res.redirect(`/authors/${author.id}`)
        res.redirect(`${author.id}`)
    } catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating author.'
            })

        }
    }
})

router.delete('/:id', async (req, res) => {
    let author ;
    try {
        const author = await Author.findById(req.params.id)
        await author.remove();
        res.redirect('/authors')
    } catch (e) {
        console.error(e)
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router