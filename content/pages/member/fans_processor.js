import { formatDate, download } from '../../utils/helpers.js';

class Processor {
  constructor(year) {
    this.year = year;
    this.csvAll = "";
    this.notYetWrite = true;
  }

  static replace(str = "") {
    return `${str.replace(/"/g, '""')}`;
  }

  buildHeader() {
    const header = "\uFEFFmonth,follow,unfollow\n";
    this.csvAll = header;
  }

  download() {
    const dateStr = formatDate(new Date());
    download(this.csvAll, `fans_${this.year}_${dateStr}.csv`);
  }

  buildRecord({ month, f, u } = {}) {
    const record = `"${month}","${f}","${u}"\n`;
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
