function buildScroller(text) {
  const chars = text.toUpperCase().split('');
  return chars.map(function(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const letter = String.fromCharCode(code).toLowerCase();
      return '<span class="pf pf-' + letter + '"></span>';
    }
    return '<span class="space"></span>';
  }).join('');
}

var chiptune = null;
var moduleList = [];
var currentModule = '';
var currentIndex = -1;
var initializing = false;
var isPlaying = false;
var chiptuneReady = false;

function setPlayState(playing) {
  isPlaying = playing;
  var icon = playing ? 'bi-pause-fill' : 'bi-play-fill';
  $('#btn-play i, .btn-play i').attr('class', 'bi ' + icon);
}

function playModule(name) {
  if (!chiptune || !name) return;
  currentModule = name;
  currentIndex = moduleList.indexOf(name);
  $('#track-title-desktop, #track-title-mobile').text(name);
  $('.player-progress-bar').css('width', '0%');
  chiptune.load('assets/modules/' + encodeURIComponent(name));
  $('.module-link').removeClass('active');
  $('.module-link').filter(function() {
    return $(this).data('module') === name;
  }).addClass('active');
}

function tryStartPlayback() {
  if (chiptuneReady && moduleList.length) {
    var idx = Math.floor(Math.random() * moduleList.length);
    playModule(moduleList[idx]);
  }
}

function playNextModule() {
  if (!moduleList.length) return;
  var idx = currentIndex + 1;
  if (idx >= moduleList.length) idx = 0;
  playModule(moduleList[idx]);
}

function playPrevModule() {
  if (!moduleList.length) return;
  var idx = currentIndex - 1;
  if (idx < 0) idx = moduleList.length - 1;
  playModule(moduleList[idx]);
}

function resumeAudioContext() {
  if (chiptune && chiptune.gain && chiptune.gain.context) {
    var ctx = chiptune.gain.context;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }
}

function initChiptune() {
  if (initializing || chiptune) return;
  initializing = true;
  import('https://DrSnuggles.github.io/chiptune/chiptune3.min.js').then(function(m) {
    chiptune = new m.ChiptuneJsPlayer({repeatCount: 0});
    chiptune.gain.gain.value = 0.5;

    chiptune.onInitialized(function() {
      initializing = false;
      chiptuneReady = true;
      tryStartPlayback();
    });

    chiptune.onError(function(err) {
      console.error('ChiptuneJsPlayer error:', err);
    });

    chiptune.onProgress(function(data) {
      if (!data) return;
      var position = data.pos || 0;
      var duration = chiptune.duration || 0;
      var pct = duration > 0 ? (position / duration) * 100 : 0;
      if (pct > 100) pct = 100;
      $('.player-progress-bar').css('width', pct + '%');
    });

    chiptune.onEnded(function() {
      playNextModule();
    });
  }).catch(function(err) {
    initializing = false;
    console.error('ChiptuneJsPlayer init error:', err);
  });
}

var autoResumed = false;

function togglePlay() {
  if (!chiptune) return;
  if (chiptune.gain.context.state === 'suspended') {
    chiptune.gain.context.resume();
    setPlayState(true);
    return;
  }
  if (autoResumed) {
    autoResumed = false;
    return;
  }
  if (isPlaying) {
    chiptune.pause();
    setPlayState(false);
  } else {
    chiptune.unpause();
    setPlayState(true);
  }
}

$(document).ready(function() {
  var scrollerText = $('.sine-scroller').data('text');
  if (scrollerText) {
    $('.sine-scroller').html(buildScroller('       ' + scrollerText));
  }

  moduleList = [];
  $('.module-link').each(function() {
    moduleList.push($(this).data('module'));
  });
  tryStartPlayback();

  initChiptune();

  setTimeout(function() {
    if (!currentModule && chiptuneReady && moduleList.length) {
      tryStartPlayback();
    }
  }, 3000);

  $(document).one('click touchstart', function() {
    resumeAudioContext();
    setPlayState(true);
    autoResumed = true;
  });

  $(document).on('click', '#btn-play, .btn-play', function() {
    togglePlay();
  });

  $(document).on('click', '#btn-next, .btn-next', function() {
    resumeAudioContext();
    setPlayState(true);
    playNextModule();
  });

  $(document).on('click', '#btn-prev, .btn-prev', function() {
    resumeAudioContext();
    setPlayState(true);
    playPrevModule();
  });

  $(document).on('click', '.module-link', function(e) {
    e.preventDefault();
    resumeAudioContext();
    setPlayState(true);
    var name = $(this).data('module');
    if (name) playModule(name);
  });
});
