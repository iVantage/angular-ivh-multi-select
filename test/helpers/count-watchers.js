
/**
 * Count the number of watchers under a given element
 * 
 * @see http://stackoverflow.com/questions/18499909/how-to-count-total-number-of-watches-on-a-page
 * @param {Angular.Element} $el The element to count watchers for
 * @return {Integer} The watcher count
 */
var countWacthers = function ($el) {
  var watchers = [];

  var f = function (element) {
    angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
      if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
        angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
          watchers.push(watcher);
        });
      }
    });

    angular.forEach(element.children(), function (childElement) {
      f(angular.element(childElement));
    });
  };

  f($el);

  // Remove duplicate watchers
  var watchersWithoutDuplicates = [];
  angular.forEach(watchers, function(item) {
    if(watchersWithoutDuplicates.indexOf(item) < 0) {
      watchersWithoutDuplicates.push(item);
    }
  });

  return watchersWithoutDuplicates.length;
}
