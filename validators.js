module.exports = {
  combine: function (validators) {
    let validate = validators.length == 1
      ? validators[0]
      : function (...args) {
          for (let func of validators) {
            let result = func(...args)
            if (result != undefined) return result
          }
        }

    if (!validate.isRequired)
      validate.isRequired = function (props, propName, componentName, ...args) {
        if (props[propName] == undefined)
          return new Error (`The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is \`${props[propName]}\`.`)
        else
          return validate(props, propName, componentName, ...args)
      }

    return validate
  },

  match: function (match) {
    return function (props, propName, componentName) {
      if (!match.test(props[propName]))
        return new Error (`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Regular expression validation failed.`)
    }
  },

  minlength: function (min) {
    return function (props, propName, componentName) {
      if (props[propName].length < min)
        return new Error (`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Less than ${min} characters long.`)
    }
  },

  maxlength: function (max) {
    return function (props, propName, componentName) {
      if (props[propName].length > max)
        return new Error (`Invalid prop \`${propName}\` supplied to \`${componentName}\`. More than ${max} characters long.`)
    }
  },

  min: function (min) {
    return function (props, propName, componentName) {
      if (props[propName] < min)
        return new Error (`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Can not be smaller than ${min}.`)
    }
  },

  max: function (max) {
    return function (props, propName, componentName) {
      if (props[propName] > max)
        return new Error (`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Can not be larger than ${max}.`)
    }
  },
}
