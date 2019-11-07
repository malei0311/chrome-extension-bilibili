import log from '../../utils/log.js';
import Processor from './comment_processor.js';
import { MSG_TYPE_CONTENT } from '../../utils/config.js';

export async function exportCommentCsv(oid) {
  const start = new Date();
  let processor = new Processor(oid);
  try {
    await getAllComment(oid, processor);
  } catch (err) {
    processor = null;
    return;
  }
  processor.download();
  log.log(`export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`);
}

function sendRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: MSG_TYPE_CONTENT,
        data: {
          url,
          options,
        },
      },
      function(resp) {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          log.log('can not connect to bg:', lastError.message);
          reject(lastError);
          return;
        }

        if (resp.type === 'error') {
          reject(new Error('retry overflow'));
          return;
        }
        resolve(resp.data);
      }
    );
  });
}

function getCommentReply(oid, cid, pn) {
  return sendRequest('http://api.bilibili.com/x/v2/reply/reply', {
    query: {
      pn,
      oid,
      type: 1,
      ps: 20,
      root: cid,
    },
  });
}

function getComment(oid, pn) {
  return sendRequest('http://api.bilibili.com/x/v2/reply', {
    query: {
      pn,
      oid,
      type: 1,
      sort: 2,
    },
  });
}

async function getAllCommentReply(oid, cid, pn = 1) {
  const { page, replies } = await getCommentReply(oid, cid, pn);
  const list = replies || [];
  const len = list.length;
  if (len < page.size || pn !== 1) {
    return list;
  }
  // 获取其余页，规避递归, 串行处理
  const maxPn = Math.ceil(page.count / page.size);
  return Array(maxPn - 1)
    .fill()
    .reduce((p, c, i) => {
      return p.then((pre) => {
        return getAllCommentReply(oid, cid, i + 2).then((cur) => {
          return pre.concat(cur);
        });
      });
    }, Promise.resolve(list));
}

async function getCommentWithReply(oid, pn) {
  const comments = await getComment(oid, pn);
  const list = comments.replies || [];
  const page = comments.page || {};
  // 兼容第一页的制置顶数据
  if (
    comments.upper &&
    comments.upper.top &&
    page.size > list.length &&
    page.num === 1
  ) {
    list.unshift(comments.upper.top);
    comments.replies = list;
  }
  // 补全评论
  await list.reduce((p, comment) => {
    // 没有评论, 或者不用请求
    const replies = comment.replies || [];
    if (!comment.rcount || comment.rcount === replies.length) {
      return p;
    }
    return p.then(() => {
      return getAllCommentReply(oid, comment.rpid).then((ret) => {
        comment.replies = ret;
      });
    });
  }, Promise.resolve());
  return comments;
}

async function getAllComment(oid, processor, pn = 1) {
  const { page, replies } = await getCommentWithReply(oid, pn);
  const list = replies || [];
  processor.write(list);
  const len = list.length;
  if (len < page.size || pn !== 1) {
    return;
  }
  // 获取其余页，规避递归, 串行处理
  const maxPn = Math.ceil(page.count / page.size);
  await Array(maxPn - 1).fill().reduce((p, c, i) => {
    return p.then(() => {
      return getAllComment(oid, processor, i + 2);
    });
  }, Promise.resolve());
}
