import { useState, useEffect, useRef, useCallback } from 'react';

//  useBehaviourTracking Hook
//  Tracks user behaviour during interview:
//  Eye gaze (focus, looking away) via WebGazer.js
//  Posture (shoulders, back, head tilt) via MediaPipe Pose
//  Movement jitter (nervousness indicators)
//  Returns: { startTracking, stopTracking, getBehaviourData, isTracking }

export const useBehaviourTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const isTrackingRef = useRef(false);
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

  const LOG_INTERVAL_MS = 500;

  // Initialize WebGazer for eye tracking
  const initWebGazer = useCallback(async () => {
    try {
      // Dynamically import webgazer from local package
      const webgazerModule = await import('webgazer');
      const webgazer = webgazerModule.default || webgazerModule;
      
      await webgazer
        .setGazeListener((data, timestamp) => {
          if (data == null || !isTrackingRef.current) return;
          
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
  }, []);

  // Initialize MediaPipe Pose for posture tracking
  const initMediaPipe = useCallback(async (videoElement) => {
    try {
      // Dynamically import MediaPipe from local package
      const { Pose } = await import('@mediapipe/pose');

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

      // Start manual video frame processing loop (replaces Camera utils)
      const processFrame = async () => {
        if (poseRef.current && videoElement.readyState >= 2 && isTrackingRef.current) {
          await poseRef.current.send({ image: videoElement });
        }

        if (isTrackingRef.current) {
          poseDetectionFrameRef.current = requestAnimationFrame(processFrame);
        }
      };

      poseDetectionFrameRef.current = requestAnimationFrame(processFrame);

      return pose;
    } catch (error) {
      console.error('MediaPipe initialization failed:', error);
      return null;
    }
  }, []);

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

    const avgVariance = gazeVariance / Math.max(1, gazeHistory.length - 1);
    const normalizedVariance = Math.min(1, avgVariance / 180); // 0-1 scale ~180px variance
    const offScreenRatio = Math.min(1, offScreenPercent / 100);

    const focusQuality = (1 - offScreenRatio) * 0.6 + (1 - normalizedVariance) * 0.4;
    const focusScore = Math.round(Math.max(0, Math.min(1, focusQuality)) * 100) / 10;

    return { offScreenPercent, focusScore };
  }, []);

  // Compute posture metrics
  const computePostureMetrics = useCallback((postureHistory) => {
    if (postureHistory.length === 0) {
      return { badPosturePercent: 0, postureScore: 5 };
    }

    let badPostureCount = 0;
    let sampleScoreAccumulator = 0;
    let validSamples = 0;

    postureHistory.forEach((keypoints) => {
      if (!keypoints || keypoints.length < 33) return;

      // Key landmarks: shoulders (11, 12), nose (0), hips (23, 24)
      const leftShoulder = keypoints[11];
      const rightShoulder = keypoints[12];
      const nose = keypoints[0];
      const leftHip = keypoints[23];
      const rightHip = keypoints[24];

      if (!leftShoulder || !rightShoulder || !nose || !leftHip || !rightHip) return;

      const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const headOffset = Math.abs(nose.x - (leftShoulder.x + rightShoulder.x) / 2);
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipMidY = (leftHip.y + rightHip.y) / 2;
      const torsoLean = Math.abs(shoulderMidY - hipMidY);

      const shoulderAlignmentScore = 1 - Math.min(1, shoulderYDiff / 0.2);
      const headAlignmentScore = 1 - Math.min(1, headOffset / 0.25);
      const torsoAlignmentScore = 1 - Math.min(1, Math.abs(torsoLean - 0.35) / 0.25);

      const sampleScore = Math.max(0, Math.min(1, (shoulderAlignmentScore + headAlignmentScore + torsoAlignmentScore) / 3));

      sampleScoreAccumulator += sampleScore;
      validSamples += 1;

      if (sampleScore < 0.6) {
        badPostureCount++;
      }
    });

    const effectiveSamples = Math.max(1, validSamples);
    const badPosturePercent = (badPostureCount / effectiveSamples) * 100;
    const avgSampleScore = sampleScoreAccumulator / effectiveSamples;
    const postureScore = Math.round(Math.max(0, Math.min(1, avgSampleScore)) * 100) / 10;

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
    const movementIntensity = Math.min(1, avgMovement / 0.08);
    const jitterRatio = Math.min(1, rapidMovementCount / postureHistory.length);
    const movementJitterScore = Math.round(Math.min(10, (movementIntensity * 5 + jitterRatio * 5) * 10)) / 10;

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
    const maxSamples = Math.floor(60 * (1000 / LOG_INTERVAL_MS));
    if (gazeData.length > maxSamples) gazeData.shift();
    if (postureData.length > maxSamples) postureData.shift();
  }, []);

  // Start tracking
  const startTracking = useCallback(async (externalVideoRef) => {
    if (isTrackingRef.current) {
      return;
    }

    isTrackingRef.current = true;
    setIsTracking(true);
    metricsRef.current = {
      gazeData: [],
      postureData: [],
      movementData: [],
      startTime: Date.now(),
      lastGazePoint: null,
      lastPoseKeypoints: null,
    };

    const targetVideo = externalVideoRef?.current || videoRef.current || document.querySelector('[data-interview-video]') || document.querySelector('video');

    if (!targetVideo) {
      console.warn('No video element found for behaviour tracking');
      setIsTracking(false);
      return;
    }

    videoRef.current = targetVideo;

    await initWebGazer();
    await initMediaPipe(targetVideo);

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    trackingIntervalRef.current = setInterval(logMetrics, LOG_INTERVAL_MS);
  }, [initWebGazer, initMediaPipe, logMetrics]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    console.log('🛑 Stopping behaviour tracking...');
    
    // Set tracking to false FIRST to stop all callbacks
    isTrackingRef.current = false;
    setIsTracking(false);

    // Clear intervals immediately
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    // Cancel animation frame
    if (poseDetectionFrameRef.current) {
      cancelAnimationFrame(poseDetectionFrameRef.current);
      poseDetectionFrameRef.current = null;
    }

    // Stop MediaPipe first (it uses the video stream)
    if (poseRef.current) {
      try {
        await poseRef.current.close();
        poseRef.current = null;
        console.log('✅ MediaPipe stopped');
      } catch (error) {
        console.error('❌ Error stopping MediaPipe:', error);
      }
    }

    // Stop WebGazer (it may have its own camera access)
    try {
      const webgazer = window.webgazer;
      if (webgazer && typeof webgazer.end === 'function') {
        await webgazer.end();
        console.log('✅ WebGazer stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping WebGazer:', error);
    }

    // Clear metrics
    metricsRef.current.lastGazePoint = null;
    metricsRef.current.lastPoseKeypoints = null;
    
    console.log('✅ Behaviour tracking fully stopped');
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
