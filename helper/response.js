module.exports = function Response(code, msg, error) {
    this.code = code;
    this.msg = msg || '';
    this.error = error || {};
};