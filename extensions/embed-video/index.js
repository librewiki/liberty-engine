'use strict';

function youtubeHook($item) {
  const id = $item.text();
  const width = Number($item.attr('width')) || 560;
  const height = Number($item.attr('height')) || 315;
  return `<iframe src="//www.youtube-nocookie.com/embed/${id}" width="${width}" height="${height}"></iframe>`;
}

module.exports.import = (helper) => {
  helper.parserHook.setXmlHook({
    type: 'afterSanitize',
    selector: 'youtube',
    hook: youtubeHook,
    allowedTags: ['youtube'],
    allowedAttributes: {
      youtube: ['width', 'height'],
    },
  });
};
