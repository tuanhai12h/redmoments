var ratio = Math.PI;
var imageWidth = 315,
	imageHeight = 160; // pixel

$(document).ready(function()
{
	document.addEventListener("deviceready", onDeviceReady, false);

	$('#image-editor').cropit(
	{
		imageBackground: true, 
		exportZoom: 2
	});

	$('#export').click(function() 
	{
		var imageData = $('.image-editor').cropit('export');
		if (!imageData)
		{
			return;
		}

		$('.image-editor').hide();
		$('.image-coke').show();

		convertImageLabel(imageData, function(data) 
		{
			makeLabelofBottle(data);
		});
	});

});

var makeLabelofBottle = function(imageData)
{
	var width = 552,
	height = 768; // this value if default of the image export

	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;

	// background
	canvasImage('img/background.png', function(response)
	{
		ctx.drawImage(response, 0, 0, width, height);

		canvasImage(imageData, function(data)
		{
			ctx.translate(270, 390);
			ctx.rotate(0.045);
			ctx.drawImage(data, 0, 0, 155, 125);
			ctx.rotate(-0.045);
			ctx.translate(-270, -390); 

			canvasImage('img/bottle_small.png', function(response)
			{
				ctx.drawImage(response, 0, 0, width, height);

				canvasImage(imageData, function(data)
				{
					ctx.drawImage(data, 99, 310, 195, 160);

					canvasImage('img/bottle_big.png', function(response)
					{
						ctx.drawImage(response, 0, 0, width, height);

						// background
						canvasImage('img/background_top.png', function(response)
						{
							ctx.drawImage(response, 0, 0, width, height);
						});
					});
				});
			});				
		});
	});
};

var convertImageLabel = function(dataURL, callback)
{
	var img = new Image();
	img.crossOrigin = 'anonymous';
	img.src = dataURL;

	img.onload = function()
	{
		var tempW = imageWidth;
		var tempH = imageHeight;

		tempWBottle = 2*tempW/ratio;

		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.height = tempH;
		canvas.width = tempW;       
		ctx.drawImage(this, 0, 0, tempW, tempH);

		var canvasBottle = document.createElement('canvas');
		var ctxBottle = canvasBottle.getContext('2d');
		canvasBottle.height = tempH;
		canvasBottle.width = tempWBottle;

		// convert pixel 
		var x = parseInt(tempW/2);
		while (x < tempW)
		{
			var value = tempW/2*Math.cos(x/tempW*Math.PI);
			value = 2*value/ratio;

			var pixel = ctx.getImageData(x, 0, 1, tempH);
			ctxBottle.putImageData(pixel, tempWBottle/2 - value, 0);

			var tx = tempW-x;
			var tpixel = ctx.getImageData(tx, 0, 1, tempH);
			ctxBottle.putImageData(tpixel, tempWBottle/2 + value, 0);

			x++;
		}

		var Output = canvasBottle.toDataURL('image/png');

		callback(Output);
	};
};

var canvasImage = function(dataURL, callback)
{
	var img = new Image();
	img.crossOrigin = 'anonymous';
	img.src = dataURL;

	img.onload = function()
	{
		callback(this);
	};
};

var onDeviceReady = function()
{
	// update permission when save
	var Permission = window.plugins.Permission;
	var permission = 'android.permission.WRITE_EXTERNAL_STORAGE';
	
	Permission.has(permission, 
		function(results) {
			if (!results[permission]) {
				Permission.request(permission, function(results) {
					if (result[permission]) {
						// permission is granted
						console.log('permission is granted');
					}
				});
			}
		}, function(error) {
			console.log(error);
		});

	$('#takePhoto').click(function()
	{
		navigator.camera.getPicture(
			function(imageData)
			{
				$('#image-editor').cropit('imageSrc', imageData);
			}, 
			function(error)
			{
				console.log('Failed because: ' + error);
			},
			{ 
				quality: 80,
				correctOrientation: true			
			}
		);
	});

	$('#saveImage').click(function()
	{
		var base64String = document.getElementById('imageCanvas').toDataURL('image/jpg');
		var params = {data: base64String, prefix: 'red_', format: 'JPG', quality: 80, mediaScanner: true};
		window.imageSaver.saveBase64Image(
			params,
			function (filePath) {
				alert('File saved on ' + filePath);
			},
			function (msg) {
				console.log(msg);
			}
		);
	});
};