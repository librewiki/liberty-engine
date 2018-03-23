'use strict';

function youtubeHook($item) {
  const id = $item.text();
  const width = Number($item.attr('width')) || 560;
  const height = Number($item.attr('height')) || 315;
  return `<iframe class="embed-video embed-video-youtube" src="//www.youtube-nocookie.com/embed/${id}" width="${width}" height="${height}"></iframe>`;
}

function kakaotvHook($item) {
  const id = $item.text();
  const width = Number($item.attr('width')) || 640;
  const height = Number($item.attr('height')) || 360;
  return `<iframe class="embed-video embed-video-kakaotv" width="${width}" height="${height}" src="//tv.kakao.com/embed/player/cliplink/${id}" allowfullscreen frameborder="0" scrolling="no"></iframe>`;
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
  helper.parserHook.setXmlHook({
    type: 'afterSanitize',
    selector: 'kakaotv',
    hook: kakaotvHook,
    allowedTags: ['kakaotv'],
    allowedAttributes: {
      kakaotv: ['width', 'height'],
    },
  });
};
