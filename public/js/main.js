function ngGridFlexibleHeightPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function (scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
        var innerRecalcForData = function () {
            var gridId = self.grid.gridId;
            var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
            var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
            var naturalHeight = self.grid.$canvas.height() + 1;
            if (opts != null) {
                if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                    naturalHeight = opts.minHeight - extraHeight - 2;
                }
            }

            var newViewportHeight = naturalHeight + 3;
            if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
                self.grid.$viewport.css('height', newViewportHeight + 'px');
                self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');
                self.scope.baseViewportHeight = newViewportHeight;
                self.domUtilityService.RebuildGrid(self.scope, self.grid);
            }
        };
        self.scope.catHashKeys = function () {
            var hash = '',
                idx;
            for (idx in self.scope.renderedRows) {
                hash += self.scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        self.scope.$watch('catHashKeys()', innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);
    };
}


var app = angular.module('traffic', ['ngGrid']);
app.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}]);

app.controller('TrafficController', ['$scope', 'socket', function($scope, socket){
  $scope.submit = function() {
    socket.emit('traffic_request',
      {
        address: $scope.address,
        radius: $scope.radius
      }
    );
  };

  $scope.results = []

  $scope.gridOptions = {
    data: 'results',
    columnDefs: [
      {field: 'desc', displayName: 'Description'},
      {field:'startTime', displayName:'Start'},
      {field:'endTime', displayName:'End'},
      {field:'severity', displayName:'Severity'},
      {field:'impacting', displayName:'Impacting'}
    ],
    rowHeight: 100,
    plugins: [new ngGridFlexibleHeightPlugin()],
    visible: false
  }

  socket.on('results', function (data) {
    $scope.errorMessages = null;
    $scope.noResults = null;
    for (var i = 0; i < data.length; i++) {
      $scope.results.push(data[i]);
    }
  });

  socket.on('error', function(data) {
    while($scope.results.length > 0) {
      $scope.results.pop();
    }
    $scope.noResults = null;
    $scope.errorMessages = data.join(' ');
  });

  socket.on('noResults', function(data) {
    while($scope.results.length > 0) {
      $scope.results.pop();
    }
    $scope.errorMessages = null;
    $scope.noResults = data;
  });
}]);
