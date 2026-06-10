/**
 * @file
 * Language Switcher Popup behavior.
 *
 * Displays a popup confirmation dialog before switching languages.
 * Only appears when search parameters are present in the URL.
 */

(function ($, Drupal, once) {

  'use strict';

  function showLanguageSwitchDialog(config, targetUrl) {

    var dialogContent = $('<div></div>').html('<p>' + config.message + '</p>');

    // Build the popup
    var dialog = Drupal.dialog(dialogContent[0], {
      title: 'Language Switch',
      width: 550,
      draggable: false,
      dialogClass: 'language-switcher-popup-dialog', // Custom CSS 
      buttons: [
        {
          // Confirm button
          text: config.confirm,
          class: 'button button--primary',
          click: function () {
            window.location.href = targetUrl;
          }
        },
        { 
          //Cancel Button
          text: config.cancel,
          class: 'button',
          click: function () {
            dialog.close();
          }
        }
      ],
      //remove popup when closed
      close: function (event) {
        $(event.target).remove();
      }
    });

    // Display the modal dialog
    dialog.showModal();

    // Add CSS class and style primary button
    var $dialogElement = $(dialogContent[0]).closest('.ui-dialog');
    $dialogElement.addClass('language-switcher-popup-dialog');

    // Style the Continue button (first button) with blue color using !important
    var $primaryBtn = $dialogElement.find('.ui-dialog-buttonset button:first-child');
    $primaryBtn.attr('style', 'background-color: #001228 !important; background-image: none !important; border-color: #001228 !important; color: #fff !important;');
  }

  Drupal.behaviors.languageSwitcherPopup = {
    attach: function (context, settings) {
      // Check if popup is enabled
      if (!settings.languageSwitcherPopup || !settings.languageSwitcherPopup.enabled) {
        return;
      }

      // Find language switcher links using hreflang
      // Support both standard Drupal markup and Bootstrap Barrio theme markup
      var selector = 'ul.links li a[hreflang], nav.links-inline a[hreflang]';
      var languageLinks = once('language-switcher-popup', selector, context);

      // Process each language
      languageLinks.forEach(function (link) {
        var $link = $(link);
        var targetLang = jQuery('html').attr('lang'); 
	      var switchToLang = $link.attr('hreflang');
        var targetUrl = window.location.origin + "/" + switchToLang  +  window.location.pathname.replace(targetLang + "/", "");
	      
        // Remove default language prefix from URL if present to prevent double language code in URL
        targetUrl = targetUrl.replace(settings.languageSwitcherPopup.defaultLanguage + "/", "");	
	      
        // Check language has valid config, dont show popup if not valid
        if (!targetLang || !settings.languageSwitcherPopup || !settings.languageSwitcherPopup[targetLang]) {
          return;
        }
        var config = settings.languageSwitcherPopup[targetLang];

        // Attach click handler
        $link.on('click', function (e) {
          // Always check search parameters before showing popup to prevent ajax issue
          if (!window.location.search) {
            return true;
          }

          e.preventDefault();      // Stop default link navigation
          e.stopPropagation();     // Stop event bubbling
          showLanguageSwitchDialog(config, targetUrl);
        });
      });
    }
  };

})(jQuery, Drupal, once);
