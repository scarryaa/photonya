const {dialog} = require('electron').remote;

document.addEventListener('DOMContentLoaded', () => {
  const { remote } = require('electron') ;
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  var clickedOnMenu = false;
  var img = new Image;
  var _img = document.getElementById('image');
  var imgView = document.getElementById("image-view");
  var imgContainer = document.querySelector('#content')

  imgContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
  })

  imgContainer.addEventListener("drop", function(e) {
    e.preventDefault();
    _img.src = e.dataTransfer.files[0].path;
  })

  document.addEventListener("click", function(e) {
    if (e.target.nodeName != 'A') {
      clickedOnMenu = false;

      var selectedMenu = document.getElementById('title-bar').querySelectorAll('.activeMenu')
      if (selectedMenu.length > 0) {
        selectedMenu[0].classList.remove('activeMenu')
        selectedMenu[0].querySelector('.dropdown-content').classList.remove('active')
      }
    }
  })

  document.getElementById("min-button").addEventListener("click", function (e) {
    var win = remote.getCurrentWindow();
    win.minimize();
  })

  document.getElementById("max-button").addEventListener("click", function (e) {
    var win = remote.getCurrentWindow();
    if (!win.isMaximized()) {
      win.maximize();
    } else {
      win.unmaximize();
    }
  })

  document.getElementById("close-button").addEventListener("click", function (e) {
    window.close();
  })

  document.getElementById('open-file').addEventListener('click', function (event) {
      dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections']
      })
      .then(result => {
        if (result.canceled) return;
        img = new Image;
        img.onload = function() {
          _img.src = img.src;
          resetTransform();
        }
        img.src = result.filePaths[0];
      });
    })

  var element = document.getElementsByClassName("dropdown-menu");
  for (var i = 0; i < element.length; i++)
  {
    element[i].addEventListener("click", menuClick);
    element[i].addEventListener("mouseenter", menuEnter);
  }

  function menuEnter(e) {
      for (var i = 0; i < element.length; i++)
      {
        if (element[i].querySelector('.dropdown-content').classList.contains('active')) {
          element[i].querySelector('.dropdown-content').classList.remove('active');
          element[i].classList.remove('activeMenu')
        }
      }

      if (clickedOnMenu) {
        this.classList.add('activeMenu')
        this.querySelector('.dropdown-content').classList.add('active');
      }
    }

  function menuClick(e) {
    clickedOnMenu ^= true;

    if (this.querySelector('.dropdown-content').classList.contains('active')) {
      this.querySelector('.dropdown-content').classList.remove('active');
      this.classList.remove('activeMenu')
    } else {
      this.querySelector('.dropdown-content').classList.add('active');
      this.classList.add('activeMenu')
    }
  }

  var scale = 1,
      panning = false,
      pointX = 0,
      pointY = 0,
      imgWidth = 0,
      imgHeight = 0,
      transformX = "center",
      transformY = "center",
      start = { x: 0, y: 0 };

  //resets transform to default
  function resetTransform() {
    scale = 1;
    panning = false;
    pointX = 0;
    pointY = 0;
    transformX = "center";
    transformY = "center";
    setTransform();
  }

  //trnasform function
  function setTransform() {
        _img.style.transform = "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";
        _img.style.transformOrigin = transformX + " " + transformY
  }

  //image zoom function
  imgView.onwheel = function (e) {
        e.preventDefault();

        console.log(_img.getBoundingClientRect().width);
        console.log(_img.getBoundingClientRect().height);

        var xs = (e.clientX - pointX) / scale,
          ys = (e.clientY - pointY) / scale,
          delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

        if (delta > 0) {
          scale *= 1.2;
        }
        else {
          if (scale / 1.2 <= 1 || scale <= 1) scale = 1;
          else {
            scale /= 1.2;
          }
        }

        pointX = e.clientX - xs * scale;
        pointY = e.clientY - ys * scale;

        if (_img.getBoundingClientRect().width * 1.44 > imgContainer.clientWidth) {
          console.log("true");
          pointX = e.clientX - xs * scale;
          transformX = 0;
        }
        else {
          console.log("False");
          pointX = 0;
          transformX = "center";
        }

        if (_img.getBoundingClientRect().height * 1.44 > imgContainer.clientHeight) {
          console.log("true");
          pointY = e.clientY - ys * scale;
          transformY = 0;
        }
        else {
          console.log("False");
          pointY = 0;
          transformY = "center";
        }

        if (delta < 0) {
        }

        setTransform();
      }

  //image panning functions
  _img.onmousedown = function (e) {
    e.preventDefault();
    //right mouse button -- do nothing
    if (e.which == 3) return;

    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
  }

  imgView.ondblclick = function (e) {
    e.preventDefault();
    resetTransform();
  }

  _img.onmouseup = function (e) {
    panning = false;
  }

  _img.onmousemove = function (e) {
    e.preventDefault();
    //prevent moving if img is not overflowing
    if (!panning) {
      return;
    }

    if (_img.getBoundingClientRect().width <= imgContainer.clientWidth);
    else pointX = (e.clientX - start.x);

    if (_img.getBoundingClientRect().height <= imgContainer.clientHeight);
    else pointY = (e.clientY - start.y);

    setTransform();
  }

  _img.onmouseout = function (e) {
    panning = false;
  }
});
