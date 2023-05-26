
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
let imageSize = getComputedStyle(document.querySelector(".outputImage")).width;
imageSize = imageSize.substring(0, imageSize.length - 2);

//canvas
let canvas = document.createElement("canvas");

//タグから要素取得
let input = document.getElementById("inputImage");
let returnSample = document.getElementById("returnSampleButton");
let outputOrigin = document.getElementById("outputOrigin");
let outputGray = document.getElementById("outputGray");
let outputBinary = document.getElementById("outputBinary");
let thresholdSlider = document.getElementById("thresholdSlider");
let threshold = thresholdSlider.value;

const sampleImgURL = outputOrigin.src;

ResizeOriginImg(sampleImgURL, outputOrigin, imageSize);
ProcessImage(sampleImgURL, outputGray, outputBinary);
outputGray.onload = function(){
    ResizeOtherImg(outputOrigin, outputGray);
}
outputBinary.onload = function(){
    ResizeOtherImg(outputOrigin, outputBinary);
}

//変更した際に通知
input.addEventListener("change", OutputImage);

returnSample.addEventListener("click", Reset);

thresholdSlider.addEventListener("input", ChageThreshold);

function Reset(){
    input.value = "";
    outputOrigin.src = sampleImgURL;
    outputOrigin.onload = function(){
        ResizeOriginImg(sampleImgURL, outputOrigin, imageSize);
        ProcessImage(sampleImgURL, outputGray, outputBinary);
        outputGray.onload = function(){
            ResizeOtherImg(outputOrigin, outputGray);
        }
        outputBinary.onload = function(){
            ResizeOtherImg(outputOrigin, outputBinary);
        }
    }
    
}

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

            ProcessImage(e.target.result, outputGray, outputBinary);
            
            outputGray.onload = function(){
                ResizeOtherImg(outputOrigin, outputGray);
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

function ProcessImage(originURL, outputGray, outputBinary){
    let img = new Image();
    img.src = originURL;
    let ctx = canvas.getContext("2d", {willReadFrequently: true});
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    let imgOrigin = ctx.getImageData(0, 0, img.width, img.height);
    let imgGray = ctx.createImageData(img.width, img.height);
    let imgBinary = ctx.createImageData(img.width, img.height);
    let imgOriginSize = imgOrigin.data.length;
    for(let i=0; i<imgOriginSize; i+=4){
        let y = Grayscale(imgOrigin.data[i], imgOrigin.data[i+1], imgOrigin.data[i+2]);
        imgGray.data[i] = y;
        imgGray.data[i+1] = y;
        imgGray.data[i+2] = y;
        imgGray.data[i+3] = imgOrigin.data[i+3];

        y = y > threshold ? 255 : 0;

        imgBinary.data[i] = y;
        imgBinary.data[i+1] = y;
        imgBinary.data[i+2] = y;
        imgBinary.data[i+3] = imgOrigin.data[i+3];
    }
    ctx.putImageData(imgGray, 0, 0);
    outputGray.src = canvas.toDataURL();
    ctx.putImageData(imgBinary, 0, 0);
    outputBinary.src = canvas.toDataURL();

}

function Grayscale(r, g, b){
    return parseInt(0.2126*r + 0.7152*g + 0.0722*b, 10);
}

function ChageThreshold(){
    threshold = thresholdSlider.value;
    let img = new Image();
    img.src = outputGray.src;
    let ctx = canvas.getContext("2d", {willReadFrequently: true});
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    let imgGray = ctx.getImageData(0, 0, img.width, img.height);
    let imgBinary = ctx.createImageData(img.width, img.height);
    let imgGraySize = imgGray.data.length;
    for(let i=0; i<imgGraySize; i+=4){
        let color = imgGray.data[i] > threshold ? 255 : 0;
        imgBinary.data[i] = color;
        imgBinary.data[i+1] = color;
        imgBinary.data[i+2] = color;
        imgBinary.data[i+3] = imgGray.data[i+3];
    }
    ctx.putImageData(imgBinary, 0, 0);
    outputBinary.src = canvas.toDataURL();
}