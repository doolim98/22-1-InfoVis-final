export class Item {
  constructor(obj = {}) {
    Object.assign(this, Item, obj);
  }
  pick(keys = []) {
    let obj = new Item();
    keys.map((k) => {
      obj[k] = this[k];
    });
    return obj;
  }
  contains(target) {
    return Object.keys(target).find((k) => target[k] != this[k]);
  }
  valueOf() {
    return JSON.stringify(this);
  }
  eq(from) {
    return JSON.stringify(this) == JSON.stringify(from);
  }
  copy() {
    return Object.assign({}, this);
  }
}

export class Database {
  static attributes = {
    float: ["url_len", "js_len", "js_obf_len"],
    int: ["index"],
    string: ["tld", "https", "label", "who_is", "geo_loc", "url"],

    norminal: ["https", "label", "who_is", "geo_loc", "tld"],
    ratio: ["url_len", "js_len", "js_obf_len"],
    unique: ["index", "ip_add", "url"],
  };
  data = [];
  constructor(array = []) {
    this.data = Array.from(array);
  }

  loadCsv(url, onData = () => {}) {
    let attributes = Database.attributes;
    let data = this.data;
    return d3
      .csv(url, function (item) {
        let newItem = new Item();

        // newItem["index"] = parseInt(item[""]);

        // attributes.int.map((a) => {
        //   newItem[a] = parseInt(item[a]);
        // });

        attributes.float.map((a) => {
          newItem[a] = parseFloat(item[a]);
        });

        attributes.string.map((a) => {
          newItem[a] = item[a];
        });

        // handle ip address
        newItem["ip_add"] = item["ip_add"]
          .split(".")
          .map((v) => parseInt(v))
          .reduce((acc, cur, idx) => {
            return acc * 256 + cur;
          });

        data.push(newItem);
        return null;
      })
      .then(onData);
  }
  getDomain(attr) {
    return [...new Set(this.data.map((v) => v[attr]))];
  }
  select(attrs) {
    let o = this.copy();
    o.data = this.data.map((item) => item.pick(attrs));
    return o;
  }
  count(item) {
    return this.select(Object.keys(item)).data.reduce((acc, cur) => {
      acc += cur.eq(item) ? 1 : 0;
      return acc;
    }, 0);
  }
  reduce() {
    let o = this.copy();
    o.data = new Array();
    this.data.map((item) => {
      if (!o.data.find((i) => i.eq(item))) {
        o.data.push(item);
      }
    });
    return o;
  }

  countReduce(attr = "count") {
    let o = this.reduce();
    o.data.forEach((item) => {
      item[attr] = this.count(item);
    });
    return o;
  }
  filter(fn) {
    let o = this.copy();
    o.data = this.data.filter(fn);
    return o;
  }

  map(fn) {
    let o = this.copy();
    o.data = this.data.map(fn);
    return o;
  }

  sort(attr = "count") {
    let o = this.copy();
    o.data.sort((a, b) => b[attr] - a[attr]);

    return o;
  }
  slice(b, e) {
    let o = this.copy();
    o.data = this.data.slice(b, e);
    return o;
  }
  max(attr) {
    return d3.max(this.getDomain(attr));
  }
  mean(attr) {
    return (
      this.data.reduce((prev, cur) => {
        prev += cur[attr];
      }, 0) / this.data.length
    );
  }
  quantize(attr, num) {
    let size = this.max(attr) / num;
    this.map((item) => {
      item["q_" + attr] = Math.trunc(Math.trunc(item[attr] / size) * size);
    });
    return this;
  }

  isEmpty() {
    return this.data.length == 0;
  }

  copy() {
    return new Database(this.data);
  }
}
