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

$(document).ready(function() {
  $.get('data.yaml')
    .done(function(yamlText) {
      try {
        const data = jsyaml.load(yamlText);

        if (data.scroller) {
          var html = buildScroller(data.scroller);
          $('.sine-scroller').html(html);
        }

        $.getJSON('assets/modules/index.json')
          .done(function(modules) {
            var $list = $('#module-list').empty();
            $.each(modules, function(i, name) {
              $list.append('<li class="list-group-item">' + name + '</li>');
            });
          });

        const $news = $('#news');
        $news.empty();

        $.each(data.news, function(index, thing) {
            $news.append('<li class="list-group-item border-0 ps-0">' + thing + '</li>');
        });

      } catch (error) {
          console.error("YAML parsing error:", error);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Failed to load file:", textStatus, errorThrown);
    });
});
