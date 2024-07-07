import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import ModelLoader from "./ModelLoader";
import Chamfer from "./Chamfer";
import Loader from "./Loader";
import * as THREE from "three";
import { addObjectIfNotExists } from "../utils/utils";

let innerVertices = [];
let frameMesh;
function HighlightMarker({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

function Scene() {
  const [corners, setCorners] = useState([]);
  const [selectedCorner, setSelectedCorner] = useState(null);
  const [chamferCorners, setChamferCorners] = useState([]);

  const handleModelLoad = (mesh) => {
    console.log(mesh);
    frameMesh = mesh;
    let minCorner = new THREE.Vector3(0, 0, 0);
    let maxCorner = new THREE.Vector3(0, 0, 0);
    mesh.children.forEach((child) => {
      if (child.isMesh) {
        let childMin = child.geometry.boundingBox.min;
        let childMax = child.geometry.boundingBox.max;
        addObjectIfNotExists(innerVertices, child.geometry.boundingBox.min);
        addObjectIfNotExists(innerVertices, child.geometry.boundingBox.max);
        if (childMin.x < minCorner.x) minCorner.x = childMin.x;
        if (childMin.y < minCorner.y) minCorner.y = childMin.y;
        if (childMin.z < minCorner.z) minCorner.z = childMin.z;

        if (childMax.x > maxCorner.x) maxCorner.x = childMax.x;
        if (childMax.y > maxCorner.y) maxCorner.y = childMax.y;
        if (childMax.z > maxCorner.z) maxCorner.z = childMax.z;
      } else {
        child.children.forEach((innerChild) => {
          let childMin = innerChild.geometry.boundingBox.min;
          let childMax = innerChild.geometry.boundingBox.max;
          addObjectIfNotExists(
            innerVertices,
            innerChild.geometry.boundingBox.min
          );
          addObjectIfNotExists(
            innerVertices,
            innerChild.geometry.boundingBox.max
          );
          if (childMin.x < minCorner.x) minCorner.x = childMin.x;
          if (childMin.y < minCorner.y) minCorner.y = childMin.y;
          if (childMin.z < minCorner.z) minCorner.z = childMin.z;

          if (childMax.x > maxCorner.x) maxCorner.x = childMax.x;
          if (childMax.y > maxCorner.y) maxCorner.y = childMax.y;
          if (childMax.z > maxCorner.z) maxCorner.z = childMax.z;
        });
      }
    });
    console.log(innerVertices);

    const corners = [
      new THREE.Vector3(minCorner.x, minCorner.y, minCorner.z), // corner 1 Front Face
      new THREE.Vector3(maxCorner.x, minCorner.y, minCorner.z), // corner 2 Front Face
      new THREE.Vector3(minCorner.x, maxCorner.y, minCorner.z), // corner 3 Front Face
      new THREE.Vector3(maxCorner.x, maxCorner.y, minCorner.z), // corner 4 Front Face
      new THREE.Vector3(minCorner.x, minCorner.y, maxCorner.z), // corner 5 Back Face
      new THREE.Vector3(maxCorner.x, minCorner.y, maxCorner.z), // corner 6 Back Face
      new THREE.Vector3(minCorner.x, maxCorner.y, maxCorner.z), // corner 7 Back Face
      new THREE.Vector3(maxCorner.x, maxCorner.y, maxCorner.z), // corner 8 Back Face
    ];

    const identifiedCorners =
      // Can be replaced with vertice identifying logic for complex shapes
      [
        { id: "TL", vertice: true, position: corners[2] }, // Top-left
        {
          id: "TM",
          position: new THREE.Vector3()
            .addVectors(corners[3], corners[2])
            .multiplyScalar(0.5),
        }, // Top-mid
        { id: "TR", vertice: true, position: corners[3] }, // Top-right
        {
          id: "RM",
          position: new THREE.Vector3()
            .addVectors(corners[1], corners[3])
            .multiplyScalar(0.5),
        }, // Right-mid
        { id: "BR", vertice: true, position: corners[1] }, // Bottom-right
        {
          id: "BM",
          position: new THREE.Vector3()
            .addVectors(corners[1], corners[4])
            .multiplyScalar(0.5),
        }, // Bottom-mid
        { id: "BL", vertice: true, position: corners[4] }, // Bottom-left
        {
          id: "LM",
          position: new THREE.Vector3()
            .addVectors(corners[4], corners[2])
            .multiplyScalar(0.5),
        }, // Left-mid
      ];
    setCorners(identifiedCorners);
  };

  const selectCorner = (corner) => {
    setSelectedCorner(corner);
  };
  const setChamfer = () => {
    console.log(chamferCorners);
    setChamferCorners([selectedCorner]);
    setSelectedCorner(null);
  };

  return (
    //style selection console
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="corner-buttons">
        {corners.map((corner) => {
          if (corner.vertice) {
            return (
              <button key={corner.id} onClick={() => selectCorner(corner)}>
                Select Corner {corner.id}
              </button>
            );
          }
        })}
      </div>
      <div>
        {/* disable if no selectedCorner */}
        {/* for each corner */}
        <button onClick={() => setChamfer()}>Chamfer</button>
      </div>
      <div>
        <button>Border Radius</button>
      </div>
      <Canvas>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <ModelLoader url="./models/BaseFrame.glb" onLoad={handleModelLoad} />
          {/* <ModelLoader url="./models/FrameProfileWithBones.glb" onLoad={()=>{return}} /> */}

          {chamferCorners.length > 0 &&
            chamferCorners.map((corner) => {
              return (
                <Chamfer
                  key={corner.id}
                  chamferWidth={2}
                  chamferHeight={2}
                  selectedCorner={corner}
                  cornerList={corners}
                />
              );
            })}
          {selectedCorner && (
            <HighlightMarker position={selectedCorner.position} />
          )}

          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Scene;
