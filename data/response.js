module.exports = function Response(code, msg, data){
    this.code = code;
    this.msg = msg;
    this.data = data;
};