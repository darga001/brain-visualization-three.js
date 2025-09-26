import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import Lobes_and_colors from './Lobes_and_colors.jsx';
import Lobes_and_names from  './Lobes_and_names.jsx';
import Brain_Menu from "./Brain_Menu.jsx";


function BrainViewer() {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. Basic scene setup
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // black background

    // 2. Camera creation (initially arbitrary)
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.0001,
      10000
    );
    camera.position.set(0, 0, 15);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // 5. (Optional) Lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(4, 10, -10);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(-4, -10, 10);
    scene.add(light2);
// Floor
    const floorGeometry = new THREE.PlaneGeometry(0.38, 0.38);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xB2B2B2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1
    scene.add(floor);

    // shadow 
    const textureLoader = new THREE.TextureLoader();
    const overlayTexture = textureLoader.load('textures/brain-shadow3.png')
    const overlayMaterial = new THREE.MeshBasicMaterial({
      map: overlayTexture,
      transparent: true,
    });
    const overlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.27,0.27),
      overlayMaterial
    );
    overlayPlane.rotation.x = -Math.PI / 2;
    overlayPlane.position.y = floor.position.y + 0.0005;
    scene.add(overlayPlane);

    // colors
    const pointBrainColors = {};

      for (const lobe of Object.values(Lobes_and_colors)) {
        const { color, parts } = lobe;
        parts.forEach((meshName) => {
        pointBrainColors[meshName] = color;
        });
      }

      const brainPartNames = {};

      for (const lobe of Object.values(Lobes_and_names)) {
        const names = lobe.Names;
        for (const [meshName, readableName] of Object.entries(names)) {
          brainPartNames[meshName] = readableName;
        }
      }
      
    const loader = new OBJLoader();
    loader.load(
      'Objects/Brain1.obj',
      (object) => {
        const group = new THREE.Group();
        object.traverse((child) => {
          if (child.isMesh && child.geometry) {
            const pointsMaterial = new THREE.PointsMaterial({
              color: pointBrainColors[child.name],
              size: 0.00005,
              sizeAttenuation: true,
              transparent: false,
              opacity: 0.2
              });
            const points = new THREE.Points(child.geometry, pointsMaterial);
            points.name = child.name;
            group.add(points);
            // mesh material 
            const meshMaterial = new THREE.MeshStandardMaterial({
              color: pointBrainColors [child.name],
              visible: false,
              transparent: true,
              opacity: 0.6,
            
            })
            const mesh = new THREE.Mesh (child.geometry, meshMaterial);
            mesh.name = child.name;
            group.add(mesh);

          
          }
        });
    
        const boundingBox = new THREE.Box3().setFromObject(group);
        const center = boundingBox.getCenter(new THREE.Vector3());
        group.position.sub(center);
        scene.add(group);
    
        const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
        const radius = boundingSphere.radius;
        camera.position.set(0, 0, radius * 3);
        camera.far = radius * 10;
        camera.updateProjectionMatrix();
    
        controls.target.set(0, 0, 0);
        controls.update();
    
      }
    );

    // 8. Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Cleanup
    return () => {
      container.removeChild(renderer.domElement);
    };
  }, []);

 return (
  <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
    <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#0CD7C4', 
        padding: '8px',
        borderRadius: '4px',
        maxHeight: '50vh',
        overflowY: 'auto',
        overflowX: 'auto',
        zIndex: 10
      }}
    >
      <Brain_Menu
        onMeshSelect={(meshName) => {
          console.log("Clicked:", meshName);
            

  
        }}
      />
    </div>
  </div>
);
};



export default BrainViewer;
