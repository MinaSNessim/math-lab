(function (root) {
  function reduced() {
    return root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function chunk(total, size, work, paint, done) {
    var i = 0;
    function finish() {
      if (done) done();
    }
    function step() {
      var end = Math.min(total, i + size);
      for (; i < end; i += 1) work(i);
      paint(i, total);
      if (i < total) root.setTimeout(step, 16);
      else finish();
    }
    if (reduced() || total <= size) {
      for (; i < total; i += 1) work(i);
      paint(total, total);
      finish();
      return;
    }
    step();
  }

  function pct(part, whole) {
    if (!whole) return "0%";
    return (Math.round((1000 * part) / whole) / 10) + "%";
  }

  root.GymRun = { chunk: chunk, pct: pct, reduced: reduced };
})(window);
