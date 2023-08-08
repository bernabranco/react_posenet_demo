import React, { useRef, useEffect } from "react";
import * as posenet from "@tensorflow-models/posenet";
import * as styles from "./PoseNetComponent.styles";

const PoseNetComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamSize = 400;

  useEffect(() => {
    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          //  video width and height must be defined!
          videoRef.current.width = streamSize;
          videoRef.current.height = streamSize;
        }
      }
    };

    const detectPose = async () => {
      const net = await posenet.load();

      setInterval(async () => {
        if (videoRef.current) {
          const pose = await net.estimateSinglePose(videoRef.current);

          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            canvasRef.current.width = videoRef.current.width;
            canvasRef.current.height = videoRef.current.height;

            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.drawImage(
              videoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );

            drawPose(pose.keypoints, ctx);

            // Log keypoints' values
            pose.keypoints.forEach((keypoint) => {
              console.log(
                `${keypoint.part}: (${keypoint.position.x},${keypoint.position.y})`
              );
            });
          }
        }
      }, 100); // Adjust the interval for your desired frame rate
    };

    const drawPose = (keypoints, ctx) => {
      keypoints.forEach((keypoint) => {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
      });

      keypoints.forEach((keypoint) => {
        if (keypoint.part !== "nose") {
          const { x, y } = keypoint.position;
          ctx.beginPath();
          ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = "#00FF00";
          ctx.stroke();
        }
      });
    };

    setupCamera();
    detectPose();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Skeleton Detection with React and PoseNet</h1>
      <p>This is a small demo of how to create a React app using Posenet</p>
      <p>
        It was made and shared to give developers a quick and out of the box way
      </p>
      <p>
        to start working with realtime skeleton detection in their React
        projects.
      </p>
      <div style={styles.posenetContainer}>
        <video ref={videoRef} autoPlay muted />
        <canvas style={styles.canvas} ref={canvasRef} />
      </div>
    </div>
  );
};

export default PoseNetComponent;
