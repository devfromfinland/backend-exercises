const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan((tokens, req, res) => {
  // console.log('tokens', tokens)
  // console.log('req', req.body)
  // console.log('res', res)

  morgan.token('req-body', (req, res) => JSON.stringify(req.body))
  
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms', 
    tokens['req-body'](req, res),
  ].join(' ')
}))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "123123123",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "1231231",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/info', (req, res) => {
  const text = `Phonebook has info for ${persons.length} persons
    <br><br>${new Date()}`

  res.send(text)
})

// app.get('/', (req, res) => {
//   res.send('<h1>This is the backend code for phonebook exercise</h1>')
// })

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }

  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const generateId = () => {
  return Math.round(Math.random() * 1000000000)
}

const isExist = (name) => 
  persons.findIndex(person => 
    person.name.toUpperCase() === name.toUpperCase())

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (isExist(body.name) >= 0) {
    return res.status(400).json({ 
      error: 'name must be unique'
    })
  }

  // check if the name is exist,
  // if yes -> ask to update the number?
  // or update the number directly?

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(newPerson)

  res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})