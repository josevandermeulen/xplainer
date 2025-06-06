function calculate() {
    var m = parseFloat(document.getElementById('slope').value);
    var b = parseFloat(document.getElementById('intercept').value);
    var x = parseFloat(document.getElementById('xvalue').value);
    var y = m * x + b;
    var result = document.getElementById('result');
    result.textContent = 'For x = ' + x + ', y = ' + y + ' (y = ' + m + ' * x + ' + b + ')';
}
