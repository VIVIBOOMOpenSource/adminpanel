import React from 'react';
import { Slide } from 'react-toastify';

import { ReactComponent as firstFloor } from 'src/css/imgs/kampong_eunos/first-floor.svg';
import { ReactComponent as secondFloor } from 'src/css/imgs/kampong_eunos/second-floor.svg';

import highlight from 'src/css/gifs/highlight.gif';

import mailbox from 'src/css/imgs/kampong_eunos/mailbox.png';
import vivitaSign from 'src/css/imgs/kampong_eunos/vivita-sign.png';
import otterImage from 'src/css/imgs/kampong_eunos/otter.png';
import otter from 'src/css/gifs/otter.gif';

import grassSvg from 'src/css/imgs/kampong_eunos/grass.svg';

import flower from 'src/css/lotties/flower.json';
import flower2 from 'src/css/lotties/flower-2.json';
import grass from 'src/css/lotties/grass.json';
import coconut from 'src/css/lotties/coconut.json';
import mapPin from 'src/css/lotties/map-pin.json';

import wackerWall from 'src/css/imgs/kampong_eunos/wacker-wall.svg';
import panel1 from 'src/css/imgs/kampong_eunos/panel1.svg';
import panel2 from 'src/css/imgs/kampong_eunos/panel2.svg';
import shopbot from 'src/css/imgs/kampong_eunos/shopbot.svg';

import machineCart from 'src/css/imgs/kampong_eunos/machine-cart.svg';
import sewingCorner from 'src/css/imgs/kampong_eunos/sewing-corner.svg';
import ciscoBoard from 'src/css/imgs/kampong_eunos/cisco-board.svg';
import cocoon from 'src/css/imgs/kampong_eunos/cocoon.svg';
import noticeBoard from 'src/css/imgs/kampong_eunos/notice_board.png';
import studio from 'src/css/imgs/kampong_eunos/studio.svg';
import recyclingCorner from 'src/css/imgs/kampong_eunos/recycling-corner.svg';
import electronicCorner from 'src/css/imgs/kampong_eunos/electronic-corner.svg';
import arena from 'src/css/imgs/kampong_eunos/arena.svg';

import stringSvg from 'src/css/imgs/kampong_eunos/string.svg';

import cardboardAutomata from 'src/css/imgs/kampong_eunos/cardboard-automata.png';
import deer from 'src/css/imgs/kampong_eunos/deer.png';
import marbleRun from 'src/css/imgs/kampong_eunos/marble-run.png';
import mickey from 'src/css/imgs/kampong_eunos/mickey.png';
import rabbit from 'src/css/imgs/kampong_eunos/rabbit.png';
import scratch from 'src/css/imgs/kampong_eunos/scratch.png';
import skateboard from 'src/css/imgs/kampong_eunos/skateboard.png';
import blossom from 'src/css/imgs/kampong_eunos/blossom.png';
import galleryWall from 'src/css/imgs/kampong_eunos/gallery-wall.png';

import fridge from 'src/css/imgs/kampong_eunos/fridge.svg';
import cupboard from 'src/css/imgs/kampong_eunos/cupboard.svg';
import birthdayCake from 'src/css/imgs/kampong_eunos/birthday-cake.png';
import cake from 'src/css/imgs/kampong_eunos/cake.png';

import sewingMachine from 'src/css/imgs/kampong_eunos/sewing-machine.svg';
import hat from 'src/css/imgs/kampong_eunos/hat.svg';
import table from 'src/css/imgs/kampong_eunos/table.svg';
import craftOven from 'src/css/imgs/kampong_eunos/craft-oven.svg';
import vacuumFormer from 'src/css/imgs/kampong_eunos/vacuum-former.svg';
import digitalPlotter from 'src/css/imgs/kampong_eunos/digital-plotter.svg';
import a4Printer from 'src/css/imgs/kampong_eunos/a4-printer.svg';
import a3Printer from 'src/css/imgs/kampong_eunos/a3-printer.svg';
import heatPress from 'src/css/imgs/kampong_eunos/heat-press.svg';

// import chaptek from 'src/css/imgs/kampong_eunos/chaptek.png';
// import fiveStones from 'src/css/imgs/kampong_eunos/five_stones.png';
// import greatWaterCupRace from 'src/css/imgs/kampong_eunos/great_water_cup_race.png';
// import pickUpSticks from 'src/css/imgs/kampong_eunos/pick_up_sticks.png';
// import snacks from 'src/css/imgs/kampong_eunos/snacks.png';
// import snakesAndLadders from 'src/css/imgs/kampong_eunos/snakes_and_ladders.png';
// import woodenTop from 'src/css/imgs/kampong_eunos/wooden_top.png';
import registration from 'src/css/imgs/kampong_eunos/registration.png';

import tesselations from 'src/css/imgs/kampong_eunos/tesselations.png';
import tesselationTable from 'src/css/imgs/kampong_eunos/tesselation-table.svg';
import merch from 'src/css/imgs/kampong_eunos/merch.png';
import roboway from 'src/css/imgs/kampong_eunos/roboway.png';
import communityWall from 'src/css/imgs/check-in-notification/community.png';
import exhibition from 'src/css/imgs/kampong_eunos/exhibition.svg';
import exhibitionContent from 'src/css/imgs/kampong_eunos/exhibition-content.png';
import fakeFood from 'src/css/imgs/check-in-notification/fake_food.png';

import yellowCar from 'src/css/imgs/kampong_eunos/yellow_car.png';
import greenCar from 'src/css/imgs/kampong_eunos/green_car.png';

export const showAnimation = true;

export const toastOption = {
  position: 'bottom-right', hideProgressBar: true, transition: Slide, className: 'canvas-toast',
};

export const deviceWidth = window.innerWidth;
export const deviceHeight = window.innerHeight;

const mapWidth = 4096;
const mapHeight = 4096;

export const canvasWidth = deviceWidth / deviceHeight < mapWidth / mapHeight ? deviceWidth : (deviceHeight / mapHeight) * mapWidth;
export const canvasHeight = deviceWidth / deviceHeight < mapWidth / mapHeight ? (deviceWidth / mapWidth) * mapHeight : deviceHeight;

const roomMapWidth = 1280;
const roomMapHeight = 720;

