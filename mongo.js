const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide more arguments to the command line. Example: node mongo.js <password> <optional person name> <optional phone number>')
  process.exit(1)
}

const dbName = "phonebook"
const password = process.argv[2]
const name = process.argv[3]
const phone = process.argv[4]

const addPerson = (personName, personNumber) => {
  const url = `mongodb+srv://fullstack:${password}@cluster0-jcavg.mongodb.net/${dbName}?retryWrites=true&w=majority`

  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema)

  const newPerson = new Person({
    name: personName,
    number: personNumber,
  })

  newPerson.save()
    .then(result => {
      console.log(`Added ${result.name} number ${result.number} to ${dbName}`)
      mongoose.connection.close()
    })
    // .catch(error => {
    //   console.log('Error while adding a new person', error)
    //   return 'fail'
    // })
}

const logPersons = (persons) => {
  console.log('phonebook:')
  for (let i = 0; i < persons.length; i++) {
    console.log(`${persons[i].name} ${persons[i].number}`)
  }
}

const getAll = () => {
  const url = `mongodb+srv://fullstack:${password}@cluster0-jcavg.mongodb.net/${dbName}`
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

  const Person = mongoose.model('Person', personSchema)

  Person.find({})
    .then(persons => {
      // logPersons(persons)
      console.log('persons', persons)
      mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
  getAll()
}

if (name && phone && name.length > 0 && phone.length > 0) {
  addPerson(name, phone)
}