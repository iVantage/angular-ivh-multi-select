
/**
 * Wrapper for ivhPaginateFilter if present
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .filter('ivhMultiSelectPaginate', ['$injector', function($injector) {
    'use strict';

    // Fall back to the identity function
    var filterFn = function(col) {
      return col;
    };

    // Use ivhPaginateFilter if we have access to it
    if($injector.has('ivhPaginateFilter')) {
      filterFn = $injector.get('ivhPaginateFilter');
    }

    return filterFn;
  }]);
