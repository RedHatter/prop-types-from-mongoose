const { Schema } = require('mongoose')
const PropTypes = require('prop-types')
const validators = require('./validators.js')

function fromSchema (schema, refs) {
  return fromObject(schema.obj, refs)
}

function fromObject (obj, refs) {
  return Object.entries(obj)
  .reduce((propTypes, [ key, value ]) => (propTypes[key] = getPropType(value, refs), propTypes), {})
}

function getPropType (value, refs) {
  let schemaType = value.type || value
  let type = PropTypes.any

  if (Array.isArray(schemaType)) {
    type = schemaType.length > 0 ? PropTypes.arrayOf(getPropType(schemaType[0], refs)) : PropTypes.array
  } else if (typeof schemaType == 'object') {
    type = PropTypes.shape(fromObject(schemaType))
  } else {
    switch (schemaType) {
      case String: {
        if (Array.isArray(value.enum)) {
          type = PropTypes.oneOf(value.enum)
          break
        }

        let allTypes = [ PropTypes.string ]

        if (value.match instanceof RegExp)
          allTypes.push(validators.match(value.match))

        if (typeof value.minlength == 'number')
          allTypes.push(validators.minlength(value.minlength))

        if (typeof value.maxlength == 'number')
          allTypes.push(validators.maxlength(value.maxlength))

        type = validators.and(allTypes)
        break
      }

      case Schema.Types.Decimal128:
      case Number: {
        let allTypes = [ PropTypes.number ]

        if (typeof value.min == 'number')
          allTypes.push(validators.min(value.min))

        if (typeof value.max == 'number')
          allTypes.push(validators.max(value.max))

        type = validators.and(allTypes)
        break
      }

      case Date: {
        let allTypes = [ PropTypes.instanceOf(Date) ]

        if (value.min instanceof Date)
          allTypes.push(validators.min(value.min))

        if (value.max instanceof Date)
          allTypes.push(validators.max(value.max))

        type = validators.and(allTypes)
        break
      }

      case Schema.Types.ObjectId:
        if (refs && value.ref && refs.hasOwnProperty(value.ref)) {
          type = PropTypes.shape(fromSchema(refs[value.ref]))
          break
        }

        type = PropTypes.object
      break

      case Map:
        type = PropTypes.object
        break

      case Boolean:
        type = PropTypes.bool
        break
    }

  }

  if (value.required === true) type = type.isRequired

  return type
}

module.exports = fromSchema
