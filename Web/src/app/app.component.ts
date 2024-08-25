import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { DataServiceService, Category, Tree, Habit, Log, UserData } from './data-service.service';
import { CommunicationService } from './communication.service';
import { ModelsService } from './Models/models.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Web';

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  raycaster!: THREE.Raycaster;

  //Seemed to figure out what causes occasional 'WebGL Context Lost' on iOS in 'PWA' mode
  //Occurs whenever another app has a webview open, e.g. in my case Octal to view HackerNews articles
  //perhaps iOS doesn't allow multiple webviews to access the GPU at once?

  //apparently issue will be resolved by updating iOS to latest version.

  constructor(private data: DataServiceService, private communication: CommunicationService, private router: Router, private models: ModelsService) {}

  ngOnInit() {
    this.communication.completedHabitEvent.subscribe((data) => {
      this.CompleteHabit(data.categoryID, data.description);
    });

    this.communication.deleteCategoryEvent.subscribe((categoryID) => {
      this.DeleteCategory(categoryID);
    });
  }

  ngAfterViewInit() {
    this.InitTHREE();
    this.InitView();
    window.addEventListener("resize", () => { //to resize renderer when window resizes
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      animate();
    })

    this.data.RetrieveData();
    this.InitTrees(this.data.userData.categories);

    this.InitTreeListeners();
    this.HideInstruction();

    const popupDialogElement = document.getElementById("popup")!;
    popupDialogElement.addEventListener('close', () => {
      this.ClosePopupHandler();
    })

    const animate = () => {
      this.renderer.render(this.scene, this.camera);
    }
    this.renderer.setAnimationLoop(animate);
    
    setTimeout(() => {
      location.reload(); //reload after a day
    }, 86400000)
  }

  InitTHREE() {
    //Setting up renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new THREE.WebGLRenderer({ //renderer setup
      canvas: document.getElementById("canvas")!,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;

    this.raycaster = new THREE.Raycaster();
  }
  ConvertClientCoordinatesToVector(clientX: number, clientY: number): THREE.Vector2 {
    const pointerX = ( clientX / window.innerWidth ) * 2 - 1; 
    const pointerY = - ( clientY / window.innerHeight ) * 2 + 1;
    return new THREE.Vector2(pointerX, pointerY);
  }

  InitView() {
    //Initiaising plane
    const geometry = new RoundedBoxGeometry( 20, 4, 20, 10, 0.3 );
    const material = new THREE.MeshStandardMaterial( { color: 0x333333 } );
    const plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.name = "plane";
    this.scene.add( plane );

    //Setting up position of plane and camera
    this.camera.position.y = 20;
    this.camera.position.x = 16;
    this.camera.position.z = 30;
    
    this.camera.rotation.x = -0.3;
    this.camera.rotation.y = 0.5;
    this.camera.rotation.z = 0.1;

    //Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 10000);
    pointLight.position.set(20, 50, 15);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
  }

  GiveInstruction(message: string) {
    const element = document.getElementById("instruction")!;
    element.innerText = message;
    element.style.opacity = "100";
  }
  HideInstruction() {
    const element = document.getElementById("instruction")!;
    element.style.opacity = "0";
  }

  async InitTrees(categories: Category[]) {
    //'plant' a tree at its specified position on the plane
    //plane dimensions: 20x4x20 centered at origin

    //need to give the category id as the name for every geometry within the group, as raycaster can only detect the specific geometry clicked
    function AssignNameAndShadowGroup(group: any, name: string) {
      const children = group.children;
      if (children == undefined) {
        return;
      }
      for (const child of children) {
        child.name = name;
        child.receiveShadow = true;
        child.castShadow = true;
        AssignNameAndShadowGroup(child, name);
      }
    }

    for (const category of categories) {
      const tree = category.tree;

      //extract model for tree with specified type, hydration and growth
      const mesh = await this.models.GetTreeModel(tree);
      console.log(mesh)
      if (mesh.type == "Group") {
        AssignNameAndShadowGroup(mesh, category.id)
      }
      else {
        mesh.name = category.id;
      }
      this.scene.add(mesh);

      //3D model's mesh is centered above y-plane, so we only need to offset the model to clear the plane
      mesh.position.set(tree.position.x, 2, tree.position.z);
      //mesh.position.set(10, 2, 10); //should put mesh in bottom-right corner
    }
  }
  DeleteTree(treeID: string) {
    this.scene.remove(this.scene.getObjectByName(treeID)!);
  }

  NewTree() {
    //get name of tree from user
    const name = prompt("Category name (e.g. Studying, Working out, etc...)");
    if (name == undefined || name.replace(" ", "") == "") {
      return;
    }

    this.GiveInstruction("Click where you want to plant a new tree")

    //wait for user to click somewhere on screen
    const canvas = document.getElementById("canvas")!;
    const ClickHandler = ($e: MouseEvent) => {
      //convert clientx and clienty into x and y
      const pointer = this.ConvertClientCoordinatesToVector($e.clientX, $e.clientY);
      this.raycaster.setFromCamera(pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, false);

      if (intersects.length > 0 && intersects[0].object.name == "plane") {
        const intersectionPoint = intersects[0].point;
        
        //round x and z coordaintes to the nearest square
        let [x, z] = this.data.RoundPositionToNearestGridCell(intersectionPoint.x, intersectionPoint.z);

        try {
          this.data.AddCategory(name, { x: x, z: z });
          this.InitTrees(this.data.userData.categories);

          //open category viewer for this tree
          this.GoToCategory(name);
        }
        catch (error) {
          console.log(error); //user may try to place tree in same position as another tree
        }
      }

      this.HideInstruction();
      canvas.removeEventListener('click', ClickHandler);
    }
    canvas.addEventListener('click', ClickHandler);
  }

  InitTreeListeners() {
    const canvas = document.getElementById("canvas")!;

    canvas.onclick = ($e) => {
      //check if user clicked a tree (i.e. didn't click the ground, since that is the only other object)
      const pointer = this.ConvertClientCoordinatesToVector($e.clientX, $e.clientY);
      this.raycaster.setFromCamera(pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length == 0) {
        return;
      }

      if (intersects[0].object.name != "plane") { //clicked on a tree
        //open popup screen with this category
        const categoryID = intersects[0].object.name;
        console.log(intersects[0].object)
        this.GoToCategory(categoryID);
      }
      else { //otherwise, round the position to the nearest grid cell and check if there is a tree at that position
        const point = intersects[0].point;
        let [x, z] = this.data.RoundPositionToNearestGridCell(point.x, point.z);
        
        //go through categories and check for a tree at this position
        for (const category of this.data.userData.categories) {
          const tree = category.tree;
          if (tree.position.x == x && tree.position.z == z) {
            this.GoToCategory(category.id);
          }
        }
      }
    }
  }
  
  //Managing popup window and routes
  OpenPopup() {
    const popup = document.getElementById("popup")! as HTMLDialogElement;

    //@ts-ignore (angular typescript version is out of sync with local ts version, so angular doesn't know about popup.open attribute)
    popup.open = true;
  }
  ClosePopupHandler() { //executed whenever dialog box switches from open to closed (nothing)
    //@ts-ignore
    popup.open = false;
    this.router.navigate(['/']);
    //this.InitTrees(this.data.userData.categories);
  }

  GoToCategory(id: string) {
    //show popup and route to category screen with given category ID
    this.OpenPopup();
    this.router.navigate(['/category'], { queryParams: { categoryID: id } });
  }
  async CompleteHabit(categoryID: string, description: string) {
    //close popup, show watering animation, execute data.CompleteHabit and possibly show tree growth animation
    this.ClosePopupHandler();

    //watering animation; need to get category tree's position
    const position = this.data.userData.categories[this.data.GetCategoryIndex(categoryID)].tree.position;
    await this.Rain(position);

    this.data.CompleteHabit(categoryID, description);

    //show tree growth animation if possible

    this.InitTrees(this.data.userData.categories);
  }
  DeleteCategory(categoryID: string) {
    this.ClosePopupHandler();

    //get tree position and show tree death animation
    this.data.DeleteCategory(categoryID);
    this.DeleteTree(categoryID); //temporary solution while there is no animation for removing the tree
  }

  GoToHistory() {
    this.OpenPopup();
    this.router.navigate(['/history'])
  }






  //Animations
  Wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, ms);
    })
  }

  Rain(position: { x: number, z: number }) {
    return new Promise(async (resolve) => {
      //very simple rain animation: just a block of 'water' falling from y = 50 to y = 0
      const water = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0x13a3f0 }));
      water.position.x = position.x;
      water.position.y = 50;
      water.position.z = position.z;
      this.scene.add(water);

      while (water.position.y > 0) {
        water.position.y -= 1;
        await this.Wait(10);
      }

      resolve(undefined);
    })
  }
}
