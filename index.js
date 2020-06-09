require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan((tokens, req, res) => {
  // console.log('tokens', tokens)
  // console.log('req', req.body)
  // console.log('res', res)

  morgan.token('req-body', (req) => JSON.stringify(req.body))

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['req-body'](req, res),
  ].join(' ')
}))

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      const text = `Phonebook has info for ${persons.length} persons
      <br><br>${new Date()}`

      res.send(text)
    })
    .catch(error => next(error))
    // res.status(404).end()
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
    // res.status(404).end()
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then(person => {
      res.json(person)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndDelete(id)
    .then(() => res.status(204).end())  // no content
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))

  // No need to check if the name is exist since it has been checked in the front end
  // Person.findOne({ name: { $regex : new RegExp(body.name, "i") } }, (error, found) => {
  //   console.log('found', found)
  //   if (found) {
  //     // update to new number
  //     found.number = body.number
  //     found.save()
  //       .then(updatedPerson => {
  //         res.json(updatedPerson)
  //       })
  //   } else {
  //     // add new person
  //   }
  // })
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const number = req.body.number

  // const person = {
  //   name: req.body.name,
  //   number: req.body.number
  // }
  // Person.findByIdAndUpdate(id, person)
  //   .then(updatedPerson => res.json(updatedPerson))
  //   .catch(error => next(error))

  Person.findById(id, (error, result) => {
    if (error) {
      next(error)
    } else if (!result) {
      console.log('no data')
      res.status(404).end()
    } else {
      result.number = number

      result.save()
        .then(result => {
          res.json(result)
        })
        .catch(error => next(error))
    }
  })
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  switch (error.name) {
  case 'CastError':
    return res.status(400).send({ error: 'malformatted id' })
  case 'ValidationError':
    return res.status(400).json({ error: error.message })
  default:
    next(error)
  }
}

// handler of errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})