
spendb.directive('metadataEditor', ['$http',
  function ($http, data) {
  return {
    restrict: 'AE',
    scope: {
      "dataset": "=",
      "reference": "=",
      "form": "="
    },
    transclude: true,
    templateUrl: 'directives/metadata.html',
    link: function (scope, element, attrs, model) {
    }
  };
}]);


spendb.directive('uploadPanel', ['$http', '$location', '$route', 'Upload',
  function ($http, $location, $route, Upload) {
  return {
    restrict: 'AE',
    scope: {
      "dataset": "=",
      "notify": "&"
    },
    templateUrl: 'directives/upload.html',
    link: function (scope, element, attrs, model) {
      scope.submitForm = {};
      scope.uploadPercent = null;
      scope.uploads = [];

      scope.uploadFile = function() {
        if (!scope.hasFile()) return;
        scope.uploadPercent = 1;

        Upload.upload({
          url: scope.dataset.api_url + '/sources/upload',
          file: scope.uploads[0]
        }).progress(function (evt) {
          scope.uploadPercent = Math.max(1, parseInt(95.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          scope.uploads = [];
          scope.uploadPercent = null;
          if (scope.notify) scope.notify();
        });
      };

      scope.hasFile = function() {
        return !scope.uploadPercent && scope.uploads && scope.uploads.length;
      };

      scope.submitUrl = function() {
        if (!scope.hasUrl()) return;
        var form = angular.copy(scope.submitForm);
        scope.submitForm = {};

        $http.post(scope.dataset.api_url + '/sources/submit', form).then(function(res) {
          if (scope.notify) scope.notify();
        });
      };

      scope.hasUrl = function() {
        return scope.submitForm.url && scope.submitForm.url.length > 3;
      };

    }
  };
}]);


spendb.directive('sourcesTable', ['$http', '$timeout',
  function ($http, $timeout) {
  return {
    restrict: 'AE',
    scope: {
      "dataset": "="
    },
    templateUrl: 'directives/sources.html',
    link: function (scope, element, attrs, model) {
      var sourcesUrl = scope.dataset.api_url + '/sources',
          loadTimeout = null;
      scope.sources = {};

      scope.hasSources = function() {
        return angular.isDefined(scope.sources.total);
      };

      scope.canModelRun = function(run) {
        if (!run.status == 'complete') {
          return false;  
        }
        return run.operation.indexOf('to database') != -1;
      };

      scope.recheck = function() {
        $http.get(sourcesUrl).then(function(res) {
          var sources = res.data;
          if (sources.results.length) {
            var url = sources.results[0].runs_url;
            $http.get(url).then(function(res) {
              sources.results[0].runs = res.data.results;
              scope.sources = sources;
              loadTimeout = $timeout(scope.recheck, 2000);
            });
          } else {
            scope.sources = sources;
            loadTimeout = $timeout(scope.recheck, 2000);
          }
        });
      };

      scope.recheck();

      scope.$on('$destroy', function() {
        $timeout.cancel(loadTimeout);
      });

    }
  };
}]);
