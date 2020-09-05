class BugByDaylight {
    constructor() {
        this.mClock = new THREE.Clock();
        this.mNurseAnims = ["death", "attack", "run", "idle"]; 

		this.init();
    }

    init() {
        this.initThree();
        this.initCamera();
        this.initScene();
        this.initLight();
        this.initModel();
    }

    initThree() {
        const self = this;
        this.mRenderer = new THREE.WebGLRenderer({
            antialias : true
        });
        this.mRenderer.shadowMap.enabled = true; // 麻痹的这一个d搞了我一下午，为什么编译器不会报错，引擎的问题还是js的问题
        this.mRenderer.shadowMap.type = THREE.PCFSoftShadowMap; // 默认的是THREE.PCFShadowMap，没有设置的这个清晰 
        this.mRenderer.shadowCameraNear = 0.5;
        this.mRenderer.shadowCameraFar = 100000;
        this.mRenderer.shadowMapWidth = 4096;
        this.mRenderer.shadowMapHeight = 4096;
        this.mRenderer.setSize(window.innerWidth, window.innerHeight);
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild(this.mRenderer.domElement);
        this.mRenderer.setClearColor(0xffffff, 1.0);
    
        this.mStats = new Stats();
        this.mStats.domElement.style.position = 'absolute';
        this.mStats.domElement.style.left = '5px';
        this.mStats.domElement.style.top = '5px';
    
        // onSurfaceChanged
        window.addEventListener('resize', function(){self.onWindowResize();}, false);
    }

    initCamera() {
        this.mCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.mCamera.position.set(300, 300, 300);
    }

    initScene() {
        this.mScene = new THREE.Scene();
        this.mScene.background = new THREE.Color(0xa0a0a0);
        this.mScene.fog = new THREE.Fog(0xa0a0a0, 1000, 2000);

        this.mAxis = new THREE.AxesHelper(500);
        this.mAxis.material.visible = false;
        this.mScene.add(this.mAxis);

        // 创建控件并绑定在相机上
        this.mOrbitControl = new THREE.OrbitControls(this.mCamera, this.mRenderer.domElement);
        this.mOrbitControl.target = new THREE.Vector3(0, 100, 0);
        this.mOrbitControl.autoRotate = false;
        this.mOrbitControl.minDistance = 1;
        this.mOrbitControl.maxDistance = 1000;
        this.mOrbitControl.update();
    }

    initLight() {
        this.mAmbientLight = new THREE.AmbientLight(0x777777);
        this.mScene.add(this.mAmbientLight);

        this.mDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.mDirectionalLight.position.set(500, 500, 500);
        this.mDirectionalLight.target.position.set(0, 0, 0);
        // this.mDirectionalLight.shadowCameraVisible = true;
        this.mDirectionalLight.castShadow = true;
        this.mDirectionalLight.shadow.camera.near = 0.5;
        this.mDirectionalLight.shadow.camera.far = 3000;
        this.mDirectionalLight.shadow.camera.top = 1800;
        this.mDirectionalLight.shadow.camera.bottom = -1000;
        this.mDirectionalLight.shadow.camera.left = -1200;
        this.mDirectionalLight.shadow.camera.right = 1200;
        this.mScene.add(this.mDirectionalLight);

        this.mSpotLight = new THREE.SpotLight(0xffffff);
        this.mSpotLight.position.set(0, 200, 0);
        this.mSpotLight.angle = Math.PI / 3; // 设置聚光光源发散角度
        this.mSpotLight.castShadow = true;
        this.mSpotLight.receiveShadow = true;
        this.mSpotLight.shadow.camera.near = 0.5;
        this.mSpotLight.shadow.camera.far = 1000;
        this.mSpotLight.shadow.camera.width = 1000;
        this.mSpotLight.shadow.camera.height = 1000;
        this.mScene.add(this.mSpotLight);
    }

    initModel() {
        const self = this;
        // mesh
        this.mMeshLineMaterial = new THREE.LineBasicMaterial({color: 0x000000, opacity: 0.2});
        this.mMeshLineMaterial.visible = false;
        this.mMeshGrid = new THREE.Geometry();
        this.mMeshGrid.vertices.push(new THREE.Vector3(-50, 0, 0));
        this.mMeshGrid.vertices.push(new THREE.Vector3( 50, 0, 0));
        for (var i = 0; i <= 10; i ++) {
            var line = new THREE.Line(this.mMeshGrid, this.mMeshLineMaterial);
            line.position.z = (i * 10) - 50;
            this.mScene.add(line);

            var line = new THREE.Line(this.mMeshGrid, this.mMeshLineMaterial);
            line.position.x = (i * 10) - 50;
            line.rotation.y = 90 * Math.PI / 180;
            this.mScene.add(line);
        }

        // plane
        var planeGeo = new THREE.PlaneGeometry(1000, 1000);
        var planeMaterial = new THREE.MeshStandardMaterial({color: 0xcccccc}); // , side: THREE.DoubleSide
        var planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
        planeMesh.rotateX(-Math.PI / 2);
        planeMesh.receiveShadow = true; // 接收阴影
        this.mScene.add(planeMesh);

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
                    child.castShadow = true;
                    child.receiveShadow = true; // 接收阴影
                }
            });
            object.position.z -= 100;
            self.mScene.add(object);
        }, onProgress, onError);
        // });

        // load FBX nurse
        var fbxLoader = new THREE.FBXLoader();
        fbxLoader.setCrossOrigin("Anonymous");
        fbxLoader.load("/model/zombienurse/zombienurse_Rig.fbx", function(object) {
            self.mFbxAnimMixers = new THREE.AnimationMixer(object);
            self.mFbxActions = [];

            object.traverse(function(child) {
                if (child.isMesh) {    //  instanceof THREE.Mesh
                    child.castShadow = true;
                    child.receiveShadow = true; // 接收阴影
                }
            });
            self.mScene.add(object);
            object.position.x -= 200;
            console.log(object.animations.length);
            self.mFbxAnimMixers.clipAction(object.animations[0]).play();

            self.loadNextAnim(fbxLoader);
        });

        // load FBX woman sophia
        var sophiaLoader = new THREE.FBXLoader();
        sophiaLoader.setCrossOrigin("Anonymous");
        sophiaLoader.load("/model/sophia/rp_sophia_animated_003_idling.fbx", function(object) {
            self.mFbxSophiaMixers = new THREE.AnimationMixer(object);

            object.traverse(function(child) {
                if (child.isMesh) {    //  instanceof THREE.Mesh
                    child.castShadow = true;
                    child.receiveShadow = true; // 接收阴影
                }
            });
            self.mScene.add(object);
            object.rotateX(-Math.PI / 2);
            console.log(object.animations.length);
            self.mFbxSophiaMixers.clipAction(object.animations[0]).play();
        });

        // load dustbin FBX
        var dustbinPBRMaterial = new THREE.MeshPhysicalMaterial({
            map: THREE.ImageUtils.loadTexture('/model/PBR_Dustbin/lajitong_Material _47_BaseColor.jpg', null, function(t){}),
            metalness: 0.1, 
            roughness: 0.2
        });
        var dustbinLoader = new THREE.FBXLoader();
        dustbinLoader.setCrossOrigin("Anonymous");
        dustbinLoader.load("/model/PBR_Dustbin/dustbin.fbx", function(object) {
            object.traverse(function(child) {
                if (child.isMesh) {    //  instanceof THREE.Mesh
                    child.material = dustbinPBRMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true; // 接收阴影
                }
            });
            object.position.x -= 220;
            object.scale.x = 0.1;
            object.scale.y = 0.1;
            object.scale.z = 0.1;
            self.mScene.add(object);
        });

        // // load J-15 material
        // var j15PBRMaterial = new THREE.MeshPhysicalMaterial({
        //     map: THREE.ImageUtils.loadTexture('/model/J-15/mat0_c.jpg', null, function(t){}), 
        //     emissive:0x111111,
        //     normalMap: new THREE.ImageUtils.loadTexture('/model/J-15/mat0_n.jpg'),
        //     metalnessMap: new THREE.ImageUtils.loadTexture('/model/J-15/mat0_g.jpg'), 
        //     roughnessMap: new THREE.ImageUtils.loadTexture('/model/J-15/mat0_r.jpg'), 
        //     emissiveMap: new THREE.ImageUtils.loadTexture('/model/J-15/mat0_s.jpg')
        // });
        // objLoader.setPath('model/J-15/');
        // objLoader.load('J-15.obj', function(object) {
        //     object.traverse(function(child) {
        //         if (child instanceof THREE.Mesh) {
        //             child.material = j15PBRMaterial;
        //             child.castShadow = true;
        //             child.receiveShadow = true; // 接收阴影
        //         }
        //     });
        //     object.scale.set(50, 50, 50)
        //     self.mScene.add(object);
        // }, onProgress, onError);
    }

    loadNextAnim(loader) {
        const self = this;
        const anim = this.mNurseAnims.pop();
    
        loader.load(`/model/zombienurse/${anim}.fbx`, function (object) {
            const action = self.mFbxAnimMixers.clipAction(object.animations[0]);
            self.mFbxActions.push(action);
    
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });
            // self.mScene.add(object); // do not add repeat
            
            if (self.mNurseAnims.length > 0) {
                self.loadNextAnim(loader);
            } else {
                self.playAnimation(0);
                self.render();
            }
        } );
    }

    stopAnimation() {
        this.mFbxAnimMixers.stopAllAction();
    }
    
    playAnimation(index) {
        this.mFbxAnimMixers.stopAllAction();
        const action = this.mFbxActions[index];
        action.weight = 1;
        action.fadeIn(0.5);
        action.play();
    }

    render() {
        var delta = this.mClock.getDelta();
        // this.mOrbitControl.update(delta);

        this.mRenderer.clear();
        this.mRenderer.render(this.mScene, this.mCamera);
        
        if (null != this.mFbxAnimMixers) {
            this.mFbxAnimMixers.update(delta);
        }
        if (null != this.mFbxSophiaMixers) {
            this.mFbxSophiaMixers.update(delta);
        }

        this.mStats.update();

        const self = this;
        requestAnimationFrame(function(){ 
            self.render(); 
        });
    }

    onWindowResize() {
        this.mCamera.aspect = window.innerWidth / window.innerHeight;
        this.mCamera.updateProjectionMatrix();
        this.mRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyPress(event) {
        // var key;
        // if (navigator.appName == "Netscape") {
        //     key = String.fromCharCode(event.charCode);
        // } else {
        //     key = String.fromCharCode(event.keyCode);
        // }
        // switch (key) {
        //     case 'G':
        //     case 'g':
        //         this.mShowAssist = !this.mShowAssist;
        //         this.mMeshLineMaterial.visible = this.mShowAssist;
        //         this.mAxis.material.visible = this.mShowAssist;
        //         break;
        //     case '1':
                    // playAnimation(1);
        //     case '2':
        //         playAnimation(2);
        //     case '3':
        //         playAnimation(3);
        //     case '4':
        //         playAnimation(4);
        //     default:
        //         break;
        // }
        // if (this.mShowAssist) {
        //     document.getElementById('canvas-frame').appendChild(this.mStats.domElement);
        // } else {
        //     document.getElementById('canvas-frame').removeChild(this.mStats.domElement);
        // }
    }
}