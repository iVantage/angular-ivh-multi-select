
/**
 * Autofocus the attached element when rendered
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectAutofocus', ['$timeout', function($timeout) {
    'use strict';
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          element[0].focus();
        });
      }
    };
  }]);


