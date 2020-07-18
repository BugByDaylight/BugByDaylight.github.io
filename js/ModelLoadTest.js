var mShowAssist = false;
var mStats;
var mRenderer;
var mCamera;
var mScene;
var mOrbitControl;
var mAmbientLight;
var mDirectionalLight;    // SunLight
var mSpotLight;
var mMeshGrid;
var mAxis;
var mMeshLineMaterial;
// FBX load
var mMixers = [];

function onKeyPress(event) {
    var key;
    if (navigator.appName == "Netscape") {
        key = String.fromCharCode(event.charCode);
    } else {
        key = String.fromCharCode(event.keyCode);
    }
    switch (key) {
        case 'G':
        case 'g':
            mShowAssist = !mShowAssist;
            mMeshLineMaterial.visible = mShowAssist;
            mAxis.material.visible = mShowAssist;
            break;
        default:
            break;
    }
    if (mShowAssist) {
        document.getElementById('canvas-frame').appendChild(mStats.domElement);
    } else {
        document.getElementById('canvas-frame').removeChild(mStats.domElement);
    }
}

function initThree() {
    mRenderer = new THREE.WebGLRenderer({
        antialias : true
    });
    mRenderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-frame').appendChild(mRenderer.domElement);
    mRenderer.setClearColor(0xffffff, 1.0);

    mStats = new Stats();
    mStats.domElement.style.position = 'absolute';
    mStats.domElement.style.left = '5px';
    mStats.domElement.style.top = '5px';

    // onSurfaceChanged
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    mCamera.aspect = window.innerWidth / window.innerHeight;
    mCamera.updateProjectionMatrix();
    mRenderer.setSize(window.innerWidth, window.innerHeight);
}

function initCamera() {
    mCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    mCamera.position.x = 300;
    mCamera.position.y = 300;
    mCamera.position.z = 300;
    mCamera.up.x = 0;
    mCamera.up.y = 1;
    mCamera.up.z = 0;
    mCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
}

function initScene() {
    mScene = new THREE.Scene();

    mAxis = new THREE.AxesHelper(50);
    mAxis.material.visible = mShowAssist;
    mScene.add(mAxis);

    // 创建控件并绑定在相机上
    mOrbitControl = new THREE.OrbitControls(mCamera, mRenderer.domElement);
    mOrbitControl.target = new THREE.Vector3(0, 0, 0);
    mOrbitControl.autoRotate = false;
    mOrbitControl.minDistance = 1;
    mOrbitControl.maxDistance = 1000;
}

function initLight() {
    mAmbientLight = new THREE.AmbientLight(0x777777);
    mScene.add(mAmbientLight);

    mDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    mDirectionalLight.position.set(0, 10, 10);
    mDirectionalLight.target.position.set(0, 0, 0);
    // mDirectionalLight.shadowCameraVisible = true;
    mDirectionalLight.castShadow = true;
    mScene.add(mDirectionalLight);

    mSpotLight = new THREE.SpotLight(0xffffff);
    mSpotLight.position.set(0, 10, 0);
    mSpotLight.castShadow = true;
    mScene.add(mSpotLight);
}

function initObjects() {
    // mesh
    mMeshLineMaterial = new THREE.LineBasicMaterial({color: 0x000000, opacity: 0.2});
    mMeshLineMaterial.visible = mShowAssist;
    mMeshGrid = new THREE.Geometry();
    mMeshGrid.vertices.push(new THREE.Vector3(-50, 0, 0));
    mMeshGrid.vertices.push(new THREE.Vector3( 50, 0, 0));
    for (var i = 0; i <= 10; i ++) {
        var line = new THREE.Line(mMeshGrid, mMeshLineMaterial);
        line.position.z = (i * 10) - 50;
        mScene.add(line);

        var line = new THREE.Line(mMeshGrid, mMeshLineMaterial);
        line.position.x = (i * 10) - 50;
        line.rotation.y = 90 * Math.PI / 180;
        mScene.add(line);
    }

    // plane
    var planeGeo = new THREE.PlaneGeometry(1000, 1000);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc}); // , side: THREE.DoubleSide
    var planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
    planeMesh.rotateX(-Math.PI/2);
    planeMesh.receiveShadow = true; // 接收阴影
    mScene.add(planeMesh);

    // Cube
    var cubeGeo = new THREE.CubeGeometry(50, 50, 50);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeo, cubeMaterial);
    cube.castShadow = true;
    mScene.add(cube);
    cube.position.set(100, 25, 0);

    // load FBX
    var fbxLoader = new THREE.FBXLoader();
    fbxLoader.setCrossOrigin("Anonymous");
    fbxLoader.load("/model/zombienurse/zombienurse_Rig.fbx", function(object) {
        object.castShadow = true;
        mScene.add(object);

        object.mixer = new THREE.AnimationMixer(object);
        mMixers.push(object.mixer);
        console.log(object.animations.length);
        object.mixer.clipAction(object.animations[0]).play();
    });

    // load OBJ
    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% loading');
        }
    };
    var onError = function(error) {
        console.log('load error!' + error.getWebGLErrorMessage());
    };
    // PBR Material
    var pbrMaterial = new THREE.MeshPhysicalMaterial({
        map: THREE.ImageUtils.loadTexture('/model/PBR_Safa/C501_1_1_lambert1_AlbedoTransparency.jpg', null, function(t){}), 
        normalMap: new THREE.ImageUtils.loadTexture('/model/PBR_Safa/C501_1_1_lambert1_Normal.jpg'),
        metalnessMap: new THREE.ImageUtils.loadTexture('/model/PBR_Safa/C501_1_1_lambert1_MetallicSmoothness.jpg')
    });
    // var mtlLoader = new THREE.MTLLoader();
    // mtlLoader.setPath('model/PBR_Safa/');
    // mtlLoader.load('shafa_obj.mtl', function(material) {
    //     material.preload();
    var objLoader = new THREE.OBJLoader();
    // objLoader.setMaterials(material);
    objLoader.setPath('model/PBR_Safa/');
    objLoader.load('shafa_obj.obj', function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = pbrMaterial;
            }
        });
        object.castShadow = true;
        object.position.z -= 100;
        mScene.add(object);
    }, onProgress, onError);
    // });
}

function render() {
    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    mOrbitControl.update(delta);

    mRenderer.clear();
    mRenderer.shadowMap.enable = true;
    mRenderer.render(mScene, mCamera);

    var deltaTime = clock.getDelta();
    updateScene(deltaTime);

    mStats.update();

    requestAnimationFrame(render);
}

function updateScene(deltaTime) {
    if (mMixers.length > 0) {
        for (let i = 0; i < mMixers.length; i++) {
            mMixers[i].update(deltaTime);
        }
    }
}

function main() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObjects();
    render();
}