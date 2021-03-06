

spendb.factory('flash', ['$rootScope', function($rootScope) {
  // Message flashing.
  var currentMessage = null;

  $rootScope.$on("$routeChangeSuccess", function() {
    currentMessage = null;
  });

  return {
    setMessage: function(message, type) {
      currentMessage = [message, type];
    },
    getMessage: function() {
      return currentMessage;
    }
  };
}]);


spendb.factory('validation', ['flash', 'config', function(flash, config) {
  // handle server-side form validation errors.
  var makeSlug = function(text) {
    return getSlug(text, '_');
  };

  var validSlug = function(text) {
    if (makeSlug(text) != text) return false;
    if (text.length < 3 || text.length > 29) return false;
    return config.reserved_terms.indexOf(text) == -1;
  };

  return {
    makeSlug: makeSlug,
    validSlug: validSlug,
    handle: function(form) {
      return function(res) {
        if (res.status == 400 || !form) {
            var errors = [];
            for (var field in res.data.errors) {
                form[field].$setValidity('value', false);
                form[field].$message = res.data.errors[field];
                errors.push(field);
            }
            if (angular.isDefined(form._errors)) {
                angular.forEach(form._errors, function(field) {
                    if (errors.indexOf(field) == -1) {
                        form[field].$setValidity('value', true);
                    }
                });
            }
            form._errors = errors;
        } else {
          flash.setMessage(res.data.message || res.data.title || 'Server error', 'danger');
        }
      }
    },
    clear: function(form) {
      if (angular.isDefined(form._errors)) {
        for (var i in form._errors) {
          var field = form._errors[i];
          console.log(field);
          form[field].$setValidity('value', true);
          form[field].$message = undefined;
        }
      };
      form._errors = undefined;
      form.$setPristine();
      form.$setValidity();
    }
  };
}]);


spendb.factory('data', ['$http', function($http) {
  /* This is used to cache reference data once it has been retrieved from the 
  server. Reference data includes the canonical lists of country names,
  currencies, etc. */
  var referenceData = $http.get('/api/3/reference');

  var getData = function(cb) {
    referenceData.then(function(res) {
      cb(res.data);
    });
  };

  return {'get': getData}
}]);


spendb.factory('session', ['$http', function($http) {
  var sessionDfd = $http.get('/api/3/sessions');
  return {
    'get': function(cb) {
      sessionDfd.then(function(res) {
        cb(res.data);
      });  
    }
  }
}]);
