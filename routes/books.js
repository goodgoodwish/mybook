const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Authors = require('../models/author')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })
const { now } = require('mongoose')

// All Books route
router.get('/', async (req, res) => {
    let searchOptions = {}
    let query = Book.find()
    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishBefore) {
        query = query.lte('publishDate', req.query.publishBefore)
    }
    if (req.query.publishAfter) {
        query = query.gte('publishDate', req.query.publishAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async (req, res) => {
    console.log("==log:", now())
    renderNewPage(res, new Book())
})

// Create Book Route
// router.post('/', upload.single('cover'), async (req, res) => {
router.post('/', async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        // coverImageName: fileName,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch (e) {
        console.error(e)
        renderNewPage(res, book, hasError=true)
    }
})

// Update book route
router.put('/:id', async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = req.body.publishDate
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '' ) {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (e) {
        console.error(e)
        if (book != null) {
            renderEditPage(res, book, hasError=true)
        } else {
            res.redirect('/')
        }
    }
})

// Show book route
router.get('/:id', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec()
        if (book.author === null || book.author === undefined) {
            await book.remove()
            console.log('book was removed')
            res.redirect('/books')
        } else {
            console.log(book.author)
            // console.log(book.author.name) 
            res.render('books/show', {book: book})
        }
    } catch (e) {
        console.error(e)
        res.redirect('/books')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (e) {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, hasError, 'new')
}
async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, hasError, formName='edit')
}

async function renderFormPage(res, book, hasError = false, formName) {
    try {
        const authors = await Authors.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            if (formName==='edit') {
                params.errorMessage = 'Error updating book.' 
            } else {
                params.errorMessage = 'Error creating book.' 
            }
        } 

        res.render(`books/${formName}`, params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router