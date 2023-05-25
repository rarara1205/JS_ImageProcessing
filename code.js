
// // 画像読み込み後の処理
// function processImage() {
//     var input = document.getElementById('inputImage');
//     var output = document.getElementById('output');

//     if (input.files && input.files[0]) {
//         var reader = new FileReader();

//         reader.onload = function(e) {
//             var img = new Image();
//             img.onload = function() {
//                 // グレースケール変換
//                 var canvas = document.createElement('canvas');
//                 var ctx = canvas.getContext('2d');
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//                 ctx.drawImage(img, 0, 0);
//                 var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//                 var data = imageData.data;

//                 for (var i = 0; i < data.length; i += 4) {
//                     var r = data[i];
//                     var g = data[i + 1];
//                     var b = data[i + 2];
//                     var brightness = (r + g + b) / 3;
//                     data[i] = brightness;
//                     data[i + 1] = brightness;
//                     data[i + 2] = brightness;
//                 }

//                 ctx.putImageData(imageData, 0, 0);

//                 // 処理後の画像を表示
//                 var outputImg = new Image();
//                 outputImg.src = canvas.toDataURL();
//                 output.appendChild(outputImg);
//             }

//             img.src = e.target.result;
//         }

//         reader.readAsDataURL(input.files[0]);
//     }
// }

// // 画像選択時に処理を実行
// var inputImage = document.getElementById('inputImage');
// inputImage.addEventListener('change', processImage);

//画像のサイズ
const imageSize = 500;

//二値化の閾値
const THRESHOLD = 128;

//canvas
let canvas = document.createElement("canvas");

//タグから要素取得
let input = document.getElementById("inputImage");
let outputOrigin = document.getElementById("outputOrigin");
let outputGlay = document.getElementById("outputGlay");
let outputBinary = document.getElementById("outputBinary");

//変更した際に通知
input.addEventListener("change", OutputImage);

function OutputImage(){
    
    
    //ファイル読み込みクラス
    let reader = new FileReader();

    //読み込んだファイルのURLをresultに格納
    reader.readAsDataURL(input.files[0]);
    
    //読み込みが完了次第，画像のURLをsrcに格納して表示
    reader.onload = function(e){
        outputOrigin.src = e.target.result;
        outputOrigin.onload = function(){
            
            ResizeOriginImg(e.target.result, outputOrigin, imageSize);

            ProcessImage(e.target.result, outputGlay, outputBinary);
            
            outputGlay.onload = function(){
                ResizeOtherImg(outputOrigin, outputGlay);
            }
            outputBinary.onload = function(){
                ResizeOtherImg(outputOrigin, outputBinary);
            }
            
        }

        
    }
}

//画像の縦横比を保ったままサイズ変更
function ResizeOriginImg(originURL, targetImg, resizeValue){
    let img = new Image();
    img.src = originURL;
    img.onload = function(){
        let width = img.width;
        let height = img.height;
        if(width > height){
            targetImg.width = resizeValue;
            targetImg.height = height * (resizeValue / width);
        }
        else{
            targetImg.height = resizeValue;
            targetImg.width = width * (resizeValue / height)
        }
    }
}

function ResizeOtherImg(originImg, targetImg){
    targetImg.width = originImg.width;
    targetImg.height = originImg.height;
}

function ProcessImage(originURL, outputGlay, outputBinary){
    let img = new Image();
    img.src = originURL;
    let ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    let imgOrigin = ctx.getImageData(0, 0, img.width, img.height);
    let imgGlay = ctx.createImageData(img.width, img.height);
    let imgBinary = ctx.createImageData(img.width, img.height);
    const CIE = [0.2126, 0.7152, 0.0722];
    for(let i=0; i<imgOrigin.data.length; i+=4){
        let y = CIE[0] * imgOrigin.data[i] + CIE[1] * imgOrigin.data[i+1] + CIE[2] * imgOrigin.data[i+2];
        y = parseInt(y, 10);
        imgGlay.data[i] = y;
        imgGlay.data[i+1] = y;
        imgGlay.data[i+2] = y;
        imgGlay.data[i+3] = imgOrigin.data[i+3];

        if(y > THRESHOLD){
            y = 255;
        }
        else{
            y = 0;
        }
        imgBinary.data[i] = y;
        imgBinary.data[i+1] = y;
        imgBinary.data[i+2] = y;
        imgBinary.data[i+3] = imgOrigin.data[i+3];
    }
    ctx.putImageData(imgGlay, 0, 0);
    outputGlay.src = canvas.toDataURL();
    ctx.putImageData(imgBinary, 0, 0);
    outputBinary.src = canvas.toDataURL();

}