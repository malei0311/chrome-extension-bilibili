import { formatDate, download } from '../../utils/helpers.js';

// 处理数据，下载两份 csv
class Processor {
  constructor(oid) {
    this.oid = oid;
    this.csvAll = '';
    this.notYetWrite= true;
  }

  static replace(str = '') {
    return `${str.replace(/"/g, '""')}`;
  }

  buildHeader() {
    const header = '\uFEFFcomment_to,uid,nickname,comment_id,comment,comment_date,reply_count,plat,like,fans_medal_name,fans_level,level,sex,sign\n';
    this.csvAll = header;
  }

  download() {
    const dateStr = formatDate(new Date());
    download(this.csvAll, `comments_${this.oid}_${dateStr}.csv`);
  }

  buildRecord({
    oid,
    root,
    rpid,
    member = {},
    content = {},
    ctime,
    rcount,
    like,
  } = {}) {
    const commentTo = root ? root : oid;
    const fansDetail = member.fans_detail || {};
    const levelInfo = member.level_info || {};
    const record =
      `"${commentTo}","${member.mid}","${Processor.replace(member.uname)}","${rpid}",` +
      `"${Processor.replace(content.message)}","${formatDate(new Date(ctime * 1000))}",` +
      `"${rcount}","${content.plat}","${like}","${Processor.replace(fansDetail.medal_name)}",` +
      `"${fansDetail.level || 0}","${levelInfo.current_level || 0}","${member.sex}",` +
      `"${Processor.replace(member.sign)}"\n`;
    this.csvAll += record;
  }

  write(list = []) {
    if (this.notYetWrite) {
      this.notYetWrite = false;
      this.buildHeader();
    }
    list.forEach((item) => {
      this.buildRecord(item);
      const replies = item.replies || [];
      replies.forEach((reply) => {
        this.buildRecord(reply);
      });
    });
  }
}

export default Processor;
