if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(selector) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
    var index;
    var element = this;
    do {
        index = matches.length;
        while (--index >= 0 && matches.item(index) !== element) {};
    } while ((index < 0) && (element = element.parentElement)); 
    return element;
  };
}