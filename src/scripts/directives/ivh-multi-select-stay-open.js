
/**
 * Don't close the multiselect on click
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectStayOpen', function() {
    'use strict';
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        /**
         * Clicks on this element should not cause the multi-select to close
         */
        element.on('click', function($event) {
          var evt = $event.originalEvent || $event;
          evt.ivhMultiSelectIgnore = true;
        });
      }
    };
  });

