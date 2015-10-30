
/**
 * MS Tools (e.g. "Select All" button)
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectTools', function() {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'src/views/ivh-multi-select-tools.html'
    };
  });


