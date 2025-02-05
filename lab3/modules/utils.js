this.getDate = function () {
  return new Date().toString();
}

this.formatString = function (template, values) {
  return template.replace(/%(\w+)%/g, (_, key) => values[key]);
}