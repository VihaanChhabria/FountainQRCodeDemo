import { useEffect, useState } from "react";
import QrScanner from "qr-scanner";
import { useNavigate } from "react-router-dom";

function ScannerPage() {
  const [scannedData, setScannedData] = useState([]);
  const [finishedScan, setFinishedScan] = useState(false);
  const navigate = useNavigate();

  const onScan = (result) => {
    const jsonResult = JSON.parse(result.data);

    setScannedData((prevData) => {
      const isRescanned = prevData.some((item) => item.id === jsonResult.id);
      if (isRescanned) {
        return prevData;
      }

      return [...prevData, jsonResult].sort((a, b) => {
        const idA = parseInt(a.id.replace("_", ""));
        const idB = parseInt(b.id.replace("_", ""));
        return idA - idB;
      });
    });
  };

  useEffect(() => {
    const qrScanner = new QrScanner(
      document.getElementById("qr-video"),
      (result) => onScan(result),
      { highlightScanRegion: true, highlightCodeOutline: true }
    );

    qrScanner
      .start()
      .catch((err) => console.error("QR Scanner failed to start:", err));

    return () => {
      qrScanner.stop();
    };
  }, []);

  useEffect(() => {
    if (scannedData.length === 0) {
      return;
    }
    let isLastDataReceived = false;
    let lastDataID = parseInt(scannedData[0].id.replace("_", ""));
    let sequenceValid = true;

    for (let dataIndex = 0; dataIndex < scannedData.length; dataIndex++) {
      const dataID = scannedData[dataIndex].id;
      const dataIDNum = dataID.replace("_", "");

      if (dataID !== dataIDNum) {
        isLastDataReceived = true;
      }

      if (parseInt(dataIDNum) - 1 == lastDataID) {
        lastDataID = parseInt(dataIDNum);
      } else if (dataIndex !== 0) {
        sequenceValid = false;
        break;
      }
    }

    const totalNeededParts = parseInt(
      scannedData[scannedData.length - 1].id.replace("_", "")
    );
    if (
      sequenceValid &&
      isLastDataReceived &&
      scannedData.length == totalNeededParts
    ) {
      setFinishedScan(true);
    }
  }, [scannedData]);

  const compileAndDownload = () => {
    const combinedData = scannedData.map((data) => data.data).join("");
    const blob = new Blob([combinedData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiled_data.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: "15%",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <video id="qr-video" style={{ width: "50%", height: "auto" }}></video>
      <h3>Data is {!finishedScan && "NOT"} fully scanned</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <button onClick={compileAndDownload}>
          Compile And Download Data
        </button>
        <button onClick={() => setScannedData([])}>
          Clear Data
        </button>
      </div>

      <button
        style={{ marginTop: "2%" }}
        onClick={() => navigate("/")}
      >
        Go To Home Page
      </button>
    </div>
  );
}

export default ScannerPage;
