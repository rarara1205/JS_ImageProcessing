
// 画像読み込み後の処理
function processImage() {
    var input = document.getElementById('inputImage');
    var output = document.getElementById('output');

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                // グレースケール変換
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var data = imageData.data;

                for (var i = 0; i < data.length; i += 4) {
                    var r = data[i];
                    var g = data[i + 1];
                    var b = data[i + 2];
                    var brightness = (r + g + b) / 3;
                    data[i] = brightness;
                    data[i + 1] = brightness;
                    data[i + 2] = brightness;
                }

                ctx.putImageData(imageData, 0, 0);

                // 処理後の画像を表示
                var outputImg = new Image();
                outputImg.src = canvas.toDataURL();
                output.appendChild(outputImg);
            }

            img.src = e.target.result;
        }

        reader.readAsDataURL(input.files[0]);
    }
}

// 画像選択時に処理を実行
var inputImage = document.getElementById('inputImage');
inputImage.addEventListener('change', processImage);