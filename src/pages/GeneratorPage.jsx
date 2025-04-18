import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { compress as brotliCompress } from "fflate";

const GeneratorPage = () => {
  const [chunkSize, setChunkSize] = useState(50);
  const [intervalTime, setIntervalTime] = useState(250);

  const [isCycling, setIsCycling] = useState(false);

  const [fileContent, setFileContent] = useState("");
  const [qrImages, setQrImages] = useState([]);
  const [oldSettings, setOldSettings] = useState({
    fileContent: fileContent,
    chunkSize: chunkSize,
  });

  const canvasRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const currentImageIndexRef = useRef(0);

  const [currentIndexDisplay, setCurrentIndexDisplay] = useState(0);

  const navigate = useNavigate();

  const generateQrCodes = async (callback) => {
    if (
      JSON.stringify(oldSettings) ==
      JSON.stringify({
        fileContent: fileContent,
        chunkSize: chunkSize,
      })
    ) {
      callback(qrImages);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      "Generating QR codes... Please wait.",
      canvas.width / 2,
      canvas.height / 2
    );

    const encoder = new TextEncoder();
    const encodedText = encoder.encode(fileContent);
    const compressed = btoa(
      String.fromCharCode(
        ...(await new Promise((resolve, reject) => {
          brotliCompress(encodedText, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }))
      )
    );

    const numChunks = Math.ceil(compressed.length / chunkSize);
    const realChunkSize = Math.ceil(compressed.length / numChunks);

    const chunks = [];
    for (let i = 0; i < compressed.length; i += realChunkSize) {
      const chunk = compressed.slice(i, i + realChunkSize);
      chunks.push(chunk);
    }

    const newQrImages = [];
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const canvas = document.createElement("canvas");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText(
        `Generating QR codes... Please wait.`,
        canvas.width / 2,
        canvas.height / 2
      );
      ctx.fillText(
        `Chunk ${index + 1} of ${chunks.length}`,
        canvas.width / 2,
        canvas.height / 2 + 20
      );
      await new Promise((resolve, reject) => {
        QRCode.toCanvas(
          canvas,
          JSON.stringify({
            id: `${index + 1}${index + 1 == chunks.length ? "_" : ""}`,
            data: `${chunk}`,
          }),
          {
            scale: 50,
            margin: 1,
            errorCorrectionLevel: "H",
          },
          function (error) {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log(`QR code for chunk ${index + 1} generated`);
              const imageUrl = canvas.toDataURL("image/png");
              newQrImages.push(imageUrl);

              if (newQrImages.length === chunks.length) {
                setQrImages(newQrImages);
                callback(newQrImages);
              }
              resolve();
            }
          }
        );
      });

      await new Promise((r) => setTimeout(r, 0));
    }
  };

  const startCycling = () => {
    setOldSettings({
      fileContent: fileContent,
      chunkSize: chunkSize,
    });
    if (fileContent) {
      generateQrCodes((images) => {
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
