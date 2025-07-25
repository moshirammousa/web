<<<<<<< HEAD
function saveData(data, filename) {
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(data)], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  }
=======
function saveData(data, filename) {
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(data)], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  }
>>>>>>> 3cff32c869d853a1144d8622f590c8880430ef17
  