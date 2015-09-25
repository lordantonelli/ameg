/*
 Copyright © 2013 Adobe Systems Incorporated.

 Licensed under the Apache License, Version 2.0 (the “License”);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an “AS IS” BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>.
 * @name jquery
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>
 * @name fn
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jquery
 */

/**
 * @fileOverview accessibleMenu plugin
 *
 *<p>Licensed under the Apache License, Version 2.0 (the “License”)
 *<br />Copyright © 2013 Adobe Systems Incorporated.
 *<br />Project page <a href="https://github.com/adobe-accessibility/Accessible-Mega-Menu">https://github.com/adobe-accessibility/Accessible-Mega-Menu</a>
 * @version 0.1
 * @author Michael Jordan
 * @requires jquery
 */

/*jslint browser: true, devel: true, plusplus: true, nomen: true */
/*global jQuery */
(function ($, window, document) {
    "use strict";
    var pluginName = "accessibleMenu",
        defaults = {
            uuidPrefix: "accessible-menu",
            // unique ID's are required to indicate aria-owns, aria-controls and aria-labelledby
            menuClass: "nav-menu",
            // default css class used to define the megamenu styling
            topNavItemClass: "nav-item",
            // default css class for a top-level navigation item in the megamenu
            panelClass: "sub-nav",
            // default css class for a megamenu panel
            panelGroupClass: "sub-nav-group",
            // default css class for a group of items within a megamenu panel
            hoverClass: "hover",
            // default css class for the hover state
            focusClass: "focus",
            // default css class for the focus state
            openClass: "open",
			// default css class for the open state
			typeMenu: "dropdown"
			// default menu type for the keyboard action
			
        },
        Keyboard = {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            keyMap: {
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                96: "0",
                97: "1",
                98: "2",
                99: "3",
                100: "4",
                101: "5",
                102: "6",
                103: "7",
                104: "8",
                105: "9",
                190: "."
            }
        };

    /**
     * @desc Creates a new accessible mega menu instance.
     * @param {jquery} element
     * @param {object} [options] Mega Menu options
     * @param {string} [options.uuidPrefix=accessible-megamenu] - Prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby
     * @param {string} [options.menuClass=accessible-megamenu] - CSS class used to define the megamenu styling
     * @param {string} [options.topNavItemClass=accessible-megamenu-top-nav-item] - CSS class for a top-level navigation item in the megamenu
     * @param {string} [options.panelClass=accessible-megamenu-panel] - CSS class for a megamenu panel
     * @param {string} [options.panelGroupClass=accessible-megamenu-panel-group] - CSS class for a group of items within a megamenu panel
     * @param {string} [options.hoverClass=hover] - CSS class for the hover state
     * @param {string} [options.focusClass=focus] - CSS class for the focus state
     * @param {string} [options.openClass=open] - CSS class for the open state
     * @constructor
     */
    function AccessibleMenu(element, options) {
        this.element = element;

        // merge optional settings and defaults into settings
        this.settings = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    AccessibleMenu.prototype = (function () {

        /* private attributes and methods ------------------------ */
        var uuid = 0,
            keydownTimeoutDuration = 1000,
            keydownSearchString = "",
            isTouch = !!window.hasOwnProperty("ontouchstart"),
            _getPlugin,
            _togglePanel,
            _clickHandler,
            _clickOutsideHandler,
            _DOMAttrModifiedHandler,
            _focusInHandler,
            _focusOutHandler,
            _keyDownHandler,
            _mouseDownHandler,
            _mouseOverHandler,
            _mouseOutHandler,
            _toggleExpandedEventHandlers;

        /**
         * @name jQuery.fn.accessibleMenu~_getPlugin
         * @desc Returns the parent accessibleMenu instance for a given element
         * @param {jQuery} element
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _getPlugin = function (element) {
            return $(element).closest(':data(plugin_' + pluginName + ')').data("plugin_" + pluginName);
        };

        
        /**
         * @name jQuery.fn.accessibleMenu~_togglePanel
         * @desc Toggle the display of mega menu panels in response to an event.
         * The optional boolean value 'hide' forces all panels to hide.
         * @param {event} event
         * @param {Boolean} [hide] Hide all mega menu panels when true
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _togglePanel = function (event, hide) {
            var target = $(event.target),
                that = this,
                settings = this.settings,
                menu = this.menu,
                topli = target.closest('.' + settings.topNavItemClass),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                newfocus;

            _toggleExpandedEventHandlers.call(this, hide);
            $('html').off('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu, pointerup.outside-accessible-megamenu', _clickOutsideHandler);
            menu.find('[aria-expanded].' + this.settings.panelClass).off('DOMAttrModified.accessible-megamenu');

            if (hide) {
				topli = menu.find('.' + settings.topNavItemClass + '.' + settings.openClass + ':last').closest('.' + settings.topNavItemClass + '.' + settings.openClass);
				//console.log('topli:');
				//console.log(menu);
				//console.log(menu.find('.' + settings.topNavItemClass + '.' + settings.openClass));
				//console.log(menu.find('.' + settings.topNavItemClass + '.' + settings.openClass + ':last'));
				//console.log('remove hide');
				//console.log(event.relatedTarget);
				if (!(topli.is(event.relatedTarget) || topli.has(event.relatedTarget).length > 0)) {
                    
					if ((event.type === 'mouseout' || event.type === 'focusout') && topli.has(document.activeElement).length > 0) {
						console.log(event.type);
						//topli = menu.find('.' + settings.topNavItemClass + '.' + settings.openClass + ':last').closest('.' + settings.topNavItemClass);
						topli = menu.find('.' + settings.topNavItemClass).filter('.hover').siblings();
						console.log(menu.find('.' + settings.topNavItemClass).filter('.hover').siblings());
						if(menu.find('.' + settings.topNavItemClass).filter('.hover').length === 0){
							topli = menu.find('.' + settings.topNavItemClass);
						}
						topli
							.removeClass(this.settings.focusClass)
							.has('[aria-expanded]').attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.find('[aria-expanded]')
							.attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.filter('.' + settings.panelClass)
							.attr('aria-hidden', 'true')
							.find('[tabindex]')
							.attr('tabindex', -1);
						return;
                    }
					
					topli.has('[aria-expanded]')
							.attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.find('[aria-expanded]')
							.attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.filter('.' + settings.panelClass)
							.attr('aria-hidden', 'true')
							.find('[tabindex]')
							.attr('tabindex', -1);
						//teste
						//console.log('remove 1:');
						//console.log(topli);
						//console.log(topli.has('[aria-expanded]'));
						//topli.removeClass(settings.openClass);
					
					/*					
                    if (event.type === 'mouseout') {
						topli = menu.find('.' + settings.topNavItemClass + '.' + settings.openClass + ':first').closest('.' + settings.topNavItemClass);
						topli.has('[aria-expanded]').attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.find('[aria-expanded]')
							.attr('aria-expanded', 'false')
							.removeClass(settings.openClass)
							.filter('.' + settings.panelClass)
							.attr('aria-hidden', 'true')
							.find('[tabindex]')
							.attr('tabindex', -1);
						
						//teste
						//console.log('remove 1 mouse:');
						//console.log(topli.find('[aria-expanded]'));	
					}
					*/
					
                    if ((event.type === 'keydown' && (event.keyCode === Keyboard.ESCAPE || event.keyCode === Keyboard.LEFT)) || event.type === 'DOMAttrModified') {
						newfocus = topli.find(':tabbable:first');
						console.log(newfocus);
                        //setTimeout(function () {
                            menu.find('[aria-expanded].' + that.settings.panelClass).off('DOMAttrModified.accessible-megamenu');
                            newfocus.focus();
                            that.justFocused = false;
                        //}, 99);
                    }
                } else if (topli.length === 0) {
                    menu.find('[aria-expanded=true]')
                        .attr('aria-expanded', 'false')
                        .removeClass(settings.openClass)
                        .filter('.' + settings.panelClass)
                        .attr('aria-hidden', 'true');
					//teste
					console.log('remove 2:');
					//console.log(menu);
					menu.removeClass(settings.openClass);
                }
            } else {
                clearTimeout(that.focusTimeoutID);
                /*
				topli.siblings()
                    .find('[aria-expanded]')
                    .attr('aria-expanded', 'false')
                    .removeClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'true');
				*/
				
				topli.siblings()
					.removeClass(settings.openClass)
					.has('[aria-expanded]')
					.attr('aria-expanded', 'false')
                    .find('[aria-expanded]')
                    .attr('aria-expanded', 'false')
                    .removeClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'true')
					.find('[tabindex]')
					.attr('tabindex', -1);
				//teste
				//console.log('remove 3:');
				//console.log(topli.siblings());
				//topli.siblings().removeClass(settings.openClass);
				
                /*
				topli.find('[aria-expanded]')
                    .attr('aria-expanded', 'true')
                    .addClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'false');
				*/
				topli.attr('aria-expanded', 'true')
                    .addClass(settings.openClass)
                    .children('.' + settings.panelClass)
                    .attr('aria-hidden', 'false')
					.attr('aria-expanded', 'true')
					.children('.' + settings.topNavItemClass)
					.children('[tabindex]')
					.attr('tabindex', 0);
				//teste
				//console.log('add 1:');
				//console.log(topli.children('.' + settings.panelClass).find('[tabindex]:visible'));
				//console.log(topli.children('.' + settings.panelClass).children());
                
				if (event.type === 'mouseover' && target.is(':tabbable') && topli.length === 1 && panel.length === 0 && menu.has(document.activeElement).length > 0) {
                    target.focus();
                    that.justFocused = false;
                }

                _toggleExpandedEventHandlers.call(that);
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_clickHandler
         * @desc Handle click event on mega menu item
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _clickHandler = function (event) {
            var target = $(event.target),
                topli = target.closest('.' + this.settings.topNavItemClass);	
			//console.log(target);
			//console.log(event);
            if (topli.length === 1
                && topli.find('.' + this.settings.panelClass + ':first').length === 1) {
				//console.log('espace');
                if (!topli.hasClass(this.settings.openClass)) {
				    //console.log('espace close');
                    event.preventDefault();
                    event.stopPropagation();
                    _togglePanel.call(this, event);
					//topli.find('.' + this.settings.panelClass + ' :tabbable:first').focus();
                } else {
					//event.preventDefault();
                    /*if (this.justFocused) {
						console.log('espace open focus');
                        event.preventDefault();
                        event.stopPropagation();
                        this.justFocused = false;
                    } else */if (isTouch) {
						//console.log('espace open touch');
                        event.preventDefault();
                        event.stopPropagation();
                        _togglePanel.call(this, event, topli.hasClass(this.settings.openClass));
                    }
					//console.log(event);
                }
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_clickOutsideHandler
         * @desc Handle click event outside of a the megamenu
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _clickOutsideHandler = function (event) {
            if (this.menu.has($(event.target)).length === 0) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_DOMAttrModifiedHandler
         * @desc Handle DOMAttrModified event on panel to respond to Windows 8 Narrator ExpandCollapse pattern
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _DOMAttrModifiedHandler = function (event) {
            if (event.originalEvent.attrName === 'aria-expanded'
                && event.originalEvent.newValue === 'false'
                && $(event.target).closest('.' + this.settings.topNavItemClass).hasClass(this.settings.openClass)) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_focusInHandler
         * @desc Handle focusin event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _focusInHandler = function (event) {
			//console.log('focus in');
            clearTimeout(this.focusTimeoutID);
			//alterado
			$(event.target).closest('.' + this.settings.topNavItemClass)
                .addClass(this.settings.focusClass)
			//===
            $(event.target).on('click.accessible-megamenu', _clickHandler.bind(this));
            this.justFocused = true;
            if (this.panels.filter('.' + this.settings.openClass).length) {
				//_togglePanel.call(this, event);
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_focusOutHandler
         * @desc Handle focusout event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _focusOutHandler = function (event) {
			//console.log('focus out');
            this.justFocused = false;
            var that = this,
                target = $(event.target),
                topli = target.closest('.' + this.settings.topNavItemClass),
                keepOpen = false;
			
			// alterado
			topli.removeClass(this.settings.focusClass);
			//======
            target.off('click.accessible-megamenu', _clickHandler);

            if (window.cvox) {
                // If ChromeVox is running...
                that.focusTimeoutID = setTimeout(function () {
                    window.cvox.Api.getCurrentNode(function (node) {
                        if (topli.has(node).length) {
                            // and the current node being voiced is in
                            // the mega menu, clearTimeout, 
                            // so the panel stays open.
                            clearTimeout(that.focusTimeoutID);
                        } else {
                            that.focusTimeoutID = setTimeout(function (scope, event, hide) {
                                //_togglePanel.call(scope, event, hide);
                            }, 275, that, event, true);
                        }
                    });
                }, 25);
            } else {
                that.focusTimeoutID = setTimeout(function () {
                    //_togglePanel.call(that, event, true);
                }, 300);
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_keyDownHandler
         * @desc Handle keydown event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _keyDownHandler = function (event) {
            var target = $($(this).is('.hover:tabbable') ? this : event.target),
                that = target.is(event.target) ? this : _getPlugin(target),
                settings = that.settings,
                menu = that.menu,
                topnavitems = that.topnavitems,
                topli = target.closest('.' + settings.topNavItemClass),
                tabbables = menu.find(':tabbable'),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                panelGroups = panel.find('.' + settings.panelGroupClass),
                currentPanelGroup = target.closest('.' + settings.panelGroupClass),
                next,
                keycode = event.keyCode || event.which,
                start,
                i,
                o,
                label,
                found = false,
                newString = Keyboard.keyMap[event.keyCode] || '',
                regex,
                isTopNavItem = (topli.length === 1 && panel.length === 0);
            if (target.is('.hover:tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }
            switch (keycode) {
                case Keyboard.ESCAPE:
                    _togglePanel.call(that, event, true);
                    break;
                case Keyboard.DOWN:
                    event.preventDefault();
					//console.log(settings.typeMenu === 'dropdown');
					//console.log(isTopNavItem);
					//console.log(topli.children('.' + settings.panelClass));
					
					if (isTopNavItem){
						if(settings.typeMenu === 'dropdown'){
							if(topli.children('.' + settings.panelClass).length === 1){
								_togglePanel.call(that, event);
								found = (topli.find('.' + settings.panelClass + ' :tabbable:first').focus().length === 1);
							}else
								break;
						}else{
							tabbables = menu.find(':tabbable');
						}
					} else {
						tabbables = currentPanelGroup.find(':tabbable');
					}
                    
					//console.log('donw:')
					//console.log(tabbables);
					//console.log();
					//console.log(tabbables.filter(':gt(' + tabbables.index(target) + ')'));
					//console.log(tabbables.filter(':gt(' + tabbables.index(target) + '):first'));
					
					if(tabbables.length == tabbables.index(target)+1)
						found = (tabbables.filter(':lt(' + tabbables.index(target) + '):first').focus().length === 1);
					else
						found = (tabbables.filter(':gt(' + tabbables.index(target) + '):first').focus().length === 1);
                    

                    if (!found && window.opera && opera.toString() === "[object Opera]" && (event.ctrlKey || event.metaKey)) {
						tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                    }
                    break;
                case Keyboard.UP:
                    event.preventDefault();
                    
					/*
					if (isTopNavItem && target.hasClass(settings.openClass)) {
                        /*_togglePanel.call(that, event, true);
                        next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
                        if (next.children('.' + settings.panelClass).length) {
							next.addClass(settings.openClass);
                            found = (next.children()
                                .attr('aria-expanded', 'true')
                                .addClass(settings.openClass)
                                .filter('.' + settings.panelClass)
                                .attr('aria-hidden', 'false')
                                .find(':tabbable:last')
                                .focus() === 1);
                        } * /
                    } else if (!isTopNavItem) {
						tabbables = currentPanelGroup.find(':tabbable');
						//console.log('up:')
						//console.log(tabbables);
						//console.log(tabbables.index(target));
						//console.log(tabbables.filter(':lt(' + tabbables.index(target) + ')'));
						//console.log(tabbables.filter(':lt(' + tabbables.index(target) + '):last'));
						
						if(tabbables.index(target) === 0)
							found = (tabbables.filter(':gt(' + tabbables.index(target) + '):last').focus().length === 1);
						else
							found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);
                    }
					*/
					if(isTopNavItem){
						if(settings.typeMenu === 'dropdown')
							break
						else 
							tabbables = menu.find(':tabbable');
					} else {
						tabbables = currentPanelGroup.find(':tabbable');
					}
					
					//console.log('up:')
					//console.log(tabbables);
					//console.log(tabbables.index(target));
					//console.log(tabbables.filter(':lt(' + tabbables.index(target) + ')'));
					//console.log(tabbables.filter(':lt(' + tabbables.index(target) + '):last'));
					
					if(tabbables.index(target) === 0)
						found = (tabbables.filter(':gt(' + tabbables.index(target) + '):last').focus().length === 1);
					else
						found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);

                    if (!found && window.opera && opera.toString() === "[object Opera]" && (event.ctrlKey || event.metaKey)) {
                        tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                    }
                    break;
                case Keyboard.RIGHT:
                    event.preventDefault();
					//console.log(topnavitems.filter(':gt(' + topnavitems.index(topli) + '):first').filter(':tabbable:first'));
					console.log('right');
					if (isTopNavItem) {
						if(settings.typeMenu === 'dropdown'){
							if(topnavitems.length === (topnavitems.index(topli) + 1))
								found = (topnavitems.filter(':lt(' + topnavitems.index(topli) + '):first').find(':tabbable:first').focus().length === 1);
							else
								found = (topnavitems.filter(':gt(' + topnavitems.index(topli) + '):first').find(':tabbable:first').focus().length === 1);
							break;
						}
						console.log('right1');
                    }
					if(topli.find('.' + settings.panelClass + ':first').length === 1){
						_togglePanel.call(that, event);
						found = (topli.find('.' + settings.panelClass + ' :tabbable:first').focus().length === 1);
						console.log('right2');
					}
					
                    break;
                case Keyboard.LEFT:
                    event.preventDefault();
					console.log(settings.typeMenu);
                    if (isTopNavItem) {
						if(settings.typeMenu === 'dropdown'){
							if(topnavitems.index(topli) === 0)
								found = (topnavitems.filter(':gt(' + topnavitems.index(topli) + '):last').find(':tabbable:first').focus().length === 1);
							else
								found = (topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last').find(':tabbable:first').focus().length === 1);
						}
                    } else {
						_togglePanel.call(that, event, true);
						  //found = (topli.find('.' + settings.panelClass + ' :tabbable:last').focus().length === 1);
						  //found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);
						//found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);
					}
                    break;
                case Keyboard.TAB:
                    i = tabbables.index(target);
                    if (event.shiftKey && isTopNavItem && target.hasClass(settings.openClass)) {
                        _togglePanel(event, true);
                        next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
						if (next.children('.' + settings.panelClass).length) {
							// alterado
							next.addClass(settings.openClass);
							//=======
                            found = next.children()
                                .attr('aria-expanded', 'true')
                                .addClass(settings.openClass)
                                .filter('.' + settings.panelClass)
                                .attr('aria-hidden', 'false')
                                .find(':tabbable:last')
                                .focus();
                        }
                    } else if (event.shiftKey && i > 0) {
                        found = (tabbables.filter(':lt(' + i + '):last').focus().length === 1);
                    } else if (!event.shiftKey && i < tabbables.length - 1) {
                        found = (tabbables.filter(':gt(' + i + '):first').focus().length === 1);
                    } else if (window.opera && opera.toString() === "[object Opera]") {
                        tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        if (event.shiftKey) {
                            found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):last').focus().length === 1);
                        } else {
                            found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                        }
                    }

                    if (found) {
                        event.preventDefault();
                    }
                    break;
                case Keyboard.SPACE:
                    //if (isTopNavItem) {
                        event.preventDefault();
                        _clickHandler.call(that, event);
                    //}
                    break;
                default:
                    // alphanumeric filter
                    clearTimeout(this.keydownTimeoutID);
                    keydownSearchString += newString !== keydownSearchString ? newString : '';

                    if (keydownSearchString.length === 0) {
                        return;
                    }

                    this.keydownTimeoutID = setTimeout(function () {
                        keydownSearchString = '';
                    }, keydownTimeoutDuration);

                    if (isTopNavItem && !target.hasClass(settings.openClass)) {
                        tabbables = tabbables.filter('.' + settings.topNavItemClass + ' > :tabbable');
                    } else {
                        tabbables = topli.find(':tabbable');
                    }

                    if (event.shiftKey) {
                        tabbables = $(tabbables.get()
                            .reverse());
                    }

                    for (i = 0; i < tabbables.length; i++) {
                        o = tabbables.eq(i);
                        if (o.is(target)) {
                            start = (keydownSearchString.length === 1) ? i + 1 : i;
                            break;
                        }
                    }

                    regex = new RegExp('^' + keydownSearchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'), 'i');

                    for (i = start; i < tabbables.length; i++) {
                        o = tabbables.eq(i);
                        label = $.trim(o.text());
                        if (regex.test(label)) {
                            found = true;
                            o.focus();
                            break;
                        }
                    }
                    if (!found) {
                        for (i = 0; i < start; i++) {
                            o = tabbables.eq(i);
                            label = $.trim(o.text());
                            if (regex.test(label)) {
                                o.focus();
                                break;
                            }
                        }
                    }
                    break;
            }
            that.justFocused = false;
        };

        /**
         * @name jQuery.fn.accessibleMenu~_mouseDownHandler
         * @desc Handle mousedown event on mega menu.
         * @param {event} Event object
         * @memberof accessibleMenu
         * @inner
         * @private
         */
        _mouseDownHandler = function (event) {
            this.mouseTimeoutID = setTimeout(function () {
                clearTimeout(this.focusTimeoutID);
            }, 1);
        };

        /**
         * @name jQuery.fn.accessibleMenu~_mouseOverHandler
         * @desc Handle mouseover event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _mouseOverHandler = function (event) {
			//clearTimeout(this.mouseTimeoutID);
            $(event.target).closest('.' + this.settings.topNavItemClass).addClass(this.settings.hoverClass);
			//_togglePanel.call(this, event, true);
            if ($(event.target).is(':tabbable')) {
                $('html').on('keydown.accessible-megamenu', _keyDownHandler.bind(event.target));
            }
        };

        /**
         * @name jQuery.fn.accessibleMenu~_mouseOutHandler
         * @desc Handle mouseout event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMenu
         * @inner
         * @private
         */
        _mouseOutHandler = function (event) {
            var that = this;
            $(event.target).closest('.' + that.settings.topNavItemClass).removeClass(that.settings.hoverClass);
			//_togglePanel.call(that, event, true);
			that.mouseTimeoutID = setTimeout(function () {
				//console.log('remove mouse out');
                _togglePanel.call(that, event, true);
            }, 250);
            if ($(event.target).is(':tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }
        };

        _toggleExpandedEventHandlers = function (hide) {
            var menu = this.menu;
            if (hide) {
                $('html').off('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu', _clickOutsideHandler);

                menu.find('[aria-expanded].' + this.settings.panelClass).off('DOMAttrModified.accessible-megamenu', _DOMAttrModifiedHandler);
            } else {
                $('html').on('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu', _clickOutsideHandler.bind(this));

                /* Narrator in Windows 8 automatically toggles the aria-expanded property on double tap or click. 
                 To respond to the change to collapse the panel, we must add a listener for a DOMAttrModified event. */
                menu.find('[aria-expanded=true].' + this.settings.panelClass).on('DOMAttrModified.accessible-megamenu', _DOMAttrModifiedHandler.bind(this));
            }
        };

        /* public attributes and methods ------------------------- */
        return {
            constructor: AccessibleMenu,

            /**
             * @lends jQuery.fn.accessibleMenu
             * @desc Initializes an instance of the accessibleMenu plugins
             * @memberof jQuery.fn.accessibleMenu
             * @instance
             */
            init: function () {
                var that = this,
                    settings = this.settings,
                    justFocused = this.justFocused = false,
                    nav = this.nav = $(this.element),
                    menu = this.menu = nav.children().first(),
                    topnavitems = this.topnavitems = menu.children();

                this.panels = menu.find("." + settings.panelClass);

                menu.on("focusin.accessible-megamenu", ":tabbable, :focusable, ." + settings.panelClass, _focusInHandler.bind(this))
                    .on("focusout.accessible-megamenu", ":tabbable, :focusable, ." + settings.panelClass, _focusOutHandler.bind(this))
                    .on("keydown.accessible-megamenu", _keyDownHandler.bind(this))
                    .on("mouseover.accessible-megamenu", _mouseOverHandler.bind(this))
                    .on("mouseout.accessible-megamenu", _mouseOutHandler.bind(this))
                    .on("mousedown.accessible-megamenu", _mouseDownHandler.bind(this));

                if (isTouch) {
                    menu.on("touchstart.accessible-megamenu", _clickHandler.bind(this));
                }

                menu.find("hr").attr("role", "separator");
            },

            /**
             * @desc Get default values
             * @example $(selector).accessibleMenu("getDefaults");
             * @return {object}
             * @memberof jQuery.fn.accessibleMenu
             * @instance
             */
            getDefaults: function () {
                return this._defaults;
            },

            /**
             * @desc Get any option set to plugin using its name (as string)
             * @example $(selector).accessibleMenu("getOption", some_option);
             * @param {string} opt
             * @return {string}
             * @memberof jQuery.fn.accessibleMenu
             * @instance
             */
            getOption: function (opt) {
                return this.settings[opt];
            },

            /**
             * @desc Get all options
             * @example $(selector).accessibleMenu("getAllOptions");
             * @return {object}
             * @memberof jQuery.fn.accessibleMenu
             * @instance
             */
            getAllOptions: function () {
                return this.settings;
            },

            /**
             * @desc Set option
             * @example $(selector).accessibleMenu("setOption", "option_name",  "option_value",  reinitialize);
             * @param {string} opt - Option name
             * @param {string} val - Option value
             * @param {boolean} [reinitialize] - boolean to re-initialize the menu.
             * @memberof jQuery.fn.accessibleMenu
             * @instance
             */
            setOption: function (opt, value, reinitialize) {
                this.settings[opt] = value;
                if (reinitialize) {
                    this.init();
                }
            }
        };
    }());

    /*
     * @param {object} [options] Mega Menu options
     * @param {string} [options.uuidPrefix=accessible-megamenu] - Prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby
     * @param {string} [options.menuClass=accessible-megamenu] - CSS class used to define the megamenu styling
     * @param {string} [options.topNavItemClass=accessible-megamenu-top-nav-item] - CSS class for a top-level navigation item in the megamenu
     * @param {string} [options.panelClass=accessible-megamenu-panel] - CSS class for a megamenu panel
     * @param {string} [options.panelGroupClass=accessible-megamenu-panel-group] - CSS class for a group of items within a megamenu panel
     * @param {string} [options.hoverClass=hover] - CSS class for the hover state
     * @param {string} [options.focusClass=focus] - CSS class for the focus state
     * @param {string} [options.openClass=open] - CSS class for the open state
     */
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new AccessibleMenu(this, options));
            }
        });
    };

    /* :focusable and :tabbable selectors from 
     https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js */

    /**
     * @private
     */
    function visible(element) {
        return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
            return $.css(this, "visibility") === "hidden";
        }).length;
    }

    /**
     * @private
     */
    function focusable(element, isTabIndexNotNaN) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled :
            "a" === nodeName ?
            element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
            // the element and all of its ancestors must be visible
        visible(element);
    }

    $.extend($.expr[":"], {
        data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
            return function (elem) {
                return !!$.data(elem, dataName);
            };
        }) : // support: jQuery <1.8
            function (elem, i, match) {
                return !!$.data(elem, match[3]);
            },

        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },

        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
}(jQuery, window, document));

