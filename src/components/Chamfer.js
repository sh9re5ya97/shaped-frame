import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useGLTF, useLoader } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { Euler } from "three";
import * as THREE from "three";
function Chamfer({ chamferWidth, chamferHeight, selectedCorner, cornerList }) {
  const chamferRef = useRef();
  //   const { nodes } = useGLTF('./models/FrameProfile.glb');
  const model = useGLTF("./models/FrameProfile.glb");

  useEffect(() => {
    if (chamferRef.current) {
      const chamferInstance = chamferRef.current;
      let selectedCornerId = cornerList.findIndex(
        (c) => c.id === selectedCorner.id
      );
      // Get the position of the two corners
      let cornerId1 =
        selectedCornerId == 0 ? cornerList.length - 1 : selectedCornerId - 1;
      let cornerId2 =
        selectedCornerId == cornerList.length - 1 ? 0 : selectedCornerId + 1;
      const cornerPosition1 = cornerList[cornerId1];
      const cornerPosition2 = cornerList[cornerId2];

      // Calculate the length between the two corners
      const chamferLength = cornerPosition1.position.distanceTo(
        cornerPosition2.position
      );
      // Get the original bounding box of the chamfer model
      const boundingBox = new THREE.Box3().setFromObject(model.scene);
      const originalLength = boundingBox.max.x - boundingBox.min.x;

      // Calculate the scale factor
      const scaleFactor = chamferLength / originalLength;

      // Apply the scale factor
      chamferInstance.scale.set(scaleFactor, chamferHeight, chamferWidth);

      // Get the position of the selected corner
      const cornerPosition = cornerList[selectedCornerId];

      // Position the chamfer instance at the corner
      chamferInstance.position.set(
        selectedCorner.position.x,
        selectedCorner.position.y,
        selectedCorner.position.z
      );
      // Set the rotation of the chamfer instance
      chamferInstance.rotateZ(Math.PI / 4);
    }
  }, [chamferWidth, chamferHeight, selectedCorner, cornerList]);

  return <primitive ref={chamferRef} object={model.scene} />;
}

export default Chamfer;
