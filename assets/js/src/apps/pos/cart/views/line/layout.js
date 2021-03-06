var LayoutView = require('lib/config/layout-view');
var ItemView = require('./views/item');
var DrawerView = require('./views/drawer');
var $ = require('jquery');

/**
 * @todo Abstract ListItemView
 */

/* jshint -W071 */
$.fn.selectText = function(){
  var range, element = this[0];
  if (document.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
/* jshint +W071 */

module.exports = LayoutView.extend({

  tagName: 'li',

  className: function() { return this.model.get('type'); },

  template: function() {
    return '<div class="list-item cart-item"></div>' +
      '<div class="list-drawer cart-drawer"></div>';
  },

  regions: {
    item    : '.list-item',
    drawer  : '.list-drawer'
  },

  modelEvents: {
    'pulse': 'pulse'
  },

  onRender: function(){
    this.itemView = new ItemView({ model: this.model });

    this.listenTo(this.itemView, {
      'drawer:open'   : this.openDrawer,
      'drawer:close'  : this.closeDrawer,
      'drawer:toggle' : this.toggleDrawer,
      'item:remove'   : this.removeItem
    });

    this.getRegion('item').show(this.itemView);
  },

  openDrawer: function(){
    var view = new DrawerView({ model: this.model });
    this.getRegion('drawer').show(view);
    this.$el.addClass('drawer-open');
  },

  closeDrawer: function(){
    this.getRegion('drawer').empty();
    this.$el.removeClass('drawer-open');
  },

  toggleDrawer: function(){
    if( this.getRegion('drawer').hasView() ){
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  pulse: function() {
    var el = this.$el, type = this.model.get( 'type' );

    // @todo: do a better scrollTo for multiple pulses
    // el.scrollIntoView();

    el.addClass('pulse-in')
      .animate({backgroundColor: 'transparent'}, 500, function() {
        $(this).removeClass('pulse-in').removeAttr('style');
        if( type === 'fee' || type === 'shipping' ) {
          $('.title strong', this).focus().selectText();
        }
      });

  },

  removeItem: function(){
    var self = this;
    $.when( this.fadeOut() ).done( function(){
      self.model.destroy();
    });
  },

  fadeOut: function(){
    var item = this.getRegion('item').currentView;
    if( item ){
      return item.fadeOut();
    }
  }

});