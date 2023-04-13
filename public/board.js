//! SOCKET

let hrefID = window.location.href.split("id=")[1]
async function gatDataOnStart() {
  let html = await fetch(`http://localhost:8050/nalozeno/${hrefID}/save.txt`)
  html.text().then(async function (text) {
    if (text) {
      if (!text.includes("PAGE NOT")) spomin = JSON.parse(text).data
    }

    narisiVse()
    await new Promise(r => setTimeout(r, 100))
    narisiVse()

  });
}




if (hrefID) gatDataOnStart()



let index = 0
let key
if ("WebSocket" in window) {

  //local
  var ws = new WebSocket("ws://localhost:8070/echo");
  //public
  //var ws = new WebSocket("wss://neteowritge.com/echo");

  ws.onopen = function () {
    posli("nimam nic")
  };

  ws.onmessage = function (evt) {

    let received_msg = evt.data;
    let msg = JSON.parse(received_msg)
    console.log(msg)
    if (msg.key) {
      key = msg.key
      posli("nimam nic")
    }

    if (msg.msg == "ni_programa") { posliProgram(); return }
    index++

    if (msg.board == "1") { posli2("", "rabim") }

    if (msg.key == key || msg.kljuc == key && key) return
    else if (msg == "ni_programa") return


    console.log(`${key} in ${msg.key} in ${msg.kljuc} kar je ${msg}`)
    console.log("sharnjujem si ")



    if (msg.vsebina == "rabim") {
      posli2(spomin, "vse")
    } else {
      if (!msg.sporocilo) return
      if (spomin.length < 2) spomin = (msg.sporocilo)
      else spomin.push(msg.sporocilo)

    }

    narisiVse()

  };

  ws.onclose = function () {
    console.log("potrebna ponovna povezava")
    //local
    ws = new WebSocket("ws://localhost:8070/echo");
    //public
    //ws = new WebSocket("wss://neteowritge.com/echo");
  };

} else { alert("WebSocket ne dela v tem brskalniku"); }


//!   SLIKE

let trenutnaSlika = ""
updateList = function () {
  let input = document.getElementById('file');
  trenutnaSlika = input.files.item(0).name
  document.getElementById("inputImageForm").submit()
  spomin.push([[[200, 200], trenutnaSlika.split('.')[0], drawingSize, "slika"]])
}

function dodajSliko() {
  if (trenutnaSlika) {
    slike.push([trenutnaSlika.split('.')[0], new Image])
    slike[slike.length - 1][1].src = `nalozeno/${hrefID}/${trenutnaSlika}`;
    console.log(slike)
  }

}

function naloziSlikoFun(ime) {
  console.log(ime)
  slike.push([ime, new Image])
  slike[slike.length - 1][1].src = `nalozeno/${hrefID}/${ime}.png`;
  narisiVse()
}



function posli(msg) {
  if (key) {
    ws.send(`{"kljuc":"${key}","sporocilo":${JSON.stringify(msg)}}`);
    console.log("sporocilo poslano")
  }
}
function posli2(msg, vsebina) {
  if (key) {
    ws.send(`{"kljuc":"${key}","sporocilo":${JSON.stringify(msg)},"vsebina":"${vsebina}"}`);
    console.log("sporocilo poslano")
  }
}

function posliProgram(msg) {

  if (key) {
    ws.send(`{"kljuc":"${key}","board":"1"}`);
    console.log("prvo sporocilo poslano")
  }
}

