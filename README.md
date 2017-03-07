# 😎 RTextAreaJS
---
Simple plugin to turn contenteditable div to Rich Text Editor-like widget.

Requires the following:
* [Zepto](http://zeptojs.com/)/[JQuery](https://jquery.com/)
* [Mustache](https://mustache.github.io/)
* [Emojione](http://emojione.com/)

![Screen](http://i.imgur.com/d5SEcUw.png)

Usage:
```javascript
// Invoke rtextarea by a wrapper div
$('.rtextarea-container').rtextarea();
// Get the plain text equivalent.
// Useful for form submissions.
$('.rtextarea-container').rtextToPlainText();
```