export const roomCanvasWidth = deviceWidth / deviceHeight < roomMapWidth / roomMapHeight ? deviceWidth : (deviceHeight / roomMapHeight) * roomMapWidth;
export const roomCanvasHeight = deviceWidth / deviceHeight < roomMapWidth / roomMapHeight ? (deviceWidth / roomMapWidth) * roomMapHeight : deviceHeight;

const scale = canvasWidth / mapWidth;
const roomScale = roomCanvasWidth / roomMapWidth;

export const defaultZoom = 2;
export const defaultPosition = { x: -0.1 * canvasWidth, y: -0.25 * canvasHeight };

export const zoomStep = 0.5;
export const zoomMin = 1;
export const zoomMax = 4.5;

export const getDraggableBounds = (z) => ({
  left: deviceWidth - 1.1 * z * canvasWidth, right: 0.1 * z * canvasWidth, top: deviceHeight - 1.1 * z * canvasHeight, bottom: 0.1 * z * canvasHeight,
});

/**
 * Floors to be shown.
 */

export const floors = {
  first: {
    id: 'firstFloor',
    svg: firstFloor,
    location: { x: 0.16 * canvasWidth, y: 0.34 * canvasHeight },
    width: 2.5 * 1280 * scale,
    height: 2.5 * 720 * scale,
  },
  second: {
    id: 'secondFloor',
    svg: secondFloor,
    location: { x: 0.248 * canvasWidth, y: 0.035 * canvasHeight },
    width: 2.5 * 1280 * scale,
    height: 2.5 * 720 * scale,
  },
};

/**
 * floor items to be shown individually. this is the data to shown on kampong eunos map
 * The position data will be tuned later
 */
export const floorItems = [
  {
    id: 'wackerWall',
    image: wackerWall,
    location: { x: 0.45 * canvasWidth, y: 0.3475 * canvasHeight },
    width: 580 * scale,
    height: 550 * scale,
    floor: 'firstFloor',
    children: (
      <div className="reflection-anim" style={!showAnimation ? { animation: 0 } : {}}>
        <div className="reflection-anim-1" />
        <div className="reflection-anim-2" />
      </div>),
  },
  // {
  //   id: 'greatWaterCupRace',
  //   image: greatWaterCupRace,
  //   location: { x: 0.76 * canvasWidth, y: 0.37 * canvasHeight },
  //   width: 500 * scale,
  //   height: 500 * scale,
  //   animation: 'pulsate',
  //   floor: 'firstFloor',
  //   style: !showAnimation ? { transform: 'skewY(20deg) skewX(-20deg)' } : {},
  // },
  {
    id: 'panel1', image: panel1, location: { x: 0.3 * canvasWidth, y: 0.4275 * canvasHeight }, width: 274 * scale, height: 200 * scale, floor: 'firstFloor', contentKey: 'viviwarePanels',
  },
  {
    id: 'panel2', image: panel2, location: { x: 0.365 * canvasWidth, y: 0.4375 * canvasHeight }, width: 274 * scale, height: 200 * scale, floor: 'firstFloor', contentKey: 'viviwarePanels',
  },
  {
    id: 'shopbot', image: shopbot, location: { x: 0.455 * canvasWidth, y: 0.51 * canvasHeight }, width: 300 * scale, height: 249 * scale, floor: 'firstFloor',
  },
  {
    id: 'machineCart', image: machineCart, location: { x: 0.568 * canvasWidth, y: 0.2275 * canvasHeight }, width: 568 * scale, height: 520 * scale, floor: 'secondFloor', disabled: true,
  },
  {
    id: 'viviwarePanel', image: exhibition, location: { x: 0.505 * canvasWidth, y: 0.105 * canvasHeight }, width: 300 * scale, height: 350 * scale, floor: 'secondFloor',
  },
  {
    id: 'exhibitionContent', image: exhibitionContent, location: { x: 0.51 * canvasWidth, y: 0.113 * canvasHeight }, width: 250 * scale, height: 300 * scale, floor: 'secondFloor', contentKey: 'viviwarePanel',
  },
  {
    id: 'fake-food-table', image: tesselationTable, location: { x: 0.567 * canvasWidth, y: 0.18 * canvasHeight }, width: 200 * scale, height: 200 * scale, floor: 'secondFloor', contentKey: 'fakeFood',
  },
  {
    id: 'fakeFood',
    image: fakeFood,
    location: { x: 0.575 * canvasWidth, y: 0.175 * canvasHeight },
    width: 120 * scale,
    height: 120 * scale,
    floor: 'secondFloor',
    animation: 'no-skew-pulsate',
  },
  {
    id: 'sewingCorner', image: sewingCorner, location: { x: 0.608 * canvasWidth, y: 0.1975 * canvasHeight }, width: 200 * scale, height: 240 * scale, floor: 'secondFloor',
  },
  {
    id: 'tessalation-table', image: tesselationTable, location: { x: 0.56 * canvasWidth, y: 0.23 * canvasHeight }, width: 225 * scale, height: 225 * scale, floor: 'secondFloor', contentKey: 'tessalations',
  },
  {
    id: 'tessalations',
    image: tesselations,
    location: { x: 0.5775 * canvasWidth, y: 0.232 * canvasHeight },
    width: 100 * scale,
    height: 100 * scale,
    floor: 'secondFloor',
    animation: 'no-skew-pulsate',
  },
  {
    id: 'cocoon', image: cocoon, location: { x: 0.325 * canvasWidth, y: 0.175 * canvasHeight }, width: 240 * scale, height: 160 * scale, floor: 'secondFloor',
  },
  {
    id: 'merch',
    image: merch,
    location: { x: 0.39 * canvasWidth, y: 0.105 * canvasHeight },
    width: 160 * scale,
    height: 160 * scale,
    floor: 'secondFloor',
    animation: 'no-skew-pulsate',
  },
  {
    id: 'recyclingCorner', image: recyclingCorner, location: { x: 0.41 * canvasWidth, y: 0.1287 * canvasHeight }, width: 280 * scale, height: 300 * scale, floor: 'secondFloor',
  },
  {
    id: 'ciscoBoard', image: ciscoBoard, location: { x: 0.42 * canvasWidth, y: 0.20 * canvasHeight }, width: 200 * scale, height: 320 * scale, floor: 'secondFloor',
  },
  {
    id: 'electronicCorner', image: electronicCorner, location: { x: 0.49 * canvasWidth, y: 0.24 * canvasHeight }, width: 300 * scale, height: 300 * scale, floor: 'secondFloor',
  },
  {
    id: 'arena', image: arena, location: { x: 0.466 * canvasWidth, y: 0.167 * canvasHeight }, width: 320 * scale, height: 320 * scale, floor: 'secondFloor', contentKey: 'roboway',
  },
  {
    id: 'roboway',
    image: roboway,
    location: { x: 0.495 * canvasWidth, y: 0.193 * canvasHeight },
    width: 90 * scale,
    height: 90 * scale,
    floor: 'secondFloor',
    animation: 'no-skew-pulsate',
  },
  {
    id: 'communityWall',
    image: communityWall,
    location: { x: 0.63 * canvasWidth, y: 0.34 * canvasHeight },
    width: 200 * scale,
    height: 200 * scale,
    floor: 'secondFloor',
    animation: 'no-skew-pulsate',
  },
  {
    id: 'studio', image: studio, location: { x: 0.67 * canvasWidth, y: 0.2587 * canvasHeight }, width: 786 * scale, height: 546 * scale, floor: 'secondFloor',
  },
  {
    id: 'noticeBoard', image: noticeBoard, location: { x: 0.672 * canvasWidth, y: 0.31 * canvasHeight }, width: 190 * scale, height: 190 * scale, floor: 'secondFloor', style: { transform: 'skewY(5deg)' },
  },
];

