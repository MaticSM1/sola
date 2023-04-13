let shraniIme = ""
let shraniI = 0
let shraniMail = ""


function oredi(ime, i) {
  i = Number(i)
  shraniI = i
  shraniIme = ime
  let html = `
  <span onclick="zapri()" style="cursor:pointer;padding: 2vh; font-size: 5vh; position: absolute; margin-top: 0px; top: 0px;  right: 0px; text-align: right;"><i class="fa fa-times"></i></span>
  <span onclick="zbrisi('${i}')" style="color: red; cursor:pointer;padding: 2vh; font-size: 5vh; position: absolute; margin-top: 0px; top: 0px;  left: 0px; text-align: left;"><i class="fa fa-trash"></i></span>
<h1>SPREMENI IME</h1>
<input oninput="vnos(this)" type="text" id="imePopUp" value="${ime}">

`

  document.getElementById("popUp").innerHTML = html
  document.getElementById("blure").style.display = "block"
  document.getElementById("popUp").style.display = "block"
}



function deli(ime, i) {
  i = Number(i)
  shraniI = i
  shraniMail = ime
  let html = `
  <span onclick="zapri2()" style="cursor:pointer;padding: 2vh; font-size: 5vh; position: absolute; margin-top: 0px; top: 0px;  right: 0px; text-align: right;"><i class="fa fa-times"></i></span>
<h1>VNESI EMAIL</h1>
<input oninput="vnos(this)" type="text" id="imePopUp">

`

  document.getElementById("popUp").innerHTML = html
  document.getElementById("blure").style.display = "block"
  document.getElementById("popUp").style.display = "block"
}


function zapri() {
  document.getElementById("blure").style.display = "none"
  document.getElementById("popUp").style.display = "none"
  sharni()
}

function zapri2() {
  document.getElementById("blure").style.display = "none"
  document.getElementById("popUp").style.display = "none"
  sharni2()
}


function vnos(ime) {
  shraniIme = document.getElementById("imePopUp").value
  console.log(shraniIme)
}

async function sharni() {
  let link = `/novoime?i=${shraniI}&ime=${shraniIme}`
  let html = await fetch(link)
  html.text().then(function (text) {
    console.log(text)
    location.reload()
  });

}

async function sharni2() {
  let link = `/dodajMail?mail=${shraniMail}&ime=${shraniIme}`
  let html = await fetch(link)
  html.text().then(function (text) {
    alert(text)
  });

}

async function zbrisi(i) {
  let link = `/zbrisiBoard?i=${i}`
  let html = await fetch(link)
  html.text().then(function (text) {
    console.log(text)
    location.reload()
  });

}

