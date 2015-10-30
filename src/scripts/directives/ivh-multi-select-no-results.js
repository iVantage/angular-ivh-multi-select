
/**
 * Displays a "no results" message
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectNoResults', function() {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'src/views/ivh-multi-select-no-results.html'
    };
  });

