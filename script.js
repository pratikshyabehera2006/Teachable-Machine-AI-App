const URL = "my_model/";

let model, webcam, labelContainer, maxPredictions;

// Store user-provided data
let userData = {};

async function init() {
    try {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();

        webcam = new tmImage.Webcam(300, 300, true);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        document.getElementById("webcam-container").innerHTML = "";
        document.getElementById("webcam-container").appendChild(webcam.canvas);

        labelContainer = document.getElementById("label-container");

    } catch (error) {
        console.error(error);
        alert("Error loading model!");
    }
}

async function loop() {
    webcam.update();
    await predict();
    requestAnimationFrame(loop); // smoother rendering
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let best = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > best.probability) {
            best = prediction[i];
        }
    }

    labelContainer.innerHTML = `
        <div style="font-size:22px; font-weight:bold;">
            Prediction: ${best.className}
        </div>
        <div style="margin-top:10px;">
            Confidence: ${(best.probability * 100).toFixed(2)}%
        </div>
    `;
}

// Add new class
function addClass() {
    const className = document.getElementById("className").value.trim();

    if (className === "") {
        document.getElementById("status").innerText = "Enter class name!";
        return;
    }

    if (!userData[className]) {
        userData[className] = [];
        document.getElementById("status").innerText = "Class added: " + className;
    } else {
        document.getElementById("status").innerText = "Class already exists!";
    }
}

// Capture image
function captureImage() {
    const className = document.getElementById("className").value.trim();

    if (!className || !userData[className]) {
        document.getElementById("status").innerText = "Add class first!";
        return;
    }

    const image = webcam.canvas.toDataURL("image/png");
    userData[className].push(image);

    document.getElementById("status").innerText =
        "Captured for " + className + " | Total: " + userData[className].length;
}
