import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";

const GeneratorPage = () => {
  const [chunkSize, setChunkSize] = useState(50);
  const [intervalTime, setIntervalTime] = useState(250);

  const [isCycling, setIsCycling] = useState(false);

  const [fileContent, setFileContent] = useState("");
  const [qrImages, setQrImages] = useState([]);

  const canvasRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const currentImageIndexRef = useRef(0);

  const [currentIndexDisplay, setCurrentIndexDisplay] = useState(0);

  const navigate = useNavigate();

  const generateQrCodes = (text, chunkSize, callback) => {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);
    const chunks = [];

    for (let i = 0; i < encodedText.length; i += chunkSize) {
      const chunk = encodedText.slice(i, i + chunkSize);
      chunks.push(new TextDecoder().decode(chunk));
    }

    const newQrImages = [];
    chunks.forEach((chunk, index) => {
      const canvas = document.createElement("canvas");

      QRCode.toCanvas(
        canvas,
        JSON.stringify({
          id: `${index + 1}${index + 1 == chunks.length ? "_" : ""}`,
          data: `${chunk}`,
        }),
        {
          scale: 50,
          margin: 1,
          errorCorrectionLevel: 'H',
        },
        function (error) {
          if (error) console.error(error);
          else {
            console.log(`QR code for chunk ${index + 1} generated`);
            const imageUrl = canvas.toDataURL("image/png");
            newQrImages.push(imageUrl);

            if (newQrImages.length === chunks.length) {
              setQrImages(newQrImages);
              callback(newQrImages);
            }
          }
        }
      );
    });
  };

  const startCycling = () => {
    if (fileContent) {
      generateQrCodes(fileContent, chunkSize, (images) => {
        setIsCycling(true);
        currentImageIndexRef.current = 0;

        cycleIntervalRef.current = setInterval(() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          const image = new Image();
          image.src = images[currentImageIndexRef.current];
          image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };

          setCurrentIndexDisplay(currentImageIndexRef.current + 1);

          currentImageIndexRef.current =
            (currentImageIndexRef.current + 1) % images.length;
        }, intervalTime);
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <h3>Input Your File</h3>
      <input
        type="file"
        accept=""
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target.result;
              setFileContent(text);
            };
            reader.readAsText(file);
          }
        }}
      />
      <div style={{ marginTop: "20px", width: "300px" }}>
        <label htmlFor="chunkSizeSlider">Chunk Size: {chunkSize}</label>
        <input
          id="chunkSizeSlider"
          type="range"
          min="1"
          max="2953"
          step="2"
          value={chunkSize}
          onChange={(e) => setChunkSize(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: "20px", width: "300px" }}>
        <label htmlFor="intervalSlider">Interval Time: {intervalTime}ms</label>
        <input
          id="intervalSlider"
          type="range"
          min="1"
          max="2000"
          step="2"
          value={intervalTime}
          onChange={(e) => setIntervalTime(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{
          marginTop: "20px",
          border: "1px solid black",
          width: "300px",
          height: "300px",
        }}
      ></canvas>
      <h3 style={{ marginBottom: "0" }}>
        {qrImages.length > 0
          ? `${(currentIndexDisplay % qrImages.length) + 1} / ${
              qrImages.length
            }`
          : "0 / 0"}
      </h3>
      <div style={{ marginTop: "20px", display: "flex", gap: "5%" }}>
        <button onClick={startCycling} disabled={isCycling}>
          Start
        </button>
        <button
          onClick={() => {
            setQrImages([]);
            setIsCycling(false);
            clearInterval(cycleIntervalRef.current);
          }}
          disabled={!isCycling}
        >
          Stop
        </button>
      </div>

      <button
        className="card"
        style={{ marginTop: "2%" }}
        onClick={() => navigate("/")}
      >
        Go To Home Page
      </button>
    </div>
  );
};

export default GeneratorPage;
