let img;
let circles = [];
let maxCircles = 5000;
let minRadius = 2;
let maxRadius = 8; // 10;
let imageUploaded = false;
let myp5; // Declare p5 instance variable
const maxSize = 600; // Maximum size of the longest side
let downloadButton;

new p5(p => {
  myp5 = p;
  p.setup = function() {
    canvas = p.createCanvas(400, 400);
    canvas.parent('canvas-container');
    p.background(220);
    
    const fileInput = document.getElementById('imageUpload');
    fileInput.addEventListener('change', handleFileSelect);

    downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', downloadImage);
  }
    
  function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
          myp5.loadImage(URL.createObjectURL(file), image => {
              img = image;
              
              // Calculate resize dimensions
              let newWidth, newHeight;
              if (img.width > img.height) {
                  newWidth = Math.min(img.width, maxSize);
                  newHeight = (img.height / img.width) * newWidth;
              } else {
                  newHeight = Math.min(img.height, maxSize);
                  newWidth = (img.width / img.height) * newHeight;
              }
               
              // Resize image
              img.resize(newWidth, newHeight);

              // Resize the canvas to the image size
               myp5.resizeCanvas(img.width, img.height);
               
              packCircles();
              imageUploaded = true;
              downloadButton.disabled = false;
          });
      }
  }


  p.draw = function() {
      if (!imageUploaded) return;

      p.background(220);
      
      //draw the image to check where it should be drawn
      p.image(img, 0, 0);


      for (let circle of circles) {
           if(circle && circle.color){
              p.fill(circle.color);
          } else {
            p.fill(255, 0, 255);
          }
          if (circle && typeof circle.x === 'number' && typeof circle.y === 'number' && typeof circle.r === 'number') {
              p.stroke(0);
              p.ellipse(circle.x, circle.y, (circle.r + 1) * 2);
          }
      }

  }

    function packCircles() {
        circles = [];
        let attempts = 0;
        while (circles.length < maxCircles && attempts < maxCircles * 5) {
            attempts++;

            let newCircle = {
                r: minRadius
            };
            // Ensure circle center is within bounds
            newCircle.x = p.random(newCircle.r, img.width - newCircle.r);
            newCircle.y = p.random(newCircle.r, img.height - newCircle.r);

            // Get pixel colour
            const pixelColor = img.get(Math.floor(newCircle.x), Math.floor(newCircle.y));

            // if pixel color is not transparent continue
            if(pixelColor && pixelColor[3] !== 0){
                    // Get average brightness and map to radius
                    const brightness = (pixelColor[0] + pixelColor[1] + pixelColor[2]) / 3;
                    newCircle.r = p.map(brightness, 0, 255, minRadius, maxRadius);

                    // set colour
                    newCircle.color = p.color(pixelColor[0], pixelColor[1], pixelColor[2]);


                let valid = true;
                for (let other of circles) {
                    let d = p.dist(newCircle.x, newCircle.y, other.x, other.y);
                    if (d < newCircle.r + other.r) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    circles.push(newCircle);
                }
            }
        }
    }


  function downloadImage() {
      p.saveCanvas('circle_packing', 'png');
  }

});