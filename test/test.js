const { Schema } = require('mongoose')
const PropTypes = require('prop-types')
const assert = require('assert')
const fromSchema = require('../')
const moment = require('moment')

describe('Schema validation', function() {
  before(function () {
    console.error = (error) => { throw new Error(error) }
  })

  it('Built-in required', function() {
    validateSchema(new Schema({ key: { type: String, required: true } }), { key: 'value' }, { a: 'b' },
    'The prop `props.key` is marked as required in `$1`, but its value is `undefined`.')
  })

  it('Custom required', function() {
    validateSchema(new Schema({ key: { type: String, match: /^a+$/, required: true } }), { key: 'aaa' }, { a: 'b' },
    'The prop `key` is marked as required in `$1`, but its value is `undefined`.')
  })

  describe('String', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: String }), { key: 'value' }, { key: 0 },
        'Invalid prop `props.key` of type `number` supplied to `$1`, expected `string`.')
    })

    it('Match RegExp', function() {
      validateSchema(new Schema({ key: { type: String, match: /^a+$/ } }), { key: 'aaa' }, { key: 'bbb' },
        'Invalid prop `key` supplied to `$1`. Regular expression validation failed.')
    })

    it('Max length', function() {
      validateSchema(new Schema({ key: { type: String, maxlength: 5 } }), { key: 'aaa' }, { key: 'aaaaaa' },
        'Invalid prop `key` supplied to `$1`. More than 5 characters long.')
    })

    it('Min length', function() {
      validateSchema(new Schema({ key: { type: String, minlength: 5 } }), { key: 'aaaaaa' }, { key: 'aaa' },
        'Invalid prop `key` supplied to `$1`. Less than 5 characters long.')
    })

    it('Enum', function() {
      validateSchema(new Schema({ key: { type: String, enum: [ 'a', 'b', 'c' ] } }), { key: 'b' }, { key: 'd' },
        'Invalid prop `props.key` of value `d` supplied to `$1`, expected one of ["a","b","c"].')
    })
  })

  describe('Number', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: Number }), { key: 0 }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `number`.')
    })

    it('Max value', function() {
      validateSchema(new Schema({ key: { type: Number, max: 5 } }), { key: 4 }, { key: 6 },
        'Invalid prop `key` supplied to `$1`. Can not be larger than 5.')
    })

    it('Min value', function() {
      validateSchema(new Schema({ key: { type: Number, min: 5 } }), { key: 6 }, { key: 4 },
        'Invalid prop `key` supplied to `$1`. Can not be smaller than 5.')
    })
  })

  describe('Date', function () {
    let now = new Date()

    it('Valid type', function() {
      validateSchema(new Schema({ key: Date }), { key: now }, { key: 'value' },
        'Invalid prop `props.key` of type `String` supplied to `$1`, expected instance of `Date`.')
    })

    it('Max value', function() {
      validateSchema(new Schema({ key: { type: Date, max: now } }),
        { key: moment().subtract(1, 'hour').toDate() }, { key: moment().add(1, 'hour').toDate() },
        `Invalid prop \`key\` supplied to \`$1\`. Can not be larger than ${now}.`)
    })

    it('Min value', function() {
      validateSchema(new Schema({ key: { type: Date, min: now } }),
        { key: moment().add(1, 'hour').toDate() }, { key: moment().subtract(1, 'hour').toDate() },
        `Invalid prop \`key\` supplied to \`$1\`. Can not be smaller than ${now}.`)
    })
  })

  describe('Boolean', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: Boolean }), { key: true }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `boolean`.')
    })
  })

  describe('Decimal128', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: Schema.Types.Decimal128 }), { key: 1.0 }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `number`.')
    })
  })

  describe('Object', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: { a: String, b: Number } }), { key: { a: 'value', b: 1 } }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `object`.')
    })
  })

  describe('Map', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: { type: Map } }), { key: { a: 'b' } }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `object`.')
    })
  })

  describe('Array', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: [ String ] }), { key: [ 'a', 'b', 'c' ] }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected an array.')
    })

    it('Generic', function() {
      validateSchema(new Schema({ key: [ ] }), { key: [ 'a', 1, 1.1 ] }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `array`.')
    })

    it('Nested Schema', function() {
      validateSchema(new Schema({ key: [ new Schema({ key: String }) ] }), { key: [ { key: 'a' } ] }, { key: [ { key: 1 }] },
        'Invalid prop `props.key[0].key` of type `number` supplied to `$1`, expected `string`.')
    })
  })

  describe('ObjectId', function () {
    it('Valid type', function() {
      validateSchema(new Schema({ key: Schema.Types.ObjectId }), { key: { a: 'value' } }, { key: 'value' },
        'Invalid prop `props.key` of type `string` supplied to `$1`, expected `object`.')
    })

    it('Nested schema', function() {
      validateSchema(new Schema({ key: { type: Schema.Types.ObjectId, ref: 'Nested' } }), { key: { a: 'value' } }, { key: { a: 0 } },
        'Invalid prop `props.key.a` of type `number` supplied to `$1`, expected `string`.',
        { Nested: new Schema({ a: String }) })
    })
  })

  describe('Bugs', function () {
    // A property that's not required but has a Special validator (match, enum, min, ect.) should still pass with an undefined field
    it('Special validators force required', function() {
      validateSchema(new Schema({ key: { type: String, match: /^a+$/ } }), { a: 'b' }, { key: 'bbb' },
      'Invalid prop `key` supplied to `$1`. Regular expression validation failed.')
    })
  })
})

function validateSchema (schema, valid, invalid, expectedError, refs) {
  let validator = fromSchema(schema, refs)
  let componentName = Math.random().toString(36).substring(2)

  try {
    PropTypes.checkPropTypes({ props: validator }, { props: valid }, 'prop', componentName)
  } catch (e) {
    assert.fail('Valid property failed validation: ' + e.message)
  }

  try {
    PropTypes.checkPropTypes({ props: validator }, { props: invalid }, 'prop', componentName)
  } catch (e) {
    assert.equal(e.message, 'Warning: Failed prop type: ' + expectedError.replace(/\$1/g, componentName), 'Unexpeced error message')
    return
  }

  assert.fail('Invalid property passed validation')
}
