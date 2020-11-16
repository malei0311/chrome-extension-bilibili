import { formatDate, download } from '../../../utils/helpers.js';

class Processor {
  constructor(date) {
    this.date = date;
    this.csvAll = '';
    this.notYetWrite = true;
  }

  static replace(str = '') {
    return `${str.replace(/"/g, '""')}`;
  }

  buildHeader() {
    const header = '\uFEFF用户id,用户昵称,收礼时间,礼物id,礼物名称,数量,银瓜子,金瓜子,金仓鼠,ios_金瓜子,ios_金仓鼠,normal_金瓜子,normal_金仓鼠\n';
    this.csvAll = header;
  }

  download() {
    const dateStr = formatDate(new Date());
    download(this.csvAll, `礼物流水_${this.date}_${dateStr}.csv`);
  }

  buildRecord({ uid, uname, time, gift_id, gift_name, gift_num, silver, gold, hamster, ios_gold, ios_hamster, normal_gold, normal_hamster } = {}) {
    const record = `"${uid}","${Processor.replace(uname)}","${time}","${gift_id}",` +
      `"${Processor.replace(gift_name)}","${gift_num}","${silver}","${!silver ? gold : 0}","${hamster}",` +
      `"${ios_gold}","${ios_hamster}","${normal_gold}","${normal_hamster}"\n`;
    this.csvAll += record;
  }

  write(list = []) {
    if (this.notYetWrite) {
      this.notYetWrite = false;
      this.buildHeader();
    }
    list.forEach(item => {
      this.buildRecord(item);
    });
  }
}

export default Processor;
