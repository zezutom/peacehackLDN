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
        console.log('successfully loaded ethnicity hatebase');
        $http.get('resources/hatebase_nationality.json').success(function(data) {
            console.log('successfully loaded nationality hatebase');
            vm.htbase = vm.htbase.concat(data.data.datapoint);
        }).error(function(data) {
            console.log('error getting nationality data from hatebase')
        });
    }).error(function (data) {
        console.log('error getting ethnicity data from hatebase');
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
            vm.score = 0;
            vm.showIncentive = false;
            vm.scoreRange = [];
            return;
        }

        var findOffenders = function(phrase) {
            // Remove (all!) white chars from the word, this is just a quick hack
            // credit: http://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
            var phrase = phrase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").trim();

            var offenders = [];
            var lastOffender = null;

            var maxIndex = -1;
            if (phrase.length > 3) {
                console.log("'" + phrase + "'");
                // Does my phrase contain offensive words? Find the last offensive item.
                for (var i = 0; i < vm.htbase.length; i++) {
                    var item = vm.htbase[i];
                    var vocab = item.vocabulary;
                    if (phrase.includes(vocab)) {
                        var index = phrase.indexOf(vocab);
                        if (index > maxIndex) {
                            lastOffender = vocab;
                            maxIndex = index;
                        }

                        offenders.push(item);
                    }
                }
            }
            console.log(offenders)
            console.log('last offender: ' + lastOffender);
            return {
                offenders: offenders,
                lastOffender: lastOffender
            };
        };

        var foundOffenders = findOffenders(text);
        vm.hateSpeech = _.map(foundOffenders.offenders, function (itm) {
            return itm;
        });
        console.log('total words: ' + vm.hateSpeech.length);

        vm.hateWord = _.find(vm.hateSpeech, function (itm) {
            return itm.vocabulary === foundOffenders.lastOffender;
        });
        console.log(foundOffenders.lastOffender);
        console.log(vm.hateWord);

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

        console.log('db size: ' + vm.htbase.length);
        console.log('total score: ' + vm.score);
        console.log('score range: ' + vm.scoreRange);
    });
}]);