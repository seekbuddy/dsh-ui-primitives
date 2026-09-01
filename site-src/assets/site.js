(function () {
  'use strict';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('dsh-ui-kit-theme', theme);
    } catch (err) {
      // Ignore storage failures (private mode etc).
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '浅色' : '深色';
    }
  }

  function initialTheme() {
    try {
      var saved = localStorage.getItem('dsh-ui-kit-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (err) {
      // Ignore.
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(initialTheme());

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  function flashButton(button) {
    var original = button.textContent;
    button.textContent = '已复制';
    button.disabled = true;
    setTimeout(function () {
      button.textContent = original;
      button.disabled = false;
    }, 1600);
  }

  function copyText(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flashButton(button);
      }).catch(function () {
        fallbackCopy(text, button);
      });
    } else {
      fallbackCopy(text, button);
    }
  }

  function fallbackCopy(text, button) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      flashButton(button);
    } catch (err) {
      button.textContent = '复制失败';
    }
    document.body.removeChild(textarea);
  }

  var install = document.querySelector('.install');
  if (install) {
    var installButton = install.querySelector('.copy-btn');
    var installCode = install.querySelector('code');
    if (installButton && installCode) {
      installButton.addEventListener('click', function () {
        copyText(installCode.textContent.trim(), installButton);
      });
    }
  }

  var blocks = document.querySelectorAll('pre.code-block');
  for (var i = 0; i < blocks.length; i += 1) {
    (function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn code-copy';
      button.textContent = '复制';
      button.addEventListener('click', function () {
        copyText(code.textContent, button);
      });
      pre.appendChild(button);
    })(blocks[i]);
  }
})();
