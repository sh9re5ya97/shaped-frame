import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

function ModelLoader({ url, onLoad }) {
  const model = useGLTF(url);
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      onLoad(meshRef.current);
    }
  }, []);

  return <primitive object={model.scene} ref={meshRef} />;
}

export default ModelLoader;
