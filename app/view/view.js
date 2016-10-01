'use strict';

angular.module('myApp.view', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view', {
    templateUrl: 'view/view.html',
    controller: 'ViewCtrl'
  });
}])

.controller('ViewCtrl', ['$scope', '$http', 'nlp', function($scope, $http, nlp) {
    var vm = $scope;

    vm.text = "";

    vm.nouns = null;
    vm.adjectives = null;
    vm.adverbs = null;
    vm.verbs = null;
    vm.values = null;

    // Words identified as hateful
    vm.hateSpeech = null;

    // Resulting measure
    vm.biggestOffender = null;

    // HateBase
    vm.htbase = null;

    // Total (malicious) score
    vm.score = 0.0;

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
            vm.biggestOffender = null;
            vm.htbase = null;
            vm.score = 0.0;
            return;
        }

        var decimalNumberRegex = /^[+-]?\d+(\.\d+)?$/g;
        vm.hateSpeech = new Array(text).map(function(txt) {
            // This is now the whole text
            var expr = txt.toLocaleLowerCase();
            console.log(txt);

            // Break it down by words and pick the last word
            var words = txt.split(/,?\s+/);

            // Pick the last word
            var word = words.pop().trim();
            var offensiveItem = null;
            if (word.length > 3) {
                console.log(word);
                offensiveItem = _.find(vm.htbase, function(item) {
                    return item.vocabulary.indexOf(word) === 0;
                });
            }
            if (offensiveItem != undefined) {
                console.log(offensiveItem);
                var x = offensiveItem.offensiveness;
                if (x.search(decimalNumberRegex) >= 0) {
                    vm.score += parseFloat(x);
                }
                console.log('your score is: ' + vm.score);
                return offensiveItem;
            }
            return null;
        });

        vm.hateSpeech = _.filter(vm.hateSpeech, function (s) {
            return s != null;
        });
    });
}]);