
//画像のサイズ
let imageSize = getComputedStyle(document.querySelector(".outputImage")).width;
imageSize = imageSize.substring(0, imageSize.length - 2);

//canvas
let canvas = document.createElement("canvas");

//タグから要素取得
let input = document.getElementById("inputImage");
let returnSample = document.getElementById("returnSampleButton");
let outputIMG = document.getElementById("outputIMG");
// let outputGray = document.getElementById("outputGray");
// let outputBinary = document.getElementById("outputBinary");
let selectProcess = document.getElementById("selectProcess");
let nowProcess = "default";
let [threshold, thresholdSlider, thresholdElements] = CreateSlider();

const sampleImgURL = outputIMG.src;
let outputOriginURL = sampleImgURL;
let outputGrayURL;
let outputBinaryURL;

ResizeOriginImg(sampleImgURL, outputIMG, imageSize);
ProcessImage(sampleImgURL);
CreateBG();
// outputGray.onload = function(){
//     ResizeOtherImg(outputIMG, outputGray);
// }
// outputBinary.onload = function(){
//     ResizeOtherImg(outputIMG, outputBinary);
// }

//変更した際に通知
input.addEventListener("change", OutputImage);
selectProcess.addEventListener("change", ChangeProcess);
returnSample.addEventListener("click", Reset);


function DisplayElement(parentId, childElement){
    document.getElementById(parentId).appendChild(childElement);
}

function HideElement(parentId, childElement){
    document.getElementById(parentId).removeChild(childElement);
}

function Reset(){
    input.value = "";
    thresholdSlider.value = 128;
    threshold = 128;
    outputIMG.src = sampleImgURL;
    outputOriginURL = sampleImgURL;
    outputIMG.onload = function(){
        ResizeOriginImg(sampleImgURL, outputIMG, imageSize);
        ProcessImage(sampleImgURL);
        // outputGray.onload = function(){
        //     ResizeOtherImg(outputIMG, outputGray);
        // }
        // outputBinary.onload = function(){
        //     ResizeOtherImg(outputIMG, outputBinary);
        // }
    }
    selectProcess.value = "default";
    if(nowProcess=="binary"){
        HideElement("output", thresholdElements);
    }
    nowProcess = "default";
}

function OutputImage(){
    
    
    //ファイル読み込みクラス
    let reader = new FileReader();

    //読み込んだファイルのURLをresultに格納
    reader.readAsDataURL(input.files[0]);
    
    //読み込みが完了次第，画像のURLをsrcに格納して表示
    reader.onload = function(e){
        outputIMG.src = e.target.result;
        outputOriginURL = e.target.result;
        outputIMG.onload = function(){
            
            ResizeOriginImg(e.target.result, outputIMG, imageSize);

            ProcessImage(e.target.result);
            
            // outputGray.onload = function(){
            //     ResizeOtherImg(outputIMG, outputGray);
            // }
            // outputBinary.onload = function(){
            //     ResizeOtherImg(outputIMG, outputBinary);
            // }
        }
    }

    selectProcess.value = "default";
    if(nowProcess=="binary"){
        HideElement("output", thresholdElements);
    }
    nowProcess = "default";
    thresholdSlider.value = 128;
    threshold = 128;
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

function ProcessImage(originURL){
    let img = new Image();
    img.src = originURL;
    img.onload = function(){
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
        outputGrayURL = canvas.toDataURL();
        ctx.putImageData(imgBinary, 0, 0);
        outputBinaryURL = canvas.toDataURL();
    }
}

function Grayscale(r, g, b){
    return parseInt(0.2126*r + 0.7152*g + 0.0722*b, 10);
}

function CreateSlider(){
    let thresholdElements = document.createElement("p");
    let thresholdTextNode = document.createElement("閾値");
    thresholdElements.appendChild(thresholdTextNode);
    let thresholdSlider = document.createElement("input");
    thresholdSlider.id = "thresholdSlider";
    thresholdSlider.type = "range";
    thresholdSlider.min = "0";
    thresholdSlider.max = "255";
    thresholdSlider.step = "1";
    thresholdSlider.value = "128";
    thresholdSlider.class = "inputRange";
    thresholdSlider.addEventListener("input", ChangeThreshold);
    thresholdElements.appendChild(thresholdSlider);
    let threshold = thresholdSlider.value;
    return [threshold, thresholdSlider, thresholdElements];
}

function ChangeThreshold(){
    threshold = thresholdSlider.value;
    let img = new Image();
    img.src = outputGrayURL;
    img.onload = function(){
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
        outputBinaryURL = canvas.toDataURL();
        outputIMG.src = outputBinaryURL;
    }
}

function CreateBG(){
    let ctx = canvas.getContext("2d", {willReadFrequently: true});
    canvas.width = imageSize;
    canvas.height = imageSize;
    let imgBG = ctx.createImageData(imageSize, imageSize);
    let division = 16;
    division = imageSize/division;
    let nowColor = 128;
    let nextColor = 255;
    for(let y=0; y<imageSize; y++){
        if(y % division == 0){
            [nowColor, nextColor] = [nextColor, nowColor];
        }
        for(let x=0; x<imageSize; x++){
            let index = (x + y * imageSize) * 4;
            if(x % division == 0){
                [nowColor, nextColor] = [nextColor, nowColor];
            }
            imgBG.data[index] = nowColor;
            imgBG.data[index+1] = nowColor;
            imgBG.data[index+2] = nowColor;
            imgBG.data[index+3] = 255;
        }
    }
    ctx.putImageData(imgBG, 0, 0);
    let elements = document.getElementsByClassName("outputImage");
    for(i=0; i<elements.length; i++){
        elements[i].style.backgroundImage = "url("+canvas.toDataURL()+")";
    }
}

function ChangeProcess(){
    if(nowProcess=="binary" && selectProcess.value != "default"){
        HideElement("output", thresholdElements);
    }

    switch(selectProcess.value){
        case "origin":
            outputIMG.src = outputOriginURL;
            break;
        case "grayscale":
            outputIMG.src = outputGrayURL;
            break;
        case "binary":
            outputIMG.src = outputBinaryURL;
            DisplayElement("output", thresholdElements);
            break;
    }
    if(selectProcess.value!="default"){
        nowProcess = selectProcess.value;
    }
}