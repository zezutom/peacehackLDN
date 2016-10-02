'use strict';

angular.module('myApp.view', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view', {
    templateUrl: 'view/view.html',
    controller: 'ViewCtrl'
  });
}])

.controller('ViewCtrl', ['$scope', '$http', function($scope, $http) {
    var vm = $scope;

    vm.text = "";

    vm.nouns = null;
    vm.adjectives = null;
    vm.adverbs = null;
    vm.verbs = null;
    vm.values = null;

    // Words identified as hateful
    vm.hateSpeech = null;

    // The most recent hate word
    vm.hateWord = null;

    // HateBase
    vm.htbase = null;

    // Total (malicious) score
    vm.score = 0;

    // Show an engaging Twitter feed?
    vm.showIncentive = false;

    // This is a hack around ng-repeat (see view.html)
    vm.scoreRange = [];

    $http.get('resources/hatebase_ethnicity.json').success(function (data) {
        vm.htbase = data.data.datapoint;
        console.log('successfully loaded hatebase');
    }).error(function (data) {
        console.log('error getting data from hatebase');
    });

    vm.$watch('text', function (text) {

        if (!text) {
            vm.nouns = null;
            vm.adjectives = null;
            vm.adverbs = null;
            vm.verbs = null;
            vm.values = null;
            vm.hateSpeech = null;
            vm.hateWord = null;
            vm.htbase = null;
            vm.score = 0;
            vm.showIncentive = false;
            vm.scoreRange = [];
            return;
        }

        vm.hateSpeech = text.split(/,?\s+/).map(function(word) {
            // This is now the whole text
            var word = word.trim().toLocaleLowerCase();
            console.log(word);

            var offensiveItem = null;
            if (word.length > 3) {
                console.log("'" + word + "'");
                offensiveItem = _.find(vm.htbase, function(item) {
                    return item.vocabulary.indexOf(word) === 0;
                });
            }
            if (offensiveItem != undefined) {
                return offensiveItem;
            }
            return null;
        });

        vm.hateSpeech = _.filter(vm.hateSpeech, function (s) {
            return s != null;
        });

        vm.hateWord = _.last(vm.hateSpeech);

        var asFloat = function(x) {
            if (x != undefined && x.search(/^[+-]?\d+(\.\d+)?$/) >= 0) {
                return parseFloat(x);
            }
            return 0;
        };

        vm.score = _.chain(vm.hateSpeech).map(function (itm) {
            return asFloat(itm.offensiveness);
        }).reduce(function (x, y) {
            return x + y;
        }).value();

        vm.showIncentive = vm.score > 1;

        vm.scoreRange = [];
        for (var i = 0; i < vm.score; i++) {
            vm.scoreRange.push(i);
        }

        console.log('total score: ' + vm.score);
        console.log('score range: ' + vm.scoreRange);
        console.log('total words: ' + vm.hateSpeech.length);
    });
}]);