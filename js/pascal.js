(function () {
  var ids = ["cell-be", "cell-bn", "cell-de", "cell-dn"];
  var lines = {
    "cell-be": "Yellow cell. You believe, and God exists: the gain is infinite.",
    "cell-bn": "Red cell. You believe, and God does not exist: a finite loss.",
    "cell-de": "Red cell. You do not believe, and God exists: a finite loss.",
    "cell-dn": "Green cell. You do not believe, and God does not exist: a finite gain."
  };
  var nodes = [];
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var i;

  for (i = 0; i < ids.length; i += 1) nodes.push(document.getElementById(ids[i]));

  function listen(node) {
    node.addEventListener("click", function () {
      node.classList.add("is-on");
      caption.textContent = lines[node.id];
    });
  }

  for (i = 0; i < nodes.length; i += 1) listen(nodes[i]);
  again.addEventListener("click", function () {
    for (i = 0; i < nodes.length; i += 1) nodes[i].classList.remove("is-on");
    caption.textContent = "";
  });
})();
