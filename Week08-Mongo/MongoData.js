/**
 * @author Charlie Calvert
 */

/* global angular */

angular.module('elvenApp', ['pres'])
.constant('CONFIG', {
    DB_NAME: 'buencamino01',
    COLLECTION: 'Prog270',
    API_KEY: 'Ab5e_M_ql3JNxfkmaZLSWhsu2NNnHYzW'

})
.controller('MyController', function($scope, $http, presidents) {
    $scope.hint = "<p>Start with <strong>node server.js</strong> to retrieve JSON from Server</p>";
    
    $scope.presidentsLength = 0;
    $scope.userIndexSelection = 0;
    
    // $scope.presidents = presidents;
    $scope.presidents = presidents.query({}, function(presidents) {
      $scope.presidentsLength = presidents.length;
      console.log($scope.presidentsLength);
      $scope.userIndexSelection = 0;      
      $('#indexSelection').val("0");
      $scope.indexChange();
    });
    
    $scope.test = function() {
      $scope.userIndexSelection = 0;
    };
    
    $scope.addPresident = function() {
        var pres = new presidents({
            filmName: $scope.filmName,
            genre: $scope.genre,
            year: $scope.year,
            director: $scope.director,
            actors: $scope.actors,
            comments: $scope.comments,
        });
        pres.$save(function(president, r) {
            $scope.presidents.push(president);
            $scope.presidentsLength = $scope.presidents.length;
        });
    };
    
    $scope.deleteRow = function() {
        var userIndexSelection = $scope.userIndexSelection;
        // if (userIndexSelection < $scope.presidents.length) {}
        $scope.presidents[userIndexSelection].remove(function(deletedObject, headers) {
            $scope.presidents.splice(userIndexSelection, 1);
            $scope.presidentsLength = $scope.presidents.length;
        }, function(err) {
            console.log("error: " + err.data.message);  
        });
    };
    
    $scope.updateRow = function() {
        var indexOfItemToUpdate = $scope.userIndexSelection;
        $scope.presidents[indexOfItemToUpdate].filmName = $scope.filmName;
        $scope.presidents[indexOfItemToUpdate].genre = $scope.genre;
        $scope.presidents[indexOfItemToUpdate].year = $scope.year;
        $scope.presidents[indexOfItemToUpdate].director = $scope.director;
        $scope.presidents[indexOfItemToUpdate].actors = $scope.actors;
        $scope.presidents[indexOfItemToUpdate].comments = $scope.comments;

        $scope.presidents[indexOfItemToUpdate].updateMe(function(data) {            
            console.log("success: " + data);
        }, function(err) {
            console.log("Error Status: " + err.status + ' ' + err.data.message);
        });  
    };
    
    $scope.indexChange = function() {        
        $scope.filmName = $scope.presidents[$scope.userIndexSelection].filmName;
        $scope.genre = $scope.presidents[$scope.userIndexSelection].genre;
        $scope.year = $scope.presidents[$scope.userIndexSelection].year;
        $scope.director = $scope.presidents[$scope.userIndexSelection].director;
        $scope.actors = $scope.presidents[$scope.userIndexSelection].actors;
        $scope.comments = $scope.presidents[$scope.userIndexSelection].comments;
    };
});

angular.module('pres', ['ngResource'])
.factory('presidents', function($resource, CONFIG) {
	console.log('Presidents factory called');
	var Presidents = $resource(
        'https://api.mongolab.com/api/1/databases/' + CONFIG.DB_NAME + 
        '/collections/' + CONFIG.COLLECTION + '/:id', {      
        apiKey: CONFIG.API_KEY     
    },
    {
        update: {method:'PUT'}
    });

    Presidents.prototype.updateMe = function (callback, errorCallback) {
        console.log("update called");
        return Presidents.update(
            {id:this._id.$oid}, 
            angular.extend({}, this, {_id:undefined}), 
            callback, 
            errorCallback);
    };
    
    Presidents.prototype.getFilmName = function() {
      return this.filmName;
    };
    
    Presidents.prototype.getGenre = function() {
      return this.genre;
    };
    
    Presidents.prototype.getYear = function() {
      return this.year;
    };
    
    Presidents.prototype.getDirector = function() {
      return this.director;
    };
    
    Presidents.prototype.getActors = function() {
      return this.actors;
    };
    
    Presidents.prototype.getComments = function() {
      return this.comments;
    };

    Presidents.prototype.remove = function (cb, errorcb) {
      return Presidents.remove({id:this._id.$oid}, cb, errorcb);
    };

    Presidents.prototype['delete'] = function (cb, errorcb) {
      return this.remove(cb, errorcb);
    };

    return Presidents;    
	 
	// return { a: 2 };		
});
