var mShowAssist = false;
var mStats;
var mRenderer;
var mCamera;
var mScene;
var mOrbitControl;
var mAmbientLight;
var mDirectionalLight;    // SunLight
var mMeshGrid;
var mAxis;
var mMeshLineMaterial;
// FBX load
var mMixer;

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
    mRenderer.setClearColor(0x000000, 1.0);

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
    mCamera.position.x = 70;
    mCamera.position.y = 70;
    mCamera.position.z = 70;
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
}

function initObjects() {
    mMeshLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, opacity: 0.2});
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

    // load FBX
    var fbxLoader = new THREE.FBXLoader();
    fbxLoader.setCrossOrigin("Anonymous");
    fbxLoader.load("/model/shark.fbx", function(mesh) {
        mesh.scale.x *= 0.05;
        mesh.scale.y *= 0.05;
        mesh.scale.z *= 0.05;
        mScene.add(mesh);

        mMixer = new THREE.AnimationMixer(mesh);
        console.log(mesh.animations.length);
        mMixer.clipAction(mesh.animations[0]).play();
    });

    // // load OBJ
    // var onProgress = function(xhr) {
    //     if (xhr.lengthComputable) {
    //         var percentComplete = xhr.loaded / xhr.total * 100;
    //         console.log(Math.round(percentComplete, 2) + '% loading');
    //     }
    // };
    // var onError = function(error) {
    //     console.log('load error!' + error.getWebGLErrorMessage());
    // };
    
    // var mtlLoader = new THREE.MTLLoader();
    // mtlLoader.setPath('model/CaptainAmerica/');
    // mtlLoader.load('CaptainAmerica.mtl', function(material) {
    //     material.preload();
    //     var objLoader = new THREE.OBJLoader();
    //     objLoader.setMaterials(material);
    //     objLoader.setPath('model/CaptainAmerica/');
    //     objLoader.load('CaptainAmerica.obj', function(object) {
    //         // object.position.x += 10;
    //         // object.scale.x *= 100;
    //         // object.scale.y *= 100;
    //         // object.scale.z *= 100;
    //         mScene.add(object);
    //     }, onProgress, onError);
    // });
}

function render() {
    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    mOrbitControl.update(delta);

    mRenderer.clear();
    mRenderer.render(mScene, mCamera);

    var time = clock.getDelta();
    updateScene(time);

    mStats.update();

    requestAnimationFrame(render);
}

function updateScene(time) {
    if (mMixer) {
        mMixer.update(time);
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