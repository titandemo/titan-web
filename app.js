$(document).ready(function() {
  $.get('data.yaml')
    .done(function(yamlText) {
      try {
        const data = jsyaml.load(yamlText);

        const $news = $('#news');
        $news.empty();

        $.each(data.news, function(index, thing) {
            $news.append(`<li class="list-group-item border-0 ps-0">${thing}</li>`);
        });

      } catch (error) {
          console.error("YAML parsing error:", error);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Failed to load file:", textStatus, errorThrown);
    });
});
