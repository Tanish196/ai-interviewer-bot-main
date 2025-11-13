import { useState, useEffect, useRef, useCallback } from 'react';

//  useBehaviourTracking Hook
//  Tracks user behaviour during interview:
//  Eye gaze (focus, looking away) via WebGazer.js
//  Posture (shoulders, back, head tilt) via MediaPipe Pose
//  Movement jitter (nervousness indicators)
//  Returns: { startTracking, stopTracking, getBehaviourData, isTracking }

export const useBehaviourTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const metricsRef = useRef({
    gazeData: [],
    postureData: [],
    movementData: [],
    startTime: null,
    lastGazePoint: null,
    lastPoseKeypoints: null,
  });

  const trackingIntervalRef = useRef(null);
  const poseDetectionFrameRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);

  // Initialize WebGazer for eye tracking
  const initWebGazer = useCallback(async () => {
    try {
      // Dynamically import webgazer
      const webgazer = (await import('https://cdn.jsdelivr.net/npm/webgazer@3.0.0/dist/webgazer.min.js')).default;
      
      await webgazer
        .setGazeListener((data, timestamp) => {
          if (data == null || !isTracking) return;
          
          metricsRef.current.lastGazePoint = {
            x: data.x,
            y: data.y,
            timestamp,
          };
        })
        .begin();

      // Hide the default webgazer UI
      webgazer.showVideoPreview(false);
      webgazer.showPredictionPoints(false);

      // Calibration can be optional - remove overlay
      const webgazerCanvas = document.getElementById('webgazerVideoCanvas');
      if (webgazerCanvas) {
        webgazerCanvas.style.display = 'none';
      }

      return webgazer;
    } catch (error) {
      console.error('WebGazer initialization failed:', error);
      return null;
    }
  }, [isTracking]);

  // Initialize MediaPipe Pose for posture tracking
  const initMediaPipe = useCallback(async (videoElement) => {
    try {
      // Dynamically import MediaPipe
      const { Pose } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');
      const { Camera } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js');

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results) => {
        if (!isTracking || !results.poseLandmarks) return;
        
        metricsRef.current.lastPoseKeypoints = results.poseLandmarks;
      });

      await pose.initialize();
      poseRef.current = pose;

      // Start camera for pose detection
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          if (poseRef.current && videoElement.readyState >= 2) {
            await poseRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      camera.start();

      return pose;
    } catch (error) {
      console.error('MediaPipe initialization failed:', error);
      return null;
    }
  }, [isTracking]);

  // Compute gaze metrics
  const computeGazeMetrics = useCallback((gazeHistory) => {
    if (gazeHistory.length === 0) {
      return { offScreenPercent: 0, focusScore: 5 };
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let offScreenCount = 0;
    let gazeVariance = 0;
    
    gazeHistory.forEach((point, idx) => {
      // Check if gaze is off-screen
      if (point.x < 0 || point.x > screenWidth || point.y < 0 || point.y > screenHeight) {
        offScreenCount++;
      }
      
      // Compute variance (jitter)
      if (idx > 0) {
        const prev = gazeHistory[idx - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        gazeVariance += Math.sqrt(dx * dx + dy * dy);
      }
    });

    const offScreenPercent = (offScreenCount / gazeHistory.length) * 100;
    
    // Focus score: lower variance and less off-screen = higher score
    const avgVariance = gazeVariance / Math.max(1, gazeHistory.length - 1);
    const focusScore = Math.max(0, Math.min(10, 10 - (offScreenPercent / 10) - (avgVariance / 50)));

    return { offScreenPercent, focusScore };
  }, []);

  // Compute posture metrics
  const computePostureMetrics = useCallback((postureHistory) => {
    if (postureHistory.length === 0) {
      return { badPosturePercent: 0, postureScore: 5 };
    }

    let badPostureCount = 0;

    postureHistory.forEach((keypoints) => {
      if (!keypoints || keypoints.length < 33) return;

      // Key landmarks: shoulders (11, 12), nose (0), hips (23, 24)
      const leftShoulder = keypoints[11];
      const rightShoulder = keypoints[12];
      const nose = keypoints[0];
      const leftHip = keypoints[23];
      const rightHip = keypoints[24];

      if (!leftShoulder || !rightShoulder || !nose || !leftHip || !rightHip) return;

      // Check shoulder alignment (slouching)
      const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const isShoulderMisaligned = shoulderYDiff > 0.1;

      // Check head tilt
      const headTilt = Math.abs(nose.x - (leftShoulder.x + rightShoulder.x) / 2);
      const isHeadTilted = headTilt > 0.15;

      // Check back alignment (leaning forward/backward)
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipMidY = (leftHip.y + rightHip.y) / 2;
      const backSlope = Math.abs(shoulderMidY - hipMidY);
      const isBadBack = backSlope < 0.3 || backSlope > 0.5;

      if (isShoulderMisaligned || isHeadTilted || isBadBack) {
        badPostureCount++;
      }
    });

    const badPosturePercent = (badPostureCount / postureHistory.length) * 100;
    const postureScore = Math.max(0, Math.min(10, 10 - (badPosturePercent / 10)));

    return { badPosturePercent, postureScore };
  }, []);

  // Compute movement jitter
  const computeMovementMetrics = useCallback((postureHistory) => {
    if (postureHistory.length < 2) {
      return { movementJitterScore: 0 };
    }

    let totalMovement = 0;
    let rapidMovementCount = 0;

    for (let i = 1; i < postureHistory.length; i++) {
      const prev = postureHistory[i - 1];
      const curr = postureHistory[i];

      if (!prev || !curr || prev.length < 33 || curr.length < 33) continue;

      // Track nose movement (head movement)
      const prevNose = prev[0];
      const currNose = curr[0];

      if (!prevNose || !currNose) continue;

      const dx = currNose.x - prevNose.x;
      const dy = currNose.y - prevNose.y;
      const movement = Math.sqrt(dx * dx + dy * dy);

      totalMovement += movement;

      // Rapid movement indicates nervousness
      if (movement > 0.05) {
        rapidMovementCount++;
      }
    }

    const avgMovement = totalMovement / Math.max(1, postureHistory.length - 1);
    const movementJitterScore = Math.min(10, (rapidMovementCount / postureHistory.length) * 100 + avgMovement * 100);

    return { movementJitterScore };
  }, []);

  // Log metrics every second
  const logMetrics = useCallback(() => {
    const { lastGazePoint, lastPoseKeypoints, gazeData, postureData, movementData } = metricsRef.current;

    if (lastGazePoint) {
      gazeData.push({ ...lastGazePoint });
    }

    if (lastPoseKeypoints) {
      postureData.push([...lastPoseKeypoints]);
    }

    // Keep only last 60 seconds of data to avoid memory issues
    if (gazeData.length > 60) gazeData.shift();
    if (postureData.length > 60) postureData.shift();
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    setIsTracking(true);
    metricsRef.current = {
      gazeData: [],
      postureData: [],
      movementData: [],
      startTime: Date.now(),
      lastGazePoint: null,
      lastPoseKeypoints: null,
    };

    // Initialize WebGazer
    await initWebGazer();

    // Initialize MediaPipe Pose (reuse existing video element if available)
    const existingVideo = document.querySelector('video');
    if (existingVideo) {
      videoRef.current = existingVideo;
      await initMediaPipe(existingVideo);
    }

    // Start logging every second
    trackingIntervalRef.current = setInterval(logMetrics, 1000);
  }, [initWebGazer, initMediaPipe, logMetrics]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    setIsTracking(false);

    // Stop WebGazer
    try {
      const webgazer = window.webgazer;
      if (webgazer) {
        webgazer.end();
      }
    } catch (error) {
      console.error('Error stopping WebGazer:', error);
    }

    // Stop MediaPipe
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }

    // Clear intervals
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  // Get final behaviour data
  const getBehaviourData = useCallback(() => {
    const { gazeData, postureData, startTime } = metricsRef.current;
    const duration = (Date.now() - startTime) / 1000; // seconds

    // Compute metrics
    const { offScreenPercent, focusScore } = computeGazeMetrics(gazeData);
    const { badPosturePercent, postureScore } = computePostureMetrics(postureData);
    const { movementJitterScore } = computeMovementMetrics(postureData);

    // Compute final behaviour score: 40% eye + 40% posture + 20% jitter
    const eyeComponent = focusScore * 0.4;
    const postureComponent = postureScore * 0.4;
    const jitterComponent = Math.max(0, 10 - movementJitterScore) * 0.2;
    const behaviourScore = Math.round((eyeComponent + postureComponent + jitterComponent) * 10) / 10;

    return {
      duration,
      offScreenPercent: Math.round(offScreenPercent * 10) / 10,
      focusScore: Math.round(focusScore * 10) / 10,
      badPosturePercent: Math.round(badPosturePercent * 10) / 10,
      postureScore: Math.round(postureScore * 10) / 10,
      movementJitterScore: Math.round(movementJitterScore * 10) / 10,
      behaviourScore,
      sampleCount: {
        gaze: gazeData.length,
        posture: postureData.length,
      },
    };
  }, [computeGazeMetrics, computePostureMetrics, computeMovementMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    startTracking,
    stopTracking,
    getBehaviourData,
    isTracking,
  };
};

export default useBehaviourTracking;
