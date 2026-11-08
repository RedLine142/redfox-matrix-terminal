/* OUT CODE / REDFOX — GAME MECHANICS
 * Port of the supplied RedFox task mechanics.
 * Runs only on individual task pages: /play/safari/<task-id>
 * Requires the jQuery already provided by the RedFox page.
 */
(function (window, document) {
  'use strict';

  var TASK_PATH = /^\/play\/safari\/\d+\/?$/i;
  var STYLE_ID = 'outcode-game-mechanics-style';

  function addStyle(css) {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function createOlymp($, size, reverse) {
    var count = Number(size);
    if (![8, 16, 32].includes(count)) return;

    var groups = [];
    for (var groupSize = 1; groupSize <= count; groupSize *= 2) {
      groups.push(groupSize);
    }
    if (reverse) groups.reverse();

    var html = '<table class="olymp"><tbody>';
    for (var row = 0; row < count; row++) {
      html += '<tr>';
      groups.forEach(function (groupSize) {
        if (row % groupSize !== 0) return;
        var sector;
        if (groupSize === 1) {
          sector = row + 1;
        } else {
          var offset = count - (2 * count / groupSize);
          sector = count + offset + Math.floor(row / groupSize) + 1;
        }
        html += '<td id="olymp' + sector + '" rowspan="' + groupSize + '">Sector ' + sector + '</td>';
      });
      html += '</tr>';
    }
    html += '</tbody></table>';

    var $target = $('.task_text').find('.oPos').first();
    if ($target.length) $target.append(html);
    else $('.task_text').append(html);
  }

  function run($) {
    if (!TASK_PATH.test(window.location.pathname)) return;
    if (!$('.task_text').length) return;

    // Transfer styles embedded in the task description into the document head.
    $('.task_text').find('.style').each(function () {
      var css = $(this).html();
      if (css) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
      }
    });
    $('.style').css('display', 'none');

    addStyle(
      '.nobr br{display:none;}' +
      '.olymp{border-collapse:collapse;max-width:100%;}' +
      '.olymp img{width:100%;max-width:100%;height:auto;}' +
      '.olymp td{border:1px solid white;width:125px;min-width:70px;text-align:center;vertical-align:middle;padding:6px;}' +
      '.olymp .up,.olymp td.up{color:#0F0;font-weight:bold;}'
    );

    // Hide task-control markers and apply their effects to matching elements.
    if ($('.code').find('.sTask, .aTask, .rTask').length) {
      $('.sTask, .aTask, .rTask').css('display', 'none');
      $('.code').each(function () {
        var $code = $(this);
        if ($code.find('.sTask').length) {
          $(document).find('#s' + $code.find('.sTask').text()).css('opacity', '0.1');
        }
        if ($code.find('.aTask').length) {
          var separator = $code.html().indexOf('<');
          $(document).find('#a' + $code.find('.aTask').text())
            .text($code.text().substr(0, separator));
        }
        if ($code.find('.rTask').length) {
          var splitAt = $code.text().indexOf(' ');
          $(document).find('#r' + $code.find('.rTask').text())
            .html($code.find('.rTask').html().substr(splitAt + 1));
        }
      });
    }

    // Hide multiple elements referenced by pTask.
    if ($('.code').find('.pTask').length) {
      $('.pTask').css('display', 'none');
      $('.code').each(function () {
        var $marker = $(this).find('.pTask');
        if (!$marker.length) return;
        var ids = $marker.text().split(/\s+/);
        ids.forEach(function (id) {
          if (id) $(document).find('#p' + id).css('opacity', '0.1');
        });
      });
    }

    // Build 8/16/32-sector tournament brackets, including mirrored layouts.
    var $olympInit = $('body').find('.oTaskInit').first();
    if ($olympInit.length) {
      $('.task_text').addClass('nobr');
      var olympSize = $olympInit.text().trim().toLowerCase();
      var reverse = olympSize.charAt(0) === 'r';
      if (reverse) olympSize = olympSize.slice(1);
      createOlymp($, olympSize, reverse);

      $('.oTaskInit, .oTask, .oTasks').css('display', 'none');

      $('.code').each(function () {
        var $code = $(this);
        var $task = $code.find('.oTask');
        if (!$task.length) return;
        var separator = $code.text().indexOf(' ');
        var value = $code.text().substr(0, separator - 1);
        var sectorId = $task.text().trim();
        $('#olymp' + sectorId).text(value).addClass('up');
      });
    }

    // Populate bracket cells from an optional list of sector contents.
    if ($('.task_text').find('.oTasks').length) {
      $('.oTasks').find('li').each(function () {
        $('#olymp' + $(this).attr('id')).html($(this).html());
      });
    }

    // Image slider.
    if ($('.task_text').find('.slider-container').length) {
      var slides = Array.from($('.slider').find('img'));
      var slideCount = slides.length;
      var slideIndex = 0;

      function updateSlider() {
        slides.forEach(function (slide, index) {
          slide.style.display = index === slideIndex ? 'block' : 'none';
        });
      }

      $('.prev-button').on('click.outCodeMechanics', function () {
        if (!slideCount) return;
        slideIndex = (slideIndex - 1 + slideCount) % slideCount;
        updateSlider();
      });
      $('.next-button').on('click.outCodeMechanics', function () {
        if (!slideCount) return;
        slideIndex = (slideIndex + 1) % slideCount;
        updateSlider();
      });
      updateSlider();
    }

    // Convert space-separated decimal Unicode values into emoji characters.
    if ($('.task_text').find('.emoji').length) {
      $('.task_text').find('.emoji').each(function () {
        var codes = $(this).text().trim().split(/\s+/);
        var result = '';
        codes.forEach(function (code) {
          var point = Number(code);
          if (Number.isInteger(point) && point >= 0 && point <= 0x10FFFF) {
            try { result += String.fromCodePoint(point); } catch (error) {}
          }
        });
        $(this).text(result);
      });
    }

    // Pick one random item from randList and place it into .rand.
    if ($('.task_text').find('.randList').length) {
      $('.randList').css('display', 'none');
      var choices = [];
      $('.randList li').each(function () {
        choices.push($(this).html());
      });
      if (choices.length) {
        var randomIndex = Math.floor(Math.random() * choices.length);
        $('.rand').html(choices[randomIndex]);
      }
    }

    if ($('.task_text').find('.nobr').length) {
      $('.task_text').addClass('nobr');
    }

    // Force the task tab to be active when noCodesTab is present.
    if ($('.task_text').find('.noCodesTab').length) {
      $('.tab').removeClass('active');
      $('#task').addClass('active');
      $('.tabcontent').removeClass('active');
      $('.task').addClass('active');
    }

    // Responsive image maps, when the RedFox page has the plugin loaded.
    if ($('.task_text').find('map').length &&
        $('img[usemap]').length &&
        $.fn && typeof $.fn.rwdImageMaps === 'function') {
      $('img[usemap]').rwdImageMaps();
    }
  }

  function start() {
    if (!TASK_PATH.test(window.location.pathname)) return;
    if (!window.jQuery) {
      if (window.console && console.warn) {
        console.warn('OUT CODE game mechanics: jQuery was not found on this page.');
      }
      return;
    }
    window.jQuery(function () {
      run(window.jQuery);
    });
  }

  start();
})(window, document);
