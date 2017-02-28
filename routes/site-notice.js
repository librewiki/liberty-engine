'use strict';

const express = require('express');
const router = express.Router();
const Response = require(global.rootdir + '/src/responses');

router.get('/',
  (req, res, next) => {
    new Response.Success({
      siteNotice: {
        html: `<ul><li> 새로 오신 분들은 <a href="/wiki/%EB%A6%AC%EB%B8%8C%EB%A0%88_%EC%9C%84%ED%82%A4:%ED%99%98%EC%98%81%ED%95%A9%EB%8B%88%EB%8B%A4" title="리브레 위키:환영합니다"><span style="color: green;">리브레 위키:환영합니다</span></a> 필독해주세요</li>
<li> <a href="/wiki/%EB%A6%AC%EB%B8%8C%EB%A0%88_%EC%9C%84%ED%82%A4:%EC%84%A0%EA%B1%B0/%EC%A0%9C7%EC%B0%A8_%EC%A0%95%EA%B8%B0%EC%84%A0%EA%B1%B0/%ED%88%AC%ED%91%9C" title="리브레 위키:선거/제7차 정기선거/투표"><span style="color: green;">정기선거 투표</span></a> 기간입니다 (1/9~1/15)</li></ul>`
      }
    }).send(res);
  }
);

module.exports = router;
