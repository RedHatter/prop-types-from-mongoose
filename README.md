# prop-types-from-mongoose
[![Build Status](https://travis-ci.org/RedHatter/prop-types-from-mongoose.svg?branch=master)](https://travis-ci.org/RedHatter/prop-types-from-mongoose)
[![Coverage Status](https://coveralls.io/repos/github/RedHatter/prop-types-from-mongoose/badge.svg?branch=master)](https://coveralls.io/github/RedHatter/prop-types-from-mongoose?branch=master)

[![NPM](https://nodei.co/npm/prop-types-from-mongoose.png)](https://nodei.co/npm/prop-types-from-mongoose/)

Generate a validation function for [PropTypes](https://github.com/facebook/prop-types) from Mongoose schema. Supports all Mongoose types and most validators.

## API
Exports a single function that takes a Mongoose Schema and returns a PropType validation function.

    fromSchema(schema[, refs])

### Parameters

* `schema`  
    The `mongoose.Schema` to convert to a PropType function

* `refs` *Optional*   
    Object mapping nested `Schema`s referenced from `ObjectId`s to their respective names.

### Return value

A PropTypes validation function.

## Supported validation types

* String
    - match
    - maxlength
    - minlength
    - enum
* Number / Decimal128
    - max
    - min
* Boolean
* Object
* Map
* Array
* ObjectId
    - ref
* Sub-documents a.k.a. embed schemas

## Example

Here is an example of a React Component using PropType validation based on a Mongoose Schema:

    import React, { Component } from 'react'
    import { Schema } from 'mongoose'
    import fromSchema from 'prop-types-from-mongoose'

    let userSchema = new Schema({
        name: String,
        email: {
            type: String
            match: /^.+?@.+?$/
        }
    })

    class Example extends Component {
        render () {
            return <h1>Hello { this.props.user.name }</h1>
        }
    }

    Example.propTypes = {
        user: fromSchema(userSchema)
    }

    export default Example
