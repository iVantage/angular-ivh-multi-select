
/**
 * MS Filter
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectFilter', function() {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'src/views/ivh-multi-select-filter.html'
    };
  });
