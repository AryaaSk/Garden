import { Component } from '@angular/core';
import * as THREE from 'three';
import { DataServiceService, Category, Tree, Habit, Log, UserData } from './data-service.service';
import { Router } from '@angular/router';
import { CommunicationService } from './communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Web';

  scene!: THREE.Scene;
  camera!: THREE.Camera;
  renderer!: THREE.WebGLRenderer;
  raycaster!: THREE.Raycaster;

  constructor(private data: DataServiceService, private communication: CommunicationService, private router: Router) {}

  ngOnInit() {
    this.communication.completedHabitEvent.subscribe((data) => {
      this.CompleteHabit(data.categoryID, data.description);
    });

    this.communication.deleteCategoryEvent.subscribe((categoryID) => {
      console.log('recived event');
      this.DeleteCategory(categoryID);
    });
  }

  ngAfterViewInit() {
    this.InitTHREE();
    this.InitView();

    this.data.RetrieveData();
    this.InitTrees(this.data.userData.categories);

    this.InitTreeListeners();

    const popupDialogElement = document.getElementById("popup")!;
    popupDialogElement.addEventListener('close', () => {
      this.ClosePopupHandler();
    })

    const animate = () => {
      this.renderer.render(this.scene, this.camera);
    }
    this.renderer.setAnimationLoop(animate);
  }

  InitTHREE() {
    //Setting up renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new THREE.WebGLRenderer({ //renderer setup
      canvas: document.getElementById("canvas")!,
      alpha: true
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
    const geometry = new THREE.BoxGeometry( 20, 4, 20 );
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
    pointLight.position.set(10, 50, 10);
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

  InitTrees(categories: Category[]) {
    //'plant' a tree at its specified position on the plane
    //plane dimensions: 20x4x20 centered at origin

    for (const category of categories) {
      const tree = category.tree;

      //extract model for tree with specified type, hydration and growth
      const mesh = this.GetTreeModel(tree);
      mesh.name = category.id;
      this.scene.add(mesh);

      //position mesh; y-coordinate is determined by offseting mesh by half it's height and the half the height of the plane
      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(mesh);
      const height = boundingBox.max.y - boundingBox.min.y;
      mesh.position.set(tree.position.x, 0.5 * (4 + height), tree.position.z);
    }
  }
  GetTreeModel(tree: Tree): THREE.Mesh {
    //we don't currently have access to the models, so just return green boxes of varying sizes with different colours to represent hydration

    //the tree model should fit within a 5x20x5 square
    const colour = (tree.hydration <= 15) ? 0xc4a84b : 0x49c94f;
    const material = new THREE.MeshStandardMaterial({ color: colour });

    //oak has 8 growth levels and is the only supported type currently
    let dimensions = [0, 0, 0];
    switch (tree.growthLevel) {
      case 1:
        dimensions = [0.5, 2, 0.5]
        break;
      case 2:
        dimensions = [1, 3, 1]
        break;
      case 3:
        dimensions = [1.5, 5, 1.5]
        break;
      case 4:
        dimensions = [2, 8, 2]
        break;
      case 5:
        dimensions = [2.5, 10, 2.5]
        break;
      case 6:
        dimensions = [3, 12, 3]
        break;
      case 7:
        dimensions = [3.5, 15, 3.5]
        break;
      case 8:
        dimensions = [4.5, 19, 4.5]
        break;
      default:
        break
    }

    const geometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
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
        let [x, z] = [intersectionPoint.x, intersectionPoint.z];
        x -= 2.5; z -= 2.5;
        x = this.data.RoundToNearestMultiple(x, 5); z = this.data.RoundToNearestMultiple(z, 5);
        x += 2.5; z += 2.5;

        try {
          this.data.AddCategory(name, { x: x, z: z });
          this.InitTrees(this.data.userData.categories);
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
      const intersects = this.raycaster.intersectObjects(this.scene.children, false);

      if (intersects.length == 0 || intersects[0].object.name == "plane") {
        return;
      }

      //open popup screen with this category
      const categoryID = intersects[0].object.name;
      this.GoToCategory(categoryID);
    }
  }
  
  //Managing popup window and routes
  OpenPopup() {
    const popup = document.getElementById("popup")! as HTMLDialogElement;
    popup.open = true;
  }
  ClosePopupHandler() { //executed whenever dialog box switches from open to closed (nothing)
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
    this.InitTrees(this.data.userData.categories); //temporary solution while there is no animation for removing the tree
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
