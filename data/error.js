module.exports = function Error(code, msg, data){
    this.code = code;
    this.msg = msg;
    this.data = data;
}