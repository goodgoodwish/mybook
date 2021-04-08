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

// Create Author Route
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

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Authors.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error creating book.'
        res.render('books/new', params)
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