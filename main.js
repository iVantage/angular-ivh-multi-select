/*global jQuery */

/**
 * Main site scripts for IVH Mutli Select
 *
 * @copyright 2015 iVantage
 */

(function($, ng) {
'use strict';

$('.nav-tabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

var app = ng.module('demo', [
  'selectionModel',
  'ivh.pluckAndJoin',
  'ivh.pager',
  'ivh.multiSelect',
  'ivh.autoFocus'
]);

app.controller('SillyCtrl', function() {
  var self = this;

  // Time for some word association :)
  var bag = [
    'Can', 'Glasses', 'Top hat', 'Cards', 'Racquet', 'Book', 'Pumpkin',
    'Bobblehead', 'Patch', 'Pen', 'Pencil', 'Feather', 'Headphones', 'Spoon',
    'Rubberband', 'Paperclip', 'Mug', 'Stickynote', 'Tea', 'Coffee', 'Espresso',
    'Doubleshot', 'Milk', 'Sticker', 'Ink'
  ];

  var pull = function() {
    return bag[Math.floor(Math.random() * 1000) % bag.length];
  };

  self.items = [];

  for(var ix = 50; ix--;) {
    self.items.unshift({
      id: ix,
      label: pull() + ' #' + ix
    });
  }

  self.selectedIds = [];

});

}(jQuery, angular));