export const rooms = [
  {
    id: 'gallery',
    location: { x: 0.616 * canvasWidth, y: 0.567 * canvasHeight },
    width: 280 * scale,
    height: 280 * scale,
    lottie: mapPin,
    floor: 'firstFloor',
  },
  {
    id: 'pantry',
    location: { x: 0.72 * canvasWidth, y: 0.51 * canvasHeight },
    width: 280 * scale,
    height: 280 * scale,
    lottie: mapPin,
    floor: 'firstFloor',
  },
  {
    id: 'tinkeringStudio',
    location: { x: 0.6 * canvasWidth, y: 0.21 * canvasHeight },
    width: 280 * scale,
    height: 280 * scale,
    lottie: mapPin,
    floor: 'secondFloor',
  },
];

/**
 * These data need to be tuned further
 */
export const assets = {
  kampongEunos: [
    {
      id: 'mailbox',
      image: mailbox,
      location: { x: 0.06 * canvasWidth, y: 0.73 * canvasHeight },
      width: 69 * scale,
      height: 131 * scale,
      animation: 'rotation',
    },
    {
      id: 'vivitaSign',
      image: vivitaSign,
      location: { x: 0.224 * canvasWidth, y: 0.83 * canvasHeight },
      width: 290 * scale,
      height: 309 * scale,
      animation: 'rotation',
    },
    {
      id: 'otter', image: showAnimation ? otter : otterImage, location: { x: 0.085 * canvasWidth, y: 0.28 * canvasHeight }, width: 180 * scale, height: 180 * scale,
    },
    {
      id: 'greenCar', image: greenCar, location: { x: 0.35 * canvasWidth, y: 0.75 * canvasHeight }, width: 500 * scale, height: 500 * scale, skewXAngle: -20, skewYAngle: 20,
    },
    {
      id: 'yellowCar', image: yellowCar, location: { x: 0.30 * canvasWidth, y: 0.78 * canvasHeight }, width: 500 * scale, height: 500 * scale, skewXAngle: -20, skewYAngle: 20,
    },
    {
      id: 'registration', image: registration, location: { x: 0.43 * canvasWidth, y: 0.7 * canvasHeight }, width: 450 * scale, height: 450 * scale,
    },
    // {
    //   id: 'snacks', image: snacks, location: { x: 0.18 * canvasWidth, y: 0.51 * canvasHeight }, width: 450 * scale, height: 450 * scale,
    // },
    // {
    //   id: 'snakesAndLadders',
    //   image: snakesAndLadders,
    //   location: { x: 0.08 * canvasWidth, y: 0.547 * canvasHeight },
    //   width: 510 * scale,
    //   height: 510 * scale,
    //   style: { transform: 'skewY(20deg) skewX(-20deg)' },
    //   animation: 'pulsate',
    // },
    // {
    //   id: 'chaptek',
    //   image: chaptek,
    //   location: { x: 0.03 * canvasWidth, y: 0.587 * canvasHeight },
    //   width: 300 * scale,
    //   height: 300 * scale,
    //   style: { transform: 'skewY(20deg) skewX(-20deg)' },
    //   animation: 'pulsate',
    // },
    // {
    //   id: 'fiveStones',
    //   image: fiveStones,
    //   location: { x: 0.1 * canvasWidth, y: 0.627 * canvasHeight },
    //   width: 300 * scale,
    //   height: 300 * scale,
    //   style: { transform: 'skewY(20deg) skewX(-20deg)' },
    //   animation: 'pulsate',
    // },
    // {
    //   id: 'woodenTop',
    //   image: woodenTop,
    //   location: { x: -0.02 * canvasWidth, y: 0.617 * canvasHeight },
    //   width: 300 * scale,
    //   height: 300 * scale,
    //   style: { transform: 'skewY(20deg) skewX(-20deg)' },
    //   animation: 'pulsate',
    // },
    // {
    //   id: 'pickUpSticks',
    //   image: pickUpSticks,
    //   location: { x: 0.06 * canvasWidth, y: 0.667 * canvasHeight },
    //   width: 300 * scale,
    //   height: 300 * scale,
    //   style: { transform: 'skewY(20deg) skewX(-20deg)' },
    //   animation: 'pulsate',
    // },
  ],
  gallery: [
    {
      id: 'galleryWall', image: galleryWall, location: { x: 0.72 * roomCanvasWidth, y: 0.075 * roomCanvasHeight }, width: 310 * roomScale, height: 620 * roomScale, style: { opacity: 0.6 },
    },
    {
      id: 'rabbit',
      image: rabbit,
      location: { x: 0.31 * roomCanvasWidth, y: 0.6 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <div className="hanging-line" style={{ left: 54 * roomScale, height: 240 * roomScale, bottom: 117 * roomScale }} />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'scratch',
      image: scratch,
      location: { x: 0.46 * roomCanvasWidth, y: 0.7 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <div className="hanging-line" style={{ left: 54 * roomScale, height: 240 * roomScale, bottom: 117 * roomScale }} />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'skateboard',
      image: skateboard,
      location: { x: 0.61 * roomCanvasWidth, y: 0.6 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <div className="hanging-line" style={{ left: 54 * roomScale, height: 240 * roomScale, bottom: 117 * roomScale }} />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'cardboardAutomata',
      image: cardboardAutomata,
      location: { x: 0.19 * roomCanvasWidth, y: 0.35 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <img
          src={stringSvg}
          alt="string"
          className="hanging-svg"
          style={{
            left: 35 * roomScale,
            width: 40 * roomScale,
            height: 50 * roomScale,
            bottom: 117 * roomScale,
            transform: 'scaleY(5.4)',
            transformOrigin: '50% 100%',
          }}
        />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'blossom',
      image: blossom,
      location: { x: 0.31 * roomCanvasWidth, y: 0.15 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <img
          src={stringSvg}
          alt="string"
          className="hanging-svg"
          style={{
            left: 35 * roomScale,
            width: 40 * roomScale,
            height: 50 * roomScale,
            bottom: 117 * roomScale,
            transform: 'scaleY(2.3)',
            transformOrigin: '50% 100%',
          }}
        />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'deer',
      image: deer,
      location: { x: 0.46 * roomCanvasWidth, y: 0.25 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <img
          src={stringSvg}
          alt="string"
          className="hanging-svg"
          style={{
            left: 35 * roomScale,
            width: 40 * roomScale,
            height: 50 * roomScale,
            bottom: 117 * roomScale,
            transform: 'scaleY(3.8)',
            transformOrigin: '50% 100%',
          }}
        />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'marbleRun',
      image: marbleRun,
      location: { x: 0.61 * roomCanvasWidth, y: 0.15 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <img
          src={stringSvg}
          alt="string"
          className="hanging-svg"
          style={{
            left: 35 * roomScale,
            width: 40 * roomScale,
            height: 50 * roomScale,
            bottom: 117 * roomScale,
            transform: 'scaleY(2.3)',
            transformOrigin: '50% 100%',
          }}
        />
      ),
      animation: 'hanging-animation',
    },
    {
      id: 'mickey',
      image: mickey,
      location: { x: 0.73 * roomCanvasWidth, y: 0.35 * roomCanvasHeight },
      width: 111 * roomScale,
      height: 120 * roomScale,
      children: (
        <img
          src={stringSvg}
          alt="string"
          className="hanging-svg"
          style={{
            left: 35 * roomScale,
            width: 40 * roomScale,
            height: 50 * roomScale,
            bottom: 117 * roomScale,
            transform: 'scaleY(5.4)',
            transformOrigin: '50% 100%',
          }}
        />
      ),
      animation: 'hanging-animation',
    },
  ],
  pantry: [
    {
      id: 'fridge', image: fridge, location: { x: 0.27 * roomCanvasWidth, y: 0.35 * roomCanvasHeight }, width: 180 * roomScale, height: 300 * roomScale, contentKey: 'appliance', animation: 'hide-top',
    },
    {
      id: 'cupboard', image: cupboard, location: { x: 0.388 * roomCanvasWidth, y: 0.5 * roomCanvasHeight }, width: 473.7 * roomScale, height: 189.3 * roomScale, contentKey: 'appliance', animation: 'hide-top',
    },
    {
      id: 'birthdayCake',
      image: birthdayCake,
      location: { x: 0.7 * roomCanvasWidth, y: 0.45 * roomCanvasHeight },
      width: 236 * roomScale,
      height: 373.3 * roomScale,
      animation: 'hide-right',
      children: <img src={highlight} alt="highlight" className="highlight" />,
    },
    {
      id: 'cake', image: cake, location: { x: 0.54 * roomCanvasWidth, y: 0.54 * roomCanvasHeight }, width: 40 * roomScale, height: 40 * roomScale, animation: 'hide-top',
    },
  ],
  tinkeringStudio: [
    {
      id: 'table', image: table, location: { x: 0.01 * roomCanvasWidth, y: 0.68 * roomCanvasHeight }, width: 429.3 * roomScale, height: 166.7 * roomScale, animation: 'hide-left', contentKey: 'sewingCorner',
    },
    {
      id: 'hat', image: hat, location: { x: 0.24 * roomCanvasWidth, y: 0.55 * roomCanvasHeight }, width: 61.3 * roomScale, height: 106.7 * roomScale, animation: 'hide-left',
    },
    {
      id: 'sewingMachine', image: sewingMachine, location: { x: 0.075 * roomCanvasWidth, y: 0.6 * roomCanvasHeight }, width: 81.6 * roomScale, height: 66.7 * roomScale, animation: 'hide-left', contentKey: 'sewingCorner',
    },
    {
      id: 'vacuumFormer', image: vacuumFormer, location: { x: 0.85 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 168 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
    {
      id: 'craftOven', image: craftOven, location: { x: 0.799 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 168 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
    {
      id: 'digitalPlotter', image: digitalPlotter, location: { x: 0.745 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 168 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
    {
      id: 'a4Printer', image: a4Printer, location: { x: 0.642 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 211 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
    {
      id: 'a3Printer', image: a3Printer, location: { x: 0.523 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 201.7 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
    {
      id: 'heatPress', image: heatPress, location: { x: 0.416 * roomCanvasWidth, y: 0.36 * roomCanvasHeight }, width: 174.7 * roomScale, height: 306.7 * roomScale, animation: 'hide-right',
    },
  ],
};

/**
 * These data need to be tuned further
 */
export const staticAssets = {
  kampongEunos: [
    {
      id: 'grass-svg', image: grassSvg, location: { x: 0.065 * canvasWidth, y: 0.26 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'coconut-1', lottie: coconut, location: { x: -0.04 * canvasWidth, y: 0.1 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-2', lottie: coconut, location: { x: 0.06 * canvasWidth, y: 0.0422 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-3', lottie: coconut, location: { x: 0.16 * canvasWidth, y: -0.0156 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-4', lottie: coconut, location: { x: 0.26 * canvasWidth, y: -0.0734 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-5', lottie: coconut, location: { x: 0.16 * canvasWidth, y: 0.1 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-6', lottie: coconut, location: { x: 0.26 * canvasWidth, y: 0.0422 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-7', lottie: coconut, location: { x: 0.36 * canvasWidth, y: -0.0156 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'coconut-8', lottie: coconut, location: { x: 0.46 * canvasWidth, y: -0.0734 * canvasHeight }, width: 600 * scale, height: 600 * scale,
    },
    {
      id: 'grass-1', lottie: flower, location: { x: 0.25 * canvasWidth, y: 0.355 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'grass-2', lottie: flower2, location: { x: 0.19 * canvasWidth, y: 0.385 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'grass-3', lottie: grass, location: { x: 0.05 * canvasWidth, y: 0.45 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'grass-4', lottie: flower2, location: { x: 0.08 * canvasWidth, y: 0.16 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'grass-5', lottie: grass, location: { x: 0.295 * canvasWidth, y: 0.12 * canvasHeight }, width: 200 * scale, height: 200 * scale,
    },
    {
      id: 'grass-6', lottie: flower, location: { x: 0.382 * canvasWidth, y: 0.015 * canvasHeight }, width: 180 * scale, height: 180 * scale,
    },
    {
      id: 'grass-7', lottie: grass, location: { x: 0.68 * canvasWidth, y: 0.82 * canvasHeight }, width: 240 * scale, height: 240 * scale,
    },
  ],
  gallery: [
  ],
  pantry: [
  ],
  tinkeringStudio: [
  ],
};

export const info = {
  template: {
    title: 'template',
    subtitle: 'subtitle',
    contents: [
      'content1',
      'content2',
      'content3',
    ],
  },
  mailbox: {
    title: 'Our New Home - 10 Kampong Eunos, Singapore 417775',
    contents: [
      '10 Kampong Eunos is officially Vivistop Kampong Eunos! Come be our pen pal and send us a post card from wherever you are! 💌',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709875678/VIVISTOP_KAMPONG_EUNOS_vpsmyd.png'],
  },
  otter: {
    title: 'Otter Friends!',
    contents: [
      "Hey there! Did you know that our building is home to some super cute otters? During the day, you can spot them wiggling and waggling along the water's edge, playing hide-and-seek among the reeds and splashing about like tiny water acrobats! Keep a watchful eye by the longkang, and you might just catch a glimpse of these playful little critters zooming around, their sleek bodies shining in the sun like magical water sprites.",
      "Sometimes, when the moon comes out to play, these otters might even snuggle up near our building to sleep! So, as you explore our kampong, keep your eyes peeled for their cozy hideouts—they're sure to make your day even more magical!",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709808052/otter-cctv_eyx4az.jpg'],
  },
  shopbot: {
    title: 'ShopBot – the Ultimate Workshop Wizard!',
    contents: [
      "You sketch something awesome, and ShopBot takes charge, using its special tools to carve it out from wood or other fantastic materials. It's like having a robot craftsman right at your fingertips!",
      "Here's the exciting part – you can craft toys, signs, or even invent your very own gadgets. So, if you've got big dreams of building incredible things, meet ShopBot – your gateway to turning dreams into hands-on, real-life creations! 🛠️✨🚀",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709862835/photo_2_2024-03-08_09-53-42_uvcvaz.jpg'],
  },
  laserCutter: {
    title: 'LaserCraft: Sculpting Dreams with Beams of Precision!',
    contents: [
      'Unleash the power of creation with our Laser Cutter, a magical tool that turns your imagination into reality. Picture crafting intricate designs with the precision of laser beams, transforming materials into mesmerizing works of art. Dive into the world of laser cutting and watch your ideas come to life with unparalleled accuracy and creativity. Elevate your crafting journey – where precision meets imagination! 🚀🔍🎨',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709862835/photo_1_2024-03-08_09-53-42_xi4jop.jpg'],
  },
  garden: {
    title: 'Introducing the GreenThumb Haven!',
    contents: [
      "Picture this as your very own garden sanctuary, where you become the wizard of blooms and greens. The GreenThumb Haven isn't just a patch of soil; it's your canvas for crafting nature's masterpiece.",
      "Plant your favorite flowers, tend to the veggies you love, and watch as your garden comes to life under your care. It's like creating your own slice of paradise, where every bloom and leaf reflects your touch! 🌿🌷🌞",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709863216/Untitled_design_17_ckfzod.png'],
  },
  cucumber: {
    title: 'Wild Cucumbers spotted!',
    contents: [
      'Go checkout the mini wild cucumbers growing at the fence near our gallery!',
      "Please do not eat these cucumbers. Let's see how large these cucumbers can grow!",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709862835/photo_4_2024-03-08_09-53-42_o4dyre.jpg'],
  },
  skateboard: {
    title: 'Pursuing our interests! - Dragon Skateboard',
    contents: [
      'Dragon Skateboard is a project completed by our Vivinaut with the guidance of our very talented and helpful crews. Just take a look at how smooth the wood finishing is!',
    ],
    projectIds: [81],
  },
  furniture: {
    title: 'Safari Furniture',
    contents: [
      'With the goal of making a set of modular furniture for children, our Vivinaut designed and produced the Safari Furniture series consisting of a chair, a stool and a foot stool as part of our Lighthouse program!',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709860314/Sawa_Chair_Shelves_e_1_dokytg.jpg'],
  },
  projects: {
    title: 'Behold the Unleashed Genius of Our Young Creators!',
    contents: [
      'In the heart of our organization, a constellation of bright minds shines as our young trailblazers, the Vivinauts. These brilliant children are not just dreamers; they are creators, architects of their own imaginative universes.',
      'Step into their world and witness the magic they weave through countless projects, each one a testament to boundless creativity and untamed curiosity. From whimsical artworks that defy gravity to innovative gadgets that challenge the status quo, our Vivinauts are crafting a future that transcends the ordinary. 🌟🌈🌐',
    ],
    projectIds: [1201, 1262, 828],
  },
  threeDPrinter: {
    title: '3D Printed Accessories for Viviware Panels',
    subtitle: 'Introducing Viviware Panels – Your Ticket to Swift, Stylish Furniture! ',
    contents: [
      "Transforming your space is now a breeze with our modular furniture system. Just imagine: 3D printed accessories and wood panels coming together like puzzle pieces to create furniture that's uniquely yours.",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709861848/IMG_9119_khnonr.jpg'],
  },
  tools: {
    title: "It's always easy to assemble",
    contents: [
      'No need for complicated tools. A few nuts and bolts, a screwdriver or drill, and a mallet are all you need. Within just a few hours, you can assemble your dream furniture without breaking a sweat.',
      'We recently revamped our entire space with Viviware Panels, and the transformation took just 6 hours! Join the swift and stylish revolution in home design with Viviware Panels. Your space, your style, effortlessly assembled! 🛋️🔧✨',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709861609/IMG_8974_jskvk2.jpg'],
  },
  deckChair: {
    title: 'Customisable for Your Needs',
    contents: [
      'In a recent endeavor to rest and relax, our crew Abel has created a deck chair! Just look at all these folks kicking back during our breaktimes!',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709860767/photo_7_2024-03-08_09-19-03_p8aarl.jpg'],
  },
  appliance: {
    title: 'Welcome to Our Culinary Haven: A Kitchen of Dreams!',
    contents: [
      "Here, the clinking of utensils, the sizzling symphony, and the hum of the fridge compose a melody that resonates with the joy of cooking and the art of sharing. It's a space where culinary aspirations take flight, and every meal is a masterpiece waiting to be crafted.",
      'Join us in this culinary haven, as we savor the delights of this gastronomic wonderland! 🌮🍜🍰',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709860767/photo_6_2024-03-08_09-19-03_fr8z39.jpg'],
  },
  mantou: {
    title: 'Kawaii Mantou',
    contents: [
      'Through Viviboom, we have initiated a myriad of challenges for our Vivinauts! One of such challenge is the Kawaii Mantou Challenge',
      'In this enchanting challenge, we invite children to become master chefs and artistic designers of their very own Kawaii Mantou! Imagine fluffy, steamed buns that not only',
      'Just take a look at their  delight your taste buds but also bring a smile to your face.',
    ],
    projectIds: [327],
  },
  patio: {
    title: 'Where Culinary Delights Meet Relaxed Revelry! 🌿🍕🔥',
    subtitle: 'subtitle',
    contents: [
      'Picture this exciting vision for our future: A dreamy patio adorned with a custom-built pizza oven, emanating warmth and the enticing aroma of freshly baked dough and flavorful toppings.',
      "Now, here's where the magic happens – we're dreaming big and planning to turn this vision into a reality! We're on a mission to build our very own pizza oven and barbecue station, and we're inviting all the young aspiring chefs and creators to join us in this incredible journey.",
      'So keep a look out for an invitation to join us on this exciting journey in the near future through our Viviboom events!',
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709861030/photo_3_2024-03-08_09-19-03_1_tb3e6l.png'],
  },
  heatPress: {
    title: 'Empower Your Projects with HeatPress',
    subtitle: 'Come Custom-Make Shirts or Craft Unique Wallets by Fusing Plastics!',
    projectIds: [74, 721],
  },
  craftOven: {
    title: 'Model with your hands!',
    contents: [
      "Imagine sculpting your own magical creatures, crafting mini masterpieces, and bringing your wildest ideas to life. The clay oven isn't just an oven – it's a portal to a world of artistic wonders. Let's mold, bake, and create incredible treasures together! 🌈🔥🏺",
    ],
    projectIds: [1253],
  },
  digitalPlotter: {
    title: 'Dive into the World of Fun and Creativity with Cricut!',
    contents: [
      'With Cricut, you can make cool stickers, craft colorful cards, and even bring your favorite characters to life!',
      'Check out some cool projects done by our Vivinauts!',
    ],
    projectIds: [690],
  },
  vacuumFormer: {
    title: 'Turn your coolest designs into 3D wonders',
    contents: [
      "The vacuum former isn't just a machine – it helps you turn flat stuff into awesome, touchable, and super cool things. It's like having a machine that brings your drawings and toys to life in a whole new dimension! How cool is that? 🚀🎨✨",
    ],
    videoUrls: ['https://www.youtube.com/embed/FZF5rii2Zls'],
  },
  ciscoBoard: {
    title: 'Brainstorm and dream up projects with the Cisco Boards',
    subtitle: 'A donation from Cisco to VIVITA',
    contents: [
      "You are here! Meet the Cisco Board – your internet superhero! Think of it as the brain behind the scenes, making sure messages and cat videos zip around the internet super fast. It's the tech wizard connecting your gadgets and making online adventures possible. Cisco Board: where internet magic happens! 🌐💻✨",
    ],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709908655/e895f4ce04af43ed913d1336d8970b5b_q7rima.webp'],
  },
  midi: {
    title: 'Do you wanna be a producer?',
    subtitle: 'Make your production dreams come through here!',
    contents: [
      "Get ready to unleash your musical prowess! Your enthusiasm for creating music has caught our attention, and we're thrilled to present you with an exhilarating challenge. Dive into the electrifying world of Vivistudio, a cutting-edge space equipped with a top-notch microphone and MIDI technology. It's time to turn your musical dreams into a thrilling reality – let the excitement begin! 🎵🚀",
    ],
    videoUrls: ['https://www.youtube.com/embed/XJhKxvoYP7M'],
  },
  desktop: {
    title: 'Realise your dreams to be the next Mr Beast!',
    subtitle: 'A new powerful desktop setup awaits',
    contents: [
      "Vivistudio's desktop setup, your ultimate playground for streaming games and making killer tunes, podcasts and videos with GarageBand, LogicPro, and InShot. It's like having your own creative wonderland! So, kick back, let the vibes flow, and let's turn your ideas into pure magic! 🎵🎬✨",
      'Checkout a lego video made by our Vivinaut!',
    ],
    videoUrls: ['https://res.cloudinary.com/viviboom/video/upload/s--Fdy7gfb1--/v1/production/vbuzdfmxwh2irwi0wh8y.mp4?width=1024'],
  },
  videography: {
    title: 'Influencing the next generation',
    subtitle: 'Pursue your dreams to be an influencer!',
    contents: [
      'With our new green screen and videography equipment, you could achieve your dreams in being our next generation influencer that inspires others',
      'Explore the joy of VTubing in this day and age as you create content!',
    ],
    videoUrls: ['https://www.youtube.com/embed/7FYRAD3boOA'],
  },
  wackerWall: {
    title: 'Wacker Wall',
    contents: ['Come join us and expand on the random shapes on our wall by painting! Do not fret if you want to make your art work better! All you have to do is just peel off the paint and repaint!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709863718/IMG_20240305_205027_932_gcgr4q.jpg'],
  },
  hat: {
    title: 'Making of hats',
    contents: ['In a quest to hone their skills in sewing, our Vivinauts has taken up the challenge of making their own hats from scratch! It was a fun and inspiring experience as we witness the myriad of hat designs that our young creators could come up with!'],
    projectIds: [662, 285, 303],
  },
  sewingMachine: {
    title: 'Sewing Machine',
    contents: [" Imagine a super-fast, friendly robot that helps you sew together your favorite fabrics to create awesome clothes, toys, and more. With its needle as a magic wand, the sewing machine brings your ideas to life, making everything from colorful clothes to cozy blankets. It's the coolest buddy for turning your creative dreams into stitched wonders! 🧵✨"],
    projectIds: [247],
  },
  a4Printer: {
    title: 'A4 Printer',
    contents: ['Picture a printer as your very own paper artist! This awesome contraption is like a paintbrush, but instead of colors, it uses ink to craft your digital dreams onto paper. With a magical touch, it transforms your computer creations into real, tangible wonders. Make your projects prettier with the power of our printers!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709871832/AU-T-2277-Chinese-New-Year-Paper-Lantern-Craft-Activity_lbuqha.png'],
  },
  a3Printer: {
    title: 'A3 Printer',
    contents: ["An A3 printer is like a superhero with an extra-large canvas! With a few clicks, this larger-than-life printer turns your digital dreams into A3-sized wonders, making your ideas stand out and shine. It's the creative ally that adds an extra dose of wow to your imagination! 🌟🖨️"],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709872028/download_1_as9iin.png'],
  },
  cocoon: {
    title: 'Cocoon Corner',
    contents: ["Welcome to our Cocoon Corner, where the magic of stories comes to life! It's like a secret hideaway where kids can dive into the enchanting world of books, away from the hustle and bustle of the tinkering studio.", "In this snug nook, the chaos of the tinkering studio transforms into a symphony of imagination. It's the perfect spot to let your mind soar into the realms of adventures, mysteries, and fantastical lands."],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709860767/photo_4_2024-03-08_09-19-03_dlncg2.jpg'],
  },
  birthdayCake: {
    title: 'Throwback to Our First Birthday!',
    contents: ['It seemed so long ago when we were just starting out and had a blast celebrating our first birthday! Yet today we stand here excited for the new opportunities and journey we can take with our fellow Vivinauts with our very own space!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709873106/photo_2024-03-08_12-39-42_aczbq0.jpg'],
  },
  noticeBoard: {
    title: 'What is happening in our Tinkering Studio today!',
    contents: ['Take a look around our space and try out our events which are specially catered for you! Discover new possibilities with Vivita in Vivistop Kampong Eunos!', 'For more information, please refer to the brochure handed to you during registration or approach our friendly crews!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709874384/Untitled_design_19_1_kbw3dl.png'],
  },
  greatWaterCupRace: {
    title: 'Great Water Cup Race',
    contents: ['Take part in the great water cup race and see how you can create a fun and creative way to transport your vessel of water while navigating an obstacle course!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709881123/gwcr_rpwnaf.png'],
  },
  fiveStones: {
    title: 'Five Stones',
    contents: ['Work together as a team to achieve the impossible! Strategize to get all five stones in the air at once and catch them all!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709880991/five_stones_dz3tti.png'],
  },
  chaptek: {
    title: 'Chaptek',
    contents: ['It’s time to move your body, keep the chaptek in the air for as long as you can without it dropping. Let’s get kicking!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709880989/chapteh_edc5wk.png'],
  },
  snakesAndLadders: {
    title: 'Snakes and Ladders',
    contents: ['Dive into this old school classic and race to the top. You know the drill, climb the ladders and avoid the snakes!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709880989/snake_azjtdv.png'],
  },
  woodenTop: {
    title: 'Wooden Tops',
    contents: ['Battle it out and see who reigns champion. Or be the longest surviving spinning top in the arena!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709880989/wooden_top_l86euq.png'],
  },
  pickUpSticks: {
    title: 'Pick Up Sticks',
    contents: ['Form a team and work together to pick up all the sticks without moving the other sticks to win the game!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709880989/pick_up_sticks_n2fa6p.png'],
  },
  vivitaSign: {
    title: 'In the beginning...',
    contents: ['Have you spotted our very first signboard created before we moved into Scape! What a journey it has been!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709886939/photo_2024-03-08_16-34-12_anljoh.png'],
  },
  fakeFood: {
    title: 'Fake Food',
    contents: ['Have you ever wondered how people create such cute food models on Instagram? Come down to our Fake Food section and make one of your own!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709892392/fake_food_qrn17a.png'],
  },
  tessalations: {
    title: 'Tesellations',
    contents: ['Come explore the intricacies of patterns as you experiment and develop a pattern you can call your own!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709892393/tesellation_er4ajf.png'],
  },
  viviwarePanel: {
    title: 'Viviware Panel Exhibition',
    contents: ['Ever wondered how our tables and chairs are held together? Come down to check out how it is done with a plethora of new 3d printed accessories that can elevate the experience of owning a furniture'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709892393/viviware_panel_iutx7g.png'],
  },
  roboway: {
    title: 'Roboway',
    contents: ['Coming build a robot car using Viviware Cell, an elegant and fully functional robotics software and hardware system!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709892392/roboway_wdt93l.png'],
  },
  merch: {
    title: 'Vivita Merch Station',
    contents: ['Do you want to create your own shirt? Now is the time! Head up to the Tinkering Studio and sign up with our friendly crew to do so!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/s--Wvnd_Scs--/v1709931293/Screenshot_2024-03-09_at_4.53.24_AM_vtgmr5.png'],
  },
  studio: {
    title: 'Vivistudio',
    contents: ['Vivistudio is a place for Vivinauts to develop their producer dreams as they learn to produce their music, try being a YouTuber in a safe space!'],
    videoUrls: ['https://www.youtube.com/embed/XJhKxvoYP7M'],
  },
  communityWall: {
    title: 'Community Wall',
    contents: ['Come participate in a thought provoking conversations with others in the space, as you read and write about your views on creativity!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709892391/community_wbcp5f.png'],
  },
  cake: {
    title: 'Cake for our Second Birthday',
    contents: ['To wish us a happy birthday, our Vivinaut and our crew jointly created a clay baked (inedible) cake!'],
    projectIds: [463],
  },
  mickey: {
    title: 'Mickey T-shirt',
    contents: ['To make a shirt from scratch, this Vivianut used canvas to create the image before heat pressing it to transfer the image on to a T -shirt'],
    projectIds: [74],
  },
  marbleRun: {
    title: 'Marble Run',
    contents: ['This Vivinaut has made the very first marble run using cardboard as a material of choice to show that one can do a cool project using easily accessible yet basic materials. The marble run is made totally out of Meiji cracker cartons. How cool is that?'],
    projectIds: [458],
  },
  deer: {
    title: 'Hand sewn tiny felt deer',
    contents: ['Inspired to make a tiny cute deer, this Vivinaut took the chance to learn how to sew!'],
    projectIds: [492],
  },
  blossom: {
    title: 'Cherry Blossom',
    contents: ['Inspired by another Vivinaut building an ancient house with a tree coming out of the roof, this VIvinaut thought, hey, what if I did a sculpture of a tree 🌳? And so he/she did!'],
    projectIds: [1201],
  },
  cardboardAutomata: {
    title: 'Cardboard Automata',
    contents: ['As part of a workshop, this Vivinaut had the opportunity to create a soldier automata using only cardboard and straws!'],
    projectIds: [828],
  },
  scratch: {
    title: 'Scratch game',
    contents: ['This Vivinaut created a game using Scratch! Come experience the game through this link: https://scratch.mit.edu/projects/446022325/ '],
    projectIds: [69],
  },
  rabbit: {
    title: 'Rabbit Pencil Box',
    contents: ['Come take a look at the cute Rabbit Pencil Box made by our Vivinaut using recycled bottles!'],
    projectIds: [1262],
  },
  viviwarePanels: {
    title: 'Viviware Panels',
    contents: ['A modular panel system which allows for simple and quick assembly and reconfiguration into furniture, toy or a tool. We are on a mission to empower anybody to be builders of better spaces to live, work and play in. Together with an ever-expanding library of accessories, VIVIWARE Panel’s possibilities are endless.'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709896804/WhatsApp_Image_2024-01-14_at_15.41.44_8c39fc69_edojsp.jpg'],
  },
  snacks: {
    title: 'Snacks Station',
    contents: ["Let's transport ourselves back in time and indulge in some nostalgic snacks! Treat yourself to delightful goodies like biscuits and ice cream, and let your taste buds dance with joy!"],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/v1709913172/snacks_dbkksb.png'],
  },
  recyclingCorner: {
    title: 'Upcycling Corner',
    contents: ["The Upcycling Corner at our makerspace isn't just about repurposing materials; it's about building a thriving community centered around sustainability and creativity. Here, members come together to share ideas, collaborate on projects, and support one another's creative endeavors. Through this collective effort, we're not only transforming waste into innovative creations but also forging meaningful connections and fostering a sense of belonging within our community."],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/s--Z86b6lmN--/c_scale,w_2048/v1709910455/IMG_2272_wjibty.jpg'],
  },
  electronicCorner: {
    title: 'Electronic Corner',
    contents: ["Welcome to the Electronics Corner! Among laptops and Wacom tablets, discover Arduino microcontrollers for limitless projects and Viviware cells pioneering wearable tech. Join our community of tech enthusiasts, whether you're a seasoned pro or a curious newcomer, and embark on your electrifying journey of discovery."],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/s--vjXy94nW--/c_scale,w_2048/v1709910464/IMG_2270_kkmyl5.jpg'],
  },
  sewingCorner: {
    title: 'Sewing Corner',
    contents: ['Believe it or not, this is the most popular station in our VIVISTOP (including among our male VIVINAUTs)! Our VIVINAUTs really love making custom merchandise for their friends and family members. Some of the unique items made here include:',
      '1) Mittens for baby brother',
      '2) Gloves for mum',
      '3) Custom made hoodie with self-drawn insignia/illustration',
      '4) Crochet character plushies and fake food',
      '5) Self-sewn K-pop merchandise',
      'The list goes on!'],
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/s--I-xXLBA1--/c_scale,w_2048/v1709910456/IMG_2269_gnrjut.jpg'],
  },
  galleryWall: {
    title: 'What is VIVITA?',
    subtitle: 'Explore the world of VIVITA at our Level 1 gallery! Dive into interactive exhibits, workshops, and unleash your creativity in a captivating environment. Join us and discover endless possibilities!',
    images: ['https://res.cloudinary.com/viviboomstaging/image/upload/s--UvRsxWsi--/c_crop,h_1716,w_4032/v1709910452/IMG_2273_dsb08f.jpg'],
  },
  yellowCar: {
    title: 'Parking Lots',
    subtitle: 'Watch out for moving cars!',
    images: [yellowCar],
  },
  greenCar: {
    title: 'Parking Lots',
    subtitle: 'Watch out for moving cars!',
    images: [greenCar],
  },
  registration: {
    title: 'Join Vivita as a member!',
    contents: ['We asked ourselves, how do we accelerate youth’s ideas and creativity? By removing the limits of a structured curriculum, Vivita is building a community of self-directed learners where each youth is free to experiment with various ideas and explore new  skills without the fear of failure. We’re providing the rocket fuel to accelerate their ideas and creativity!',
      'Our only sign up requirement: ',
      '1. Be between the ages of 9 – 15',
      '2. DARE TO EXPLORE & JUST DO IT spirit!',
    ],
    link: 'https://vivita.sg/join-vivita/',
  },
};
