function Validator(formSelector) {
  var _this = this;
  // get parent UI
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
    }
    element = element.parentElement;
  };

  // validator rule
  var validatorRules = {
    required: function (value) {
      return value ? undefined : 'Please enter this field!';
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : 'Please enter your correct email!';
    },
    min: function (min) {
      return function (value) {
        return value.length >= min ? undefined : `Please enter minimum ${min} character!`;
      }
    },
    max: function (max) {
      return function (value) {
        return value.length <= max ? undefined : `Please enter maximum ${max} character!`;
      }
    },
    confirmed: function (value) {
      var password = document.querySelector(`${formSelector} #password`).value;
      return value == password ? undefined : 'Please enter correct password!';
    }
  };

  var formRules = {};
  // get element in dom
  var formElement = document.querySelector(formSelector);
  // if have form element
  if (formElement) {
    var inputs = formElement.querySelectorAll('[name][rule]')
    for (var input of inputs) {
      var rules = input.getAttribute('rule').split('|');
      for (var rule of rules) {
        var isRuleHasValue = rule.includes(':');
        var ruleInfo;
        if (isRuleHasValue) {
          ruleInfo = rule.split(':');
          rule = ruleInfo[0];
        }
        var ruleFunc = validatorRules[rule];
        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }

      // handle onblur, oninput
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }

    // function handle validate
    function handleValidate(e) {
      var rules = formRules[e.target.name];
      var errorMessage;
      for (var rule of rules) {
        errorMessage = rule(e.target.value);
        if (errorMessage) break;
      }
      // show Message error
      if (errorMessage) {
        var formGroup = getParent(e.target, '.form-group');
        if (formGroup) {
          formGroup.classList.add('invalid');
          var formMessage = formGroup.querySelector('.form-message');
          if (formMessage) {
            formMessage.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    };

    // function handle clear error
    function handleClearError(e) {
      var formGroup = getParent(e.target, '.form-group');
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid');
      }
      var formMessage = formGroup.querySelector('.form-message');
      if (formMessage) {
        formMessage.innerText = '';
      }
    }
  }
  // submit form
  formElement.onsubmit = function (e) {
    e.preventDefault();
    var inputs = formElement.querySelectorAll('[name][rule]');
    var isValid = true;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }
    // submit form
    if (isValid) {
      if (typeof _this.onSubmit === 'function') {
        var enableInputs = formElement.querySelectorAll('[name]');
        var formValues = Array.from(enableInputs).reduce(function (values, input) {
          switch (input.type) {
            case 'radio':
              values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
              break;
            case 'checked':
              if (!input.matches(':checked')) return values;
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            case 'file':
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
    console.log(isValid);
  }
};