async function saveToServer() {
  const rawResponse = await fetch(`http://localhost:8050/store?board=${hrefID}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: spomin })
  });
}

//! CANVAS

let pointerButton = false
let radirkaButton = false
let miskaJePritisnjena = false


var canvas, ctx, kajDelaMiska = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_kajDelaMiska = false;
let sredinaFlag = false

let SredinaMiskeX = 0
let SredinaMiskeY = 0


var drawingColor = "black",
  drawingSize = 2;


let spomin = [[[[]]]]
let slike = []

let frame = performance.now()
let scale = 1
let scaleCurrent = 1
let scaleSmart = 1

let trenutnoPisanje = {}
trenutnoPisanje.text = ""

var nekajX = 0, nekajY = 0;
var nekajXPomozni = 0, nekajYPomozni = 0;
let h = 0, w = 0;


function onLoad() {
  canvas = document.getElementById('can');
  ctx = canvas.getContext("2d");

  var lastX = canvas.width / 2, lastY = canvas.height / 2;
  var dragStart, dragged;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;


  w = canvas.width;
  h = canvas.height;

  narisiVse()



  canvas.addEventListener("pointermove", function (e) {
    if (pointerButton) {
      elementNaLokacijiPremik(e)
    } else if (radirkaButton) {
      zradirajNaLokaciji(e)
    } else {

      procesiraj('move', e)

      lastX = e.offsetX || (e.pageX - canvas.offsetLeft);
      lastY = e.offsetY || (e.pageY - canvas.offsetTop)
      sredinaMiske(e)
    }


  }, false);
  canvas.addEventListener("pointerdown", function (e) {
    if (pointerButton) {
      najdiElementNaLokaciji(e)
    } else if (radirkaButton) {
      miskaJePritisnjena = true
      zradirajNaLokaciji(e)
    } else {
      if (e.which == 1) {
        procesiraj('down', e)
        spomin.push([[[currX, currY], drawingColor, drawingSize, "risanje"]])
      } else if (e.which == 2) {
        sredinaMiskeDol(e)
      }
    }
  }, false);
  canvas.addEventListener("pointerup", function (e) {
    if (pointerButton) {
      miskaJePritisnjena = false
      saveToServer()
      oznacen = -1
    } else {
      posli2(spomin[spomin.length - 1], "vrstica")
      procesiraj('up', e)
      saveToServer()
    }
  }, false);
  canvas.addEventListener("mouseout", function (e) {
    procesiraj('out', e)
  }, false);

  window.addEventListener('keydown', function (e) {


    if (e.altKey == true && e.keyCode == 78) {
      erase()
      console.log('Alt + N zbrisi');
    } else if (e.altKey == true && e.keyCode == 77) {
      narisiVse()
      console.log('Alt + M narisi');
    } else if (e.altKey == true && e.keyCode == 83) {
      saveToServer()
      console.log('Alt + S shranjujem');
    } else if (e.altKey == true && e.keyCode == 66) {


      //velikost datoteke
    } else if (e.altKey == true && e.keyCode == 51) {
      let velikost = 0
      spomin.forEach(el => {
        el[0].forEach(el2 => {
          velikost++
        })
      })
      alert(`Velikost je: ${velikost}`)
    }


    //ctrl z
    else if (e.ctrlKey == true && e.keyCode == 90) {
      ctrlZ()
      console.log("brisem")


      // PISANJE
    } else {


      if (e.key == "Backspace") {
        if (trenutnoPisanje.text) trenutnoPisanje.text = trenutnoPisanje.text.slice(0, -1)
      }

      if (e.key == "Enter") {
        spomin.push([[[[trenutnoPisanje.x, trenutnoPisanje.y], trenutnoPisanje.text, drawingColor, drawingSize * 20], drawingColor, drawingSize, "text"]])
        trenutnoPisanje.text = ""
        narisiVse()
        posli2(spomin[spomin.length - 1], "vrstica")
        return
      }

      if (!trenutnoPisanje.text) {
        trenutnoPisanje.x = lastX
        trenutnoPisanje.y = lastY
      }

      narisiVse()
      console.log("pisava")
      ctx.beginPath();
      if (e.key.length == 1) trenutnoPisanje.text += e.key
      ctx.font = `bold ${drawingSize * 20}px Arial`;
      ctx.fillStyle = drawingColor;
      ctx.fillText(trenutnoPisanje.text, trenutnoPisanje.x, trenutnoPisanje.y);
      ctx.fill();
    }

  })

  //var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  //var xform = svg.createSVGMatrix();

  var pt = { x: 0, y: 0 };
  ctx.transformedPoint = function (x, y) {
    pt.x = x; pt.y = y;
    return //pt.matrixTransform(xform.inverse());
  }






  // ZOOM
  addEventListener('wheel', (event) => {
    erase()



    delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0
    var pt = ctx.transformedPoint(lastX, lastY);

    var factor = Math.pow(1.1, delta);

    scaleSmart = factor


    let outSredina = true //odzumira na sredino
    if (outSredina && scaleSmart < 1) {
      pt.x = w / 2
      pt.y = h / 2
      //console.log("sredina")
    }

    ctx.translate(pt.x, pt.y);

    ctx.scale(scaleSmart, scaleSmart);
    ctx.translate(-pt.x, -pt.y);


    nekajXPomozni = ((pt.x * scaleSmart + (-1 * (pt.x))) * scaleCurrent) + nekajXPomozni
    nekajYPomozni = ((pt.y * scaleSmart + (-1 * (pt.y))) * scaleCurrent) + nekajYPomozni

    scaleCurrent = scaleSmart * scaleCurrent
    nekajX = nekajXPomozni / scaleCurrent
    nekajY = nekajYPomozni / scaleCurrent


    //console.log(`TO je scale : pomotni: ${nekajXPomozni} in  zracunan: ${nekajX} -> scale: ${scaleCurrent}`)
    //console.log(canvas.offsetLeft)
    scaleSmart = 1
    narisiVse()

  });


  function sredinaMiskeDol(e) {
    sredinaFlag = true
  }


  function sredinaMiske(e) {
    if (sredinaFlag) {
      SredinaMiskeX = SredinaMiskeX - e.clientX
      SredinaMiskeY = SredinaMiskeY - e.clientY
      //console.log(SredinaMiskeX)
      SredinaMiskeX = e.clientX
      SredinaMiskeY = e.clientY
    }
  }

}


function draw() {
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.strokeStyle = drawingColor;
  ctx.lineWidth = drawingSize;
  ctx.stroke();
  ctx.closePath();

  spomin[spomin.length - 1][0].push([currX, currY])
  //console.log(`Risem: ${currX}, ${currY}`)

}

function shranjenoPokazi() {
  console.table(spomin)
}

function erase() {
  ctx.clearRect(0, 0, w, h);
}


var imgZid = [new Image()];
imgZid[0].src = "test.png";



function narisiVse() {
  if (!ctx) return
  console.log("risem")
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  spomin.forEach(el => {
    if (!el[0]) return
    if (el[0][3] == "text") {
      ctx.beginPath();
      ctx.font = `bold ${el[0][0][3]}px Arial`;
      ctx.fillStyle = el[0][0][2];
      ctx.fillText(el[0][0][1], el[0][0][0][0], el[0][0][0][1]);
      ctx.fill();
      return
    } else if (el[0][3] == "slika") {

      let naloziSliko = true
      slike.forEach(element => {
        if (el[0][1] == element[0]) {
          ctx.drawImage(element[1], 300, 300);
          naloziSliko = false
        }
      });
      if (naloziSliko) naloziSlikoFun(el[0][1])

      return
    }
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(el[0][0][0], el[0][0][1]);
    el[0].forEach(el2 => {
      ctx.lineTo(el2[0], el2[1]);
    })
    ctx.strokeStyle = el[0][1];
    ctx.lineWidth = el[0][2];
    ctx.stroke();
    ctx.closePath();

    if (trenutnoPisanje.text) {

      ctx.beginPath();
      ctx.font = `bold ${drawingSize * 20}px Arial`;
      ctx.fillStyle = drawingColor;
      ctx.fillText(trenutnoPisanje.text, trenutnoPisanje.x, trenutnoPisanje.y);
      ctx.fill();

    }

  })
}


function ctrlZ() {
  spomin.pop()
  ctx.clearRect(0, 0, w, h);
  narisiVse()
}

function save() {
  document.getElementById("canvasimg").style.border = "2px solid";
  let dataURL = canvas.toDataURL();
  document.getElementById("canvasimg").src = dataURL;
  document.getElementById("canvasimg").style.display = "inline";
}



function procesiraj(res, e) {
  if (res == 'down') {
    prevX = currX;
    prevY = currY;
    currX = e.clientX / scaleCurrent - canvas.offsetLeft + nekajX;
    currY = e.clientY / scaleCurrent - canvas.offsetTop + nekajY;

    kajDelaMiska = true;
    dot_kajDelaMiska = true;
    if (dot_kajDelaMiska) {
      ctx.beginPath();
      ctx.fillStyle = drawingColor;
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
      dot_kajDelaMiska = false;
    }
  }
  if (res == 'up' || res == "out") {
    kajDelaMiska = false;
    sredinaFlag = false
    narisiVse()
  }
  if (res == 'move') {
    if (kajDelaMiska) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX / scaleCurrent - canvas.offsetLeft + nekajX;
      currY = e.clientY / scaleCurrent - canvas.offsetTop + nekajY;

      //console.log(`Miska: ${e.clientX} / ${e.clientX / scaleCurrent} (Miska)  -  ${currX} (Zracunano) nekaj x: ${nekajX} `)
      draw();
    }
  }

}


function color(barva, elemt) {
  console.log("izbira barvo")
  if (barva == "blue") drawingColor = "blue";
  else if (barva == "red") drawingColor = "red";
  else if (barva == "yellow") drawingColor = "yellow";
  else if (barva == "green") drawingColor = "green";
  else if (barva == "orange") drawingColor = "orange";
  else if (barva == "white") drawingColor = "white";
  else if (barva == "pink") drawingColor = "magenta";



  else drawingColor = "black";

  document.getElementById("currentStatus").style.backgroundColor = drawingColor
  if (trenutnoPisanje.text) narisiVse()

}

function size(elemt) {
  console.log("izbira velikot")

  drawingSize = drawingSize + 1
  if (drawingSize > 13) drawingSize = 2

  elemt.style.width = `${drawingSize * 10 + 20}px`
  elemt.style.backgroundColor = drawingColor
  if (trenutnoPisanje.text) narisiVse()
}



let oznacen = -1
function pointerButtonToggle() {
  oznacen = -1
  pointerButton = !pointerButton
  if (pointerButton) document.getElementById("pointerButton").style.backgroundColor = "rgb(157, 157, 157)"
  else document.getElementById("pointerButton").style.backgroundColor = "rgb(217, 217, 217)"
}

function radirkaButtonToggle() {
  oznacen = -1
  radirkaButton = !radirkaButton
  if (radirkaButton) document.getElementById("radirkaButton").style.backgroundColor = "rgb(157, 157, 157)"
  else document.getElementById("radirkaButton").style.backgroundColor = "rgb(217, 217, 217)"
}







function zradirajNaLokaciji(e) {

  if (!miskaJePritisnjena) return

  miskaX = e.clientX / scaleCurrent - canvas.offsetLeft + nekajX;
  miskaY = e.clientY / scaleCurrent - canvas.offsetTop + nekajY;

  //console.log(`Pritisk na: x: ${miskaX} in y: ${miskaY}`)

  // na kaj sem kliknil



  for (i = spomin.length; i >= 0; i--) {
    if (spomin[i]) {
      //oznacen = -1


      for (j = spomin[i][0].length; j >= 5; j--) {

        // console.log(spomin[i][0][j])

        let razdalja = 0
        let razdaljaMiska = 0
        if (spomin[i][0][j]) razdalja = Math.sqrt((spomin[i][0][j][0] - spomin[i][0][j - 1][0]) * (spomin[i][0][j][0] - spomin[i][0][j - 1][0]) + (spomin[i][0][j][1] - spomin[i][0][j - 1][1]) * (spomin[i][0][j][1] - spomin[i][0][j - 1][1]))
        if (spomin[i][0][j]) razdaljaMiska = Math.sqrt((spomin[i][0][j][0] - miskaX) * (spomin[i][0][j][0] - miskaX) + (spomin[i][0][j][1] - miskaY) * (spomin[i][0][j][1] - miskaY))

        if ((razdalja * 0.6 > razdaljaMiska || razdaljaMiska < 5) && razdalja) {
          //console.log(`razdalja: ${razdalja} in ${razdaljaMiska}`)
          spomin.splice(i, 1)
          oznacen = i
          narisiVse()
        }
      }



    }
  }

}





let miskaX = 0
let miskaY = 0

function najdiElementNaLokaciji(e) {

  miskaX = e.clientX / scaleCurrent - canvas.offsetLeft + nekajX;
  miskaY = e.clientY / scaleCurrent - canvas.offsetTop + nekajY;

  //console.log(`Pritisk na: x: ${miskaX} in y: ${miskaY}`)

  // na kaj sem kliknil

  for (i = spomin.length; i >= 0; i--) {
    if (spomin[i]) {
      //oznacen = -1


      for (j = spomin[i][0].length; j >= 5; j--) {

        // console.log(spomin[i][0][j])

        let razdalja = 0
        let razdaljaMiska = 0
        if (spomin[i][0][j]) razdalja = Math.sqrt((spomin[i][0][j][0] - spomin[i][0][j - 1][0]) * (spomin[i][0][j][0] - spomin[i][0][j - 1][0]) + (spomin[i][0][j][1] - spomin[i][0][j - 1][1]) * (spomin[i][0][j][1] - spomin[i][0][j - 1][1]))
        if (spomin[i][0][j]) razdaljaMiska = Math.sqrt((spomin[i][0][j][0] - miskaX) * (spomin[i][0][j][0] - miskaX) + (spomin[i][0][j][1] - miskaY) * (spomin[i][0][j][1] - miskaY))

        if ((razdalja * 0.6 > razdaljaMiska || razdaljaMiska < 5) && razdalja) {
          //console.log(`razdalja: ${razdalja} in ${razdaljaMiska}`)
          //spomin[i][0][1] = "pink"
          oznacen = i
          narisiVse()
        }
      }


    }
  }

}



function elementNaLokacijiPremik(e) {



  let miskaXoff = miskaX - e.clientX / scaleCurrent - canvas.offsetLeft + nekajX
  let miskaYoff = miskaY - e.clientY / scaleCurrent - canvas.offsetTop + nekajY
  miskaX = e.clientX / scaleCurrent - canvas.offsetLeft + nekajX
  miskaY = e.clientY / scaleCurrent - canvas.offsetTop + nekajY


  if (oznacen >= 0) {
    //console.log(`premik: ${miskaXoff} in ${miskaYoff}`)

    if (spomin[oznacen]) {
      spomin[oznacen][0][0][0] -= miskaXoff
      spomin[oznacen][0][0][1] -= miskaYoff
      for (j = spomin[oznacen][0].length - 1; j >= 4; j--) {

        console.log(spomin[oznacen][0][j][0])
        spomin[oznacen][0][j][0] -= miskaXoff
        spomin[oznacen][0][j][1] -= miskaYoff
      }
    }
    narisiVse()

  }


}