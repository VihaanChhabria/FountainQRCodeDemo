import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        Fountain QR Code Demo
      </h1>
      <h4 style={{ width: "55%" }}>
        Fountain QR codes are a simple way to share information efficiently
        without the hassle of needing to scan manually scan many QR codes.
      </h4>

      <h4 style={{ width: "55%" }}>
        Find more information about it{" "}
        <a href="https://aidunlin.com/qrfcodes">here</a> and{" "}
        <a href="https://divan.dev/posts/fountaincodes/">here</a>.
      </h4>

      <h4 style={{ width: "55%" }}>
        This project is open source. Check out the repository on{" "}
        <a href="https://github.com/VihaanChhabria/FountainQRCodeDemo">
          GitHub
        </a>
        .
      </h4>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          gap: "5%",
        }}
      >
        <button className="card" onClick={() => navigate("scanner")}>
          Scanner Page
        </button>
        <button className="card" onClick={() => navigate("generator")}>
          Generator Page
        </button>
      </div>
      <footer
        style={{
          position: "absolute",
          bottom: "10px",
          fontSize: "0.9rem",
        }}
      >
        Created by Vihaan Chhabria
      </footer>
    </div>
  );
};

export default HomePage;